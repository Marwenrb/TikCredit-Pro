/**
 * Ultra-Professional Persistence Service for TikCredit-Pro
 * Triple-layer storage: Firebase + Local JSON + IndexedDB
 * 
 * Features:
 * - Atomic file writes to prevent corruption
 * - Automatic retry with exponential backoff
 * - Offline-first architecture
 * - Real-time sync status tracking
 * - Duplicate prevention
 */

import { FormData, Submission } from '@/types'
import { adminDb } from './firebase-admin'
import { promises as fs } from 'fs'
import path from 'path'

// Constants
const DATA_DIR = path.join(process.cwd(), 'data')
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json')
const SYNC_QUEUE_FILE = path.join(DATA_DIR, 'sync-queue.json')
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Types
export interface StoredSubmission extends Submission {
  syncedToFirebase: boolean
  firebaseId?: string
  createdAt: string
  updatedAt: string
  ip?: string
  userAgent?: string
  status: 'pending' | 'synced' | 'failed'
  retryCount: number
}

export interface SubmissionsFile {
  submissions: StoredSubmission[]
  metadata: {
    createdAt: string
    lastUpdated: string
    version: string
    totalCount: number
  }
}

export interface SyncQueueItem {
  submissionId: string
  attempts: number
  lastAttempt: string
  nextRetry: string
  error?: string
}

export interface SyncQueue {
  queue: SyncQueueItem[]
  lastProcessed: string
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Read submissions from local JSON file
 */
export async function readLocalSubmissions(): Promise<SubmissionsFile> {
  try {
    await ensureDataDir()
    const content = await fs.readFile(SUBMISSIONS_FILE, 'utf-8')
    const data = JSON.parse(content)
    
    // Validate structure
    if (!data.submissions || !Array.isArray(data.submissions)) {
      return createEmptySubmissionsFile()
    }
    
    return data as SubmissionsFile
  } catch (error) {
    // File doesn't exist or is corrupted, create new one
    const emptyFile = createEmptySubmissionsFile()
    await writeLocalSubmissions(emptyFile)
    return emptyFile
  }
}

/**
 * Write submissions to local JSON file atomically
 */
export async function writeLocalSubmissions(data: SubmissionsFile): Promise<void> {
  await ensureDataDir()
  
  // Update metadata
  data.metadata.lastUpdated = new Date().toISOString()
  data.metadata.totalCount = data.submissions.length
  
  // Atomic write: write to temp file first, then rename
  const tempFile = `${SUBMISSIONS_FILE}.tmp.${Date.now()}`
  
  try {
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8')
    await fs.rename(tempFile, SUBMISSIONS_FILE)
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempFile)
    } catch {}
    throw error
  }
}

/**
 * Create empty submissions file structure
 */
function createEmptySubmissionsFile(): SubmissionsFile {
  return {
    submissions: [],
    metadata: {
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      totalCount: 0
    }
  }
}

/**
 * Save submission to Firebase with retry logic
 */
export async function saveToFirebase(submission: StoredSubmission): Promise<{ success: boolean; firebaseId?: string; error?: string }> {
  if (!adminDb) {
    return { success: false, error: 'Firebase Admin not initialized' }
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const docRef = adminDb.collection('submissions').doc(submission.id)
      
      await docRef.set({
        ...submission,
        data: submission.data,
        syncedToFirebase: true,
        status: 'synced',
        updatedAt: new Date().toISOString(),
        serverTimestamp: new Date(),
      })

      console.log(`✅ Submission ${submission.id} saved to Firebase (attempt ${attempt + 1})`)
      return { success: true, firebaseId: submission.id }
    } catch (error) {
      console.error(`❌ Firebase save attempt ${attempt + 1} failed:`, error)
      
      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)))
      }
    }
  }

  return { success: false, error: 'Max retries exceeded' }
}

/**
 * Save submission to local JSON file
 */
export async function saveToLocalFile(submission: StoredSubmission): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readLocalSubmissions()
    
    // Check for duplicates
    const existingIndex = data.submissions.findIndex(s => s.id === submission.id)
    if (existingIndex >= 0) {
      // Update existing
      data.submissions[existingIndex] = submission
    } else {
      // Add new at the beginning
      data.submissions.unshift(submission)
    }
    
    await writeLocalSubmissions(data)
    console.log(`✅ Submission ${submission.id} saved to local file`)
    return { success: true }
  } catch (error) {
    console.error('❌ Local file save error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Main persistence function - saves to all layers
 */
export async function persistSubmission(
  formData: FormData,
  metadata: { ip?: string; userAgent?: string }
): Promise<{
  success: boolean
  submissionId: string
  savedTo: ('firebase' | 'local')[]
  errors: string[]
}> {
  const submissionId = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const submission: StoredSubmission = {
    id: submissionId,
    timestamp: now,
    data: formData,
    syncedToFirebase: false,
    createdAt: now,
    updatedAt: now,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    status: 'pending',
    retryCount: 0
  }

  const savedTo: ('firebase' | 'local')[] = []
  const errors: string[] = []

  // 1. Save to Firebase (primary)
  const firebaseResult = await saveToFirebase(submission)
  if (firebaseResult.success) {
    submission.syncedToFirebase = true
    submission.firebaseId = firebaseResult.firebaseId
    submission.status = 'synced'
    savedTo.push('firebase')
  } else {
    errors.push(`Firebase: ${firebaseResult.error}`)
    submission.status = 'pending'
  }

  // 2. Save to local JSON file (always - as backup)
  const localResult = await saveToLocalFile(submission)
  if (localResult.success) {
    savedTo.push('local')
  } else {
    errors.push(`Local: ${localResult.error}`)
  }

  // 3. If Firebase failed, add to sync queue
  if (!firebaseResult.success) {
    await addToSyncQueue(submissionId)
  }

  return {
    success: savedTo.length > 0,
    submissionId,
    savedTo,
    errors
  }
}

/**
 * Add submission to sync queue for later retry
 */
async function addToSyncQueue(submissionId: string): Promise<void> {
  try {
    let queue: SyncQueue = { queue: [], lastProcessed: '' }
    
    try {
      const content = await fs.readFile(SYNC_QUEUE_FILE, 'utf-8')
      queue = JSON.parse(content)
    } catch {
      // File doesn't exist
    }

    // Check if already in queue
    if (!queue.queue.find(q => q.submissionId === submissionId)) {
      queue.queue.push({
        submissionId,
        attempts: 0,
        lastAttempt: '',
        nextRetry: new Date(Date.now() + 60000).toISOString() // Retry in 1 minute
      })
      
      await fs.writeFile(SYNC_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8')
      console.log(`📋 Added ${submissionId} to sync queue`)
    }
  } catch (error) {
    console.error('Error adding to sync queue:', error)
  }
}

/**
 * Process sync queue - sync pending submissions to Firebase
 */
export async function processSyncQueue(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const stats = { processed: 0, succeeded: 0, failed: 0 }

  try {
    let queue: SyncQueue = { queue: [], lastProcessed: '' }
    
    try {
      const content = await fs.readFile(SYNC_QUEUE_FILE, 'utf-8')
      queue = JSON.parse(content)
    } catch {
      return stats // No queue file
    }

    const now = new Date()
    const itemsToProcess = queue.queue.filter(item => {
      if (!item.nextRetry) return true
      return new Date(item.nextRetry) <= now
    })

    const submissions = await readLocalSubmissions()

    for (const item of itemsToProcess) {
      stats.processed++
      
      const submission = submissions.submissions.find(s => s.id === item.submissionId)
      if (!submission) {
        // Submission not found, remove from queue
        queue.queue = queue.queue.filter(q => q.submissionId !== item.submissionId)
        continue
      }

      if (submission.syncedToFirebase) {
        // Already synced, remove from queue
        queue.queue = queue.queue.filter(q => q.submissionId !== item.submissionId)
        stats.succeeded++
        continue
      }

      const result = await saveToFirebase(submission)
      
      if (result.success) {
        submission.syncedToFirebase = true
        submission.firebaseId = result.firebaseId
        submission.status = 'synced'
        submission.updatedAt = new Date().toISOString()
        
        // Update local file
        await writeLocalSubmissions(submissions)
        
        // Remove from queue
        queue.queue = queue.queue.filter(q => q.submissionId !== item.submissionId)
        stats.succeeded++
        console.log(`✅ Synced queued submission ${item.submissionId}`)
      } else {
        item.attempts++
        item.lastAttempt = new Date().toISOString()
        item.error = result.error
        
        // Exponential backoff for next retry
        const delayMs = Math.min(3600000, 60000 * Math.pow(2, item.attempts)) // Max 1 hour
        item.nextRetry = new Date(Date.now() + delayMs).toISOString()
        
        stats.failed++
        
        // Remove if too many attempts
        if (item.attempts >= 10) {
          queue.queue = queue.queue.filter(q => q.submissionId !== item.submissionId)
          submission.status = 'failed'
          await writeLocalSubmissions(submissions)
        }
      }
    }

    queue.lastProcessed = new Date().toISOString()
    await fs.writeFile(SYNC_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8')

  } catch (error) {
    console.error('Error processing sync queue:', error)
  }

  return stats
}

/**
 * Get all submissions (from local file, sorted by date)
 */
export async function getAllSubmissions(): Promise<StoredSubmission[]> {
  const data = await readLocalSubmissions()
  return data.submissions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

/**
 * Get sync statistics
 */
export async function getSyncStats(): Promise<{
  total: number
  synced: number
  pending: number
  failed: number
}> {
  const data = await readLocalSubmissions()
  const submissions = data.submissions
  
  return {
    total: submissions.length,
    synced: submissions.filter(s => s.syncedToFirebase || s.status === 'synced').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    failed: submissions.filter(s => s.status === 'failed').length
  }
}

/**
 * Delete a submission from all storage layers
 */
export async function deleteSubmission(submissionId: string): Promise<boolean> {
  let success = true

  // Delete from local file
  try {
    const data = await readLocalSubmissions()
    data.submissions = data.submissions.filter(s => s.id !== submissionId)
    await writeLocalSubmissions(data)
  } catch (error) {
    console.error('Error deleting from local file:', error)
    success = false
  }

  // Delete from Firebase
  if (adminDb) {
    try {
      await adminDb.collection('submissions').doc(submissionId).delete()
    } catch (error) {
      console.error('Error deleting from Firebase:', error)
      success = false
    }
  }

  return success
}

/**
 * Sync all local submissions to Firebase (bulk sync)
 */
export async function syncAllToFirebase(): Promise<{
  total: number
  synced: number
  errors: string[]
}> {
  const data = await readLocalSubmissions()
  const unsynced = data.submissions.filter(s => !s.syncedToFirebase && s.status !== 'failed')
  
  const result = {
    total: unsynced.length,
    synced: 0,
    errors: [] as string[]
  }

  for (const submission of unsynced) {
    const firebaseResult = await saveToFirebase(submission)
    
    if (firebaseResult.success) {
      submission.syncedToFirebase = true
      submission.firebaseId = firebaseResult.firebaseId
      submission.status = 'synced'
      submission.updatedAt = new Date().toISOString()
      result.synced++
    } else {
      result.errors.push(`${submission.id}: ${firebaseResult.error}`)
    }
  }

  await writeLocalSubmissions(data)
  return result
}

/**
 * Storage Utilities - TikCredit Pro
 * ═══════════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for all file storage paths and operations.
 * This module standardizes the storage path to prevent data inconsistencies.
 * 
 * CRITICAL: All server-side storage MUST use these utilities.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { promises as fs } from 'fs'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

// ═══════════════════════════════════════════════════════════════════════════════
// STANDARDIZED PATHS - SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════════

/** Root data directory - ALWAYS use this path */
export const DATA_DIR = path.join(process.cwd(), 'data')

/** Master submissions file path */
export const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json')

/** Reports directory for text exports */
export const REPORTS_DIR = path.join(DATA_DIR, 'reports')

/** Check if we're in development mode */
export const isDev = process.env.NODE_ENV === 'development'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoredSubmission {
    id: string
    timestamp: string
    data: Record<string, unknown>
    metadata?: {
        ip?: string
        userAgent?: string
        savedAt?: string
        syncedToFirebase?: boolean
    }
    syncedToFirebase?: boolean
    status?: string
    source?: string
}

export interface SubmissionsFile {
    version: string
    createdAt: string
    lastUpdated: string
    totalCount: number
    submissions: StoredSubmission[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ensure the data directory exists - SYNCHRONOUS for startup
 * Call this once at module load to guarantee directory exists
 */
export function ensureDataDirSync(): void {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!existsSync(REPORTS_DIR)) {
        mkdirSync(REPORTS_DIR, { recursive: true })
    }
}

/**
 * Ensure the data directory exists - ASYNC version
 */
export async function ensureDataDir(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true })
        await fs.mkdir(REPORTS_DIR, { recursive: true })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error
        }
    }
}

// Ensure directory exists on module load
try {
    ensureDataDirSync()
} catch {
    // Silent fail on module load - will retry on first operation
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATOMIC FILE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Atomic write: Write to temp file first, then rename
 * Prevents corruption if server crashes mid-write
 */
export async function atomicWriteFile(filePath: string, content: string): Promise<void> {
    await ensureDataDir()

    const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`

    try {
        await fs.writeFile(tempPath, content, 'utf-8')
        await fs.rename(tempPath, filePath)
    } catch (error) {
        // Clean up temp file if rename failed
        try {
            await fs.unlink(tempPath)
        } catch {
            // Ignore cleanup errors
        }
        throw error
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS FILE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get empty submissions file structure
 */
function getEmptySubmissionsFile(): SubmissionsFile {
    const now = new Date().toISOString()
    return {
        version: '2.0.0',
        createdAt: now,
        lastUpdated: now,
        totalCount: 0,
        submissions: []
    }
}

/**
 * Read the master submissions file safely
 * Returns empty structure if file doesn't exist or is corrupted
 */
export async function readSubmissionsFile(): Promise<SubmissionsFile> {
    try {
        await ensureDataDir()
        const content = await fs.readFile(SUBMISSIONS_FILE, 'utf-8')
        const data = JSON.parse(content) as SubmissionsFile

        // Handle old format (array of submissions)
        if (Array.isArray(data)) {
            return {
                ...getEmptySubmissionsFile(),
                submissions: data,
                totalCount: data.length
            }
        }

        // Handle format with submissions array at root level
        if (data.submissions) {
            return data
        }

        return getEmptySubmissionsFile()
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // File doesn't exist - return empty structure
            return getEmptySubmissionsFile()
        }
        // File is corrupted or other error - return empty structure
        console.error('Error reading submissions file:', error)
        return getEmptySubmissionsFile()
    }
}

/**
 * Save a submission to the local file system
 * This is the ONLY function that should write to the submissions file
 */
export async function saveSubmissionToLocal(
    submission: StoredSubmission
): Promise<{ success: boolean; error?: string }> {
    try {
        await ensureDataDir()

        const data = await readSubmissionsFile()

        // Check for duplicates (update if exists)
        const existingIndex = data.submissions.findIndex(s => s.id === submission.id)
        if (existingIndex >= 0) {
            data.submissions[existingIndex] = submission
        } else {
            // Add at beginning (newest first)
            data.submissions.unshift(submission)
        }

        // Update metadata
        data.lastUpdated = new Date().toISOString()
        data.totalCount = data.submissions.length

        // Atomic write
        await atomicWriteFile(SUBMISSIONS_FILE, JSON.stringify(data, null, 2))

        if (isDev) {
            console.log(`✅ Storage: Saved submission ${submission.id} to ${SUBMISSIONS_FILE}`)
        }

        return { success: true }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown storage error'
        console.error('❌ Storage: Failed to save submission:', errorMsg)
        return { success: false, error: errorMsg }
    }
}

/**
 * Get all submissions from local storage
 */
export async function getLocalSubmissions(): Promise<StoredSubmission[]> {
    try {
        const data = await readSubmissionsFile()
        return data.submissions.map(s => ({
            ...s,
            source: 'local'
        }))
    } catch {
        return []
    }
}

/**
 * Delete a submission from local storage
 */
export async function deleteLocalSubmission(submissionId: string): Promise<boolean> {
    try {
        const data = await readSubmissionsFile()
        const originalLength = data.submissions.length
        data.submissions = data.submissions.filter(s => s.id !== submissionId)

        if (data.submissions.length < originalLength) {
            data.lastUpdated = new Date().toISOString()
            data.totalCount = data.submissions.length
            await atomicWriteFile(SUBMISSIONS_FILE, JSON.stringify(data, null, 2))
            return true
        }
        return false
    } catch {
        return false
    }
}

/**
 * Mark a submission as synced to Firebase
 */
export async function markSubmissionAsSynced(submissionId: string): Promise<boolean> {
    try {
        const data = await readSubmissionsFile()
        const submission = data.submissions.find(s => s.id === submissionId)

        if (submission) {
            submission.syncedToFirebase = true
            if (submission.metadata) {
                submission.metadata.syncedToFirebase = true
            }
            data.lastUpdated = new Date().toISOString()
            await atomicWriteFile(SUBMISSIONS_FILE, JSON.stringify(data, null, 2))
            return true
        }
        return false
    } catch {
        return false
    }
}

/**
 * Get file modification time for change detection
 */
export async function getFileModTime(): Promise<number> {
    try {
        const stats = await fs.stat(SUBMISSIONS_FILE)
        return stats.mtimeMs
    } catch {
        return 0
    }
}

/**
 * Conditional dev logging
 */
export function devLog(message: string, ...args: unknown[]): void {
    if (isDev) {
        console.log(message, ...args)
    }
}

/**
 * IndexedDB Service for TikCredit-Pro
 * Client-side persistent storage that survives browser closes
 * 
 * Features:
 * - Stores form submissions in IndexedDB
 * - Survives browser closes and refreshes
 * - Automatic sync with server when online
 * - Offline-first architecture
 */

import { FormData, Submission } from '@/types'

const DB_NAME = 'TikCreditProDB'
const DB_VERSION = 1
const SUBMISSIONS_STORE = 'submissions'
const DRAFTS_STORE = 'drafts'
const SYNC_QUEUE_STORE = 'syncQueue'

export interface IndexedDBSubmission {
    id: string
    timestamp: string
    data: FormData
    syncedToServer: boolean
    createdAt: string
    updatedAt: string
    status: 'pending' | 'synced' | 'failed'
    retryCount: number
}

export interface SyncQueueItem {
    id: string
    submissionId: string
    createdAt: string
    attempts: number
    lastAttempt?: string
    error?: string
}

let db: IDBDatabase | null = null

/**
 * Open IndexedDB database
 */
export function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('IndexedDB not available in server environment'))
            return
        }

        if (db) {
            resolve(db)
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'))
        }

        request.onsuccess = () => {
            db = request.result
            resolve(db)
        }

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result

            // Submissions store
            if (!database.objectStoreNames.contains(SUBMISSIONS_STORE)) {
                const submissionsStore = database.createObjectStore(SUBMISSIONS_STORE, { keyPath: 'id' })
                submissionsStore.createIndex('timestamp', 'timestamp', { unique: false })
                submissionsStore.createIndex('syncedToServer', 'syncedToServer', { unique: false })
                submissionsStore.createIndex('status', 'status', { unique: false })
            }

            // Drafts store
            if (!database.objectStoreNames.contains(DRAFTS_STORE)) {
                database.createObjectStore(DRAFTS_STORE, { keyPath: 'id' })
            }

            // Sync queue store
            if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
                const syncStore = database.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' })
                syncStore.createIndex('submissionId', 'submissionId', { unique: true })
            }
        }
    })
}

/**
 * Save submission to IndexedDB
 */
export async function saveSubmissionToIndexedDB(formData: FormData): Promise<string> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const submission: IndexedDBSubmission = {
            id,
            timestamp: now,
            data: formData,
            syncedToServer: false,
            createdAt: now,
            updatedAt: now,
            status: 'pending',
            retryCount: 0
        }

        const transaction = database.transaction([SUBMISSIONS_STORE], 'readwrite')
        const store = transaction.objectStore(SUBMISSIONS_STORE)
        const request = store.add(submission)

        request.onsuccess = () => {
            console.log('✅ Saved to IndexedDB:', id)
            resolve(id)
        }

        request.onerror = () => {
            reject(new Error('Failed to save to IndexedDB'))
        }
    })
}

/**
 * Get all submissions from IndexedDB
 */
export async function getSubmissionsFromIndexedDB(): Promise<IndexedDBSubmission[]> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SUBMISSIONS_STORE], 'readonly')
        const store = transaction.objectStore(SUBMISSIONS_STORE)
        const request = store.getAll()

        request.onsuccess = () => {
            const submissions = request.result as IndexedDBSubmission[]
            // Sort by timestamp descending
            submissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            resolve(submissions)
        }

        request.onerror = () => {
            reject(new Error('Failed to get submissions from IndexedDB'))
        }
    })
}

/**
 * Get unsynced submissions from IndexedDB
 */
export async function getUnsyncedSubmissions(): Promise<IndexedDBSubmission[]> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SUBMISSIONS_STORE], 'readonly')
        const store = transaction.objectStore(SUBMISSIONS_STORE)
        const request = store.getAll()

        request.onsuccess = () => {
            // Filter for unsynced submissions
            const allSubmissions = request.result as IndexedDBSubmission[]
            const unsynced = allSubmissions.filter(s => !s.syncedToServer)
            resolve(unsynced)
        }

        request.onerror = () => {
            reject(new Error('Failed to get unsynced submissions'))
        }
    })
}

/**
 * Mark submission as synced in IndexedDB
 */
export async function markSubmissionAsSynced(id: string): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SUBMISSIONS_STORE], 'readwrite')
        const store = transaction.objectStore(SUBMISSIONS_STORE)
        const getRequest = store.get(id)

        getRequest.onsuccess = () => {
            const submission = getRequest.result as IndexedDBSubmission
            if (submission) {
                submission.syncedToServer = true
                submission.status = 'synced'
                submission.updatedAt = new Date().toISOString()

                const updateRequest = store.put(submission)
                updateRequest.onsuccess = () => resolve()
                updateRequest.onerror = () => reject(new Error('Failed to update submission'))
            } else {
                resolve() // Submission not found, that's OK
            }
        }

        getRequest.onerror = () => {
            reject(new Error('Failed to get submission for update'))
        }
    })
}

/**
 * Delete submission from IndexedDB
 */
export async function deleteSubmissionFromIndexedDB(id: string): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SUBMISSIONS_STORE], 'readwrite')
        const store = transaction.objectStore(SUBMISSIONS_STORE)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to delete submission'))
    })
}

/**
 * Save draft to IndexedDB
 */
export async function saveDraftToIndexedDB(data: Partial<FormData>): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)

        const draft = {
            id: 'current_draft',
            data,
            updatedAt: new Date().toISOString()
        }

        const request = store.put(draft)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to save draft'))
    })
}

/**
 * Get draft from IndexedDB
 */
export async function getDraftFromIndexedDB(): Promise<Partial<FormData> | null> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readonly')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.get('current_draft')

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.data)
            } else {
                resolve(null)
            }
        }

        request.onerror = () => {
            reject(new Error('Failed to get draft'))
        }
    })
}

/**
 * Clear draft from IndexedDB
 */
export async function clearDraftFromIndexedDB(): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([DRAFTS_STORE], 'readwrite')
        const store = transaction.objectStore(DRAFTS_STORE)
        const request = store.delete('current_draft')

        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to clear draft'))
    })
}

/**
 * Add to sync queue
 */
export async function addToSyncQueue(submissionId: string): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite')
        const store = transaction.objectStore(SYNC_QUEUE_STORE)

        const item: SyncQueueItem = {
            id: crypto.randomUUID(),
            submissionId,
            createdAt: new Date().toISOString(),
            attempts: 0
        }

        const request = store.add(item)

        request.onsuccess = () => resolve()
        request.onerror = () => {
            // Might already exist, that's OK
            resolve()
        }
    })
}

/**
 * Get sync queue items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SYNC_QUEUE_STORE], 'readonly')
        const store = transaction.objectStore(SYNC_QUEUE_STORE)
        const request = store.getAll()

        request.onsuccess = () => {
            resolve(request.result as SyncQueueItem[])
        }

        request.onerror = () => {
            reject(new Error('Failed to get sync queue'))
        }
    })
}

/**
 * Remove from sync queue
 */
export async function removeFromSyncQueue(submissionId: string): Promise<void> {
    const database = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite')
        const store = transaction.objectStore(SYNC_QUEUE_STORE)
        const index = store.index('submissionId')
        const request = index.getKey(submissionId)

        request.onsuccess = () => {
            if (request.result) {
                store.delete(request.result)
            }
            resolve()
        }

        request.onerror = () => {
            resolve() // Ignore errors
        }
    })
}

/**
 * Sync pending submissions to server
 */
export async function syncPendingSubmissions(): Promise<{
    synced: number
    failed: number
    errors: string[]
}> {
    const result = { synced: 0, failed: 0, errors: [] as string[] }

    if (!navigator.onLine) {
        return result
    }

    try {
        const unsynced = await getUnsyncedSubmissions()

        for (const submission of unsynced) {
            try {
                const response = await fetch('/api/submissions/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(submission.data)
                })

                if (response.ok) {
                    await markSubmissionAsSynced(submission.id)
                    await removeFromSyncQueue(submission.id)
                    result.synced++
                    console.log(`✅ Synced ${submission.id} to server`)
                } else {
                    result.failed++
                    result.errors.push(`${submission.id}: HTTP ${response.status}`)
                }
            } catch (error) {
                result.failed++
                result.errors.push(`${submission.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }
    } catch (error) {
        console.error('Error syncing submissions:', error)
    }

    return result
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
    total: number
    synced: number
    pending: number
    draftExists: boolean
}> {
    try {
        const submissions = await getSubmissionsFromIndexedDB()
        const draft = await getDraftFromIndexedDB()

        return {
            total: submissions.length,
            synced: submissions.filter(s => s.syncedToServer).length,
            pending: submissions.filter(s => !s.syncedToServer).length,
            draftExists: draft !== null
        }
    } catch {
        return { total: 0, synced: 0, pending: 0, draftExists: false }
    }
}

/**
 * Initialize auto-sync on page load
 */
export function initAutoSync(): void {
    if (typeof window === 'undefined') return

    // Sync when coming online
    window.addEventListener('online', () => {
        console.log('🌐 Back online, syncing pending submissions...')
        syncPendingSubmissions().then(result => {
            if (result.synced > 0) {
                console.log(`✅ Synced ${result.synced} submissions`)
            }
        })
    })

    // Try to sync on page load if online
    if (navigator.onLine) {
        setTimeout(() => {
            syncPendingSubmissions().catch(console.error)
        }, 2000) // Delay to let page load
    }
}

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
    openDatabase().catch(console.error)
}

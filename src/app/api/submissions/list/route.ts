import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  DATA_DIR,
  SUBMISSIONS_FILE,
  readSubmissionsFile,
  deleteLocalSubmission as deleteFromStorage,
  getLocalSubmissions,
  isDev
} from '@/lib/storage-utils'

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL: Force dynamic rendering to prevent stale data
// ═══════════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/submissions/list
 * Protected endpoint - requires admin authentication
 * Returns submissions from local storage (primary) + Firebase (when available)
 */

// Using types from storage-utils
type StoredSubmission = {
  id: string
  timestamp: string
  data: Record<string, unknown>
  syncedToFirebase?: boolean
  status?: string
  source?: string
  metadata?: {
    ip?: string
    userAgent?: string
    savedAt?: string
    syncedToFirebase?: boolean
  }
}


export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    let submissions: StoredSubmission[] = []
    let source: 'firebase' | 'local' | 'combined' = 'local'
    let firebaseCount = 0
    let localCount = 0

    // 1. Get submissions from local JSON file FIRST (always available)
    const localSubmissions = await getLocalSubmissions() as StoredSubmission[]
    localCount = localSubmissions.length

    if (isDev && localCount > 0) {
      console.log(`✅ Loaded ${localCount} submissions from local storage`)
    }

    // 2. Try Firebase (optional, may fail)
    try {
      const { adminDb } = await import('@/lib/firebase-admin')

      if (adminDb) {
        const snapshot = await adminDb
          .collection('submissions')
          .orderBy('timestamp', 'desc')
          .limit(500)
          .get()

        const firebaseSubmissions = snapshot.docs.map(doc => {
          const docData = doc.data()
          return {
            id: doc.id,
            timestamp: docData.timestamp || docData.createdAt,
            data: docData.data || {
              fullName: docData.fullName,
              phone: docData.phone,
              email: docData.email,
              wilaya: docData.wilaya,
              financingType: docData.financingType,
              requestedAmount: docData.requestedAmount,
              salaryReceiveMethod: docData.salaryReceiveMethod,
              monthlyIncomeRange: docData.monthlyIncomeRange,
              isExistingCustomer: docData.isExistingCustomer,
              preferredContactTime: docData.preferredContactTime,
              profession: docData.profession,
              customProfession: docData.customProfession,
              loanDuration: docData.loanDuration,
              notes: docData.notes,
            },
            syncedToFirebase: true,
            status: docData.status || 'synced',
            source: 'firebase' as const
          }
        })

        firebaseCount = firebaseSubmissions.length

        if (isDev && firebaseCount > 0) {
          console.log(`✅ Loaded ${firebaseCount} submissions from Firebase`)
        }

        // Merge: Firebase submissions take priority for duplicates
        const firebaseIds = new Set(firebaseSubmissions.map((s: StoredSubmission) => s.id))
        const uniqueLocalSubs = localSubmissions.filter((s: StoredSubmission) => !firebaseIds.has(s.id))

        submissions = [...firebaseSubmissions, ...uniqueLocalSubs]
        source = firebaseCount > 0 && localCount > 0 ? 'combined' :
          firebaseCount > 0 ? 'firebase' : 'local'
      }
    } catch (error) {
      // Firebase error - silently fall back to local storage
      if (isDev) {
        console.log('ℹ️ Firebase unavailable, using local storage only')
      }
    }

    // If no Firebase data, use local submissions
    if (submissions.length === 0) {
      submissions = localSubmissions
      source = 'local'
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => {
      const dateA = new Date(a.timestamp || '0').getTime()
      const dateB = new Date(b.timestamp || '0').getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      success: true,
      submissions,
      source,
      count: submissions.length,
      stats: {
        firebase: firebaseCount,
        local: localCount,
        total: submissions.length,
      }
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

/**
 * DELETE /api/submissions/list
 * Delete a submission from all storage layers
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    let deleted = false

    // Delete from local file using storage-utils
    deleted = await deleteFromStorage(id)

    // Try to delete from Firebase too
    try {
      const { adminDb } = await import('@/lib/firebase-admin')
      if (adminDb) {
        await adminDb.collection('submissions').doc(id).delete()
      }
    } catch {
      // Ignore Firebase errors
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      deleted: id,
      message: 'تم حذف الطلب بنجاح'
    })

  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}

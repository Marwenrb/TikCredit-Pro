import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { getAllSubmissions, deleteSubmission, getSyncStats, readLocalSubmissions } from '@/lib/persistenceService'

/**
 * GET /api/submissions/list
 * Protected endpoint - requires admin authentication
 * Returns submissions from both Firebase and local storage
 */
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

    const isDev = process.env.NODE_ENV === 'development'
    let submissions: Record<string, unknown>[] = []
    let source: 'firebase' | 'local' | 'firebase+local' | 'combined' = 'local'
    let firebaseCount = 0
    let localCount = 0

    // 1. Get submissions from MySQL/Firebase (production)
    if (adminDb) {
      try {
        const snapshot = await adminDb
          .collection('submissions')
          .orderBy('timestamp', 'desc')
          .limit(500)
          .get()

        const firebaseSubmissions = snapshot.docs.map(doc => {
          const docData = doc.data()
          return {
            id: doc.id,
            ...docData,
            data: docData.data || {
              fullName: docData.fullName || docData.data?.fullName,
              phone: docData.phone || docData.data?.phone,
              email: docData.email || docData.data?.email,
              wilaya: docData.wilaya || docData.data?.wilaya,
              financingType: docData.financingType || docData.data?.financingType,
              requestedAmount: docData.requestedAmount || docData.data?.requestedAmount,
              salaryReceiveMethod: docData.salaryReceiveMethod || docData.data?.salaryReceiveMethod,
              monthlyIncomeRange: docData.monthlyIncomeRange || docData.data?.monthlyIncomeRange,
              isExistingCustomer: docData.isExistingCustomer || docData.data?.isExistingCustomer,
              preferredContactTime: docData.preferredContactTime || docData.data?.preferredContactTime,
              profession: docData.profession || docData.data?.profession,
              customProfession: docData.customProfession || docData.data?.customProfession,
              notes: docData.notes || docData.data?.notes,
            },
            timestamp: docData.timestamp || docData.createdAt,
            syncedToFirebase: true,
            source: 'firebase'
          }
        })

        submissions.push(...firebaseSubmissions)
        firebaseCount = firebaseSubmissions.length
        source = 'firebase'

        if (isDev) {
          console.log(`✅ Loaded ${firebaseCount} submissions from Firebase`)
        }
      } catch (error) {
        console.error('❌ Firebase fetch error:', error)
      }
    } else {
      if (isDev) {
        console.warn('⚠️ Firebase Admin DB not available')
      }
    }

    // 2. Get submissions from local JSON file (G:\TikCredit-Pro\data\submissions.json)
    try {
      const localData = await readLocalSubmissions()
      const localSubmissions = localData.submissions

      // Merge local submissions with Firebase submissions (avoid duplicates by ID)
      const existingIds = new Set(submissions.map(s => s.id as string))

      const uniqueLocalSubs = localSubmissions
        .filter(s => !existingIds.has(s.id))
        .map(s => ({
          id: s.id,
          timestamp: s.timestamp,
          data: s.data,
          syncedToFirebase: s.syncedToFirebase,
          status: s.status,
          source: 'local'
        }))

      submissions.push(...uniqueLocalSubs)
      localCount = uniqueLocalSubs.length

      if (isDev) {
        console.log(`✅ Loaded ${localCount} unique local submissions from data/submissions.json`)
      }

      // Update source based on what we have
      if (firebaseCount > 0 && localCount > 0) {
        source = 'combined'
      } else if (localCount > 0) {
        source = 'local'
      }
    } catch (error) {
      if (isDev) {
        console.log('ℹ️ No local submissions file:', error instanceof Error ? error.message : 'Error')
      }
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => {
      const dateA = new Date((a.timestamp as string) || '0').getTime()
      const dateB = new Date((b.timestamp as string) || '0').getTime()
      return dateB - dateA
    })

    // Get sync statistics
    const syncStats = await getSyncStats()

    return NextResponse.json({
      success: true,
      submissions,
      source,
      count: submissions.length,
      stats: {
        firebase: firebaseCount,
        local: localCount,
        combinedTotal: submissions.length,
        ...syncStats
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

    // Use the persistence service to delete from all layers
    const deleted = await deleteSubmission(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found or delete failed' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      deleted: id,
      message: 'تم حذف الطلب من جميع مصادر التخزين'
    })

  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}

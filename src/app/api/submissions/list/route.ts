import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * GET /api/submissions/list
 * Protected endpoint - requires admin authentication
 * Fetches submissions from Firebase or local fallback
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    let submissions: any[] = []
    let source: 'firebase' | 'local' = 'local'

    // Try Firebase first
    if (adminDb) {
      try {
        const snapshot = await adminDb
          .collection('submissions')
          .orderBy('timestamp', 'desc')
          .limit(500)
          .get()

        submissions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Normalize data structure
          data: doc.data().data || {
            fullName: doc.data().fullName || doc.data().data?.fullName,
            phone: doc.data().phone || doc.data().data?.phone,
            email: doc.data().email || doc.data().data?.email,
            wilaya: doc.data().wilaya || doc.data().data?.wilaya,
            financingType: doc.data().financingType || doc.data().data?.financingType,
            requestedAmount: doc.data().requestedAmount || doc.data().data?.requestedAmount,
            salaryReceiveMethod: doc.data().salaryReceiveMethod || doc.data().data?.salaryReceiveMethod,
            monthlyIncomeRange: doc.data().monthlyIncomeRange || doc.data().data?.monthlyIncomeRange,
            isExistingCustomer: doc.data().isExistingCustomer || doc.data().data?.isExistingCustomer,
            preferredContactTime: doc.data().preferredContactTime || doc.data().data?.preferredContactTime,
            profession: doc.data().profession || doc.data().data?.profession,
            customProfession: doc.data().customProfession || doc.data().data?.customProfession,
            notes: doc.data().notes || doc.data().data?.notes,
          },
          timestamp: doc.data().timestamp || doc.data().createdAt,
        }))
        source = 'firebase'
        console.log(`✅ Loaded ${submissions.length} submissions from Firebase`)
      } catch (fbError) {
        console.warn('⚠️ Firebase fetch failed, trying local fallback:', fbError instanceof Error ? fbError.message : fbError)
      }
    }

    // Fallback to local file if Firebase not available or failed
    if (submissions.length === 0 || source === 'local') {
      try {
        const localFile = path.join(process.cwd(), '.tmp', 'submissions.json')
        const content = await fs.readFile(localFile, 'utf-8')
        const localSubmissions = JSON.parse(content)
        
        // Merge or use local submissions
        if (submissions.length === 0) {
          submissions = localSubmissions.map((s: any) => ({
            id: s.id,
            timestamp: s.timestamp,
            data: s.data || {
              fullName: s.fullName || s.data?.fullName,
              phone: s.phone || s.data?.phone,
              email: s.email || s.data?.email,
              wilaya: s.wilaya || s.data?.wilaya,
              financingType: s.financingType || s.data?.financingType,
              requestedAmount: s.requestedAmount || s.data?.requestedAmount,
              salaryReceiveMethod: s.salaryReceiveMethod || s.data?.salaryReceiveMethod,
              monthlyIncomeRange: s.monthlyIncomeRange || s.data?.monthlyIncomeRange,
              isExistingCustomer: s.isExistingCustomer || s.data?.isExistingCustomer,
              preferredContactTime: s.preferredContactTime || s.data?.preferredContactTime,
              profession: s.profession || s.data?.profession,
              customProfession: s.customProfession || s.data?.customProfession,
              notes: s.notes || s.data?.notes,
            },
          }))
          source = 'local'
        }
        console.log(`✅ Loaded ${localSubmissions.length} submissions from local file`)
      } catch (localError) {
        // No local file exists yet - that's okay
        console.log('📝 No local submissions file found')
      }
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      success: true,
      submissions,
      source,
      count: submissions.length,
    })

  } catch (error) {
    console.error('❌ Error fetching submissions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch submissions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/submissions/list
 * Delete a submission by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID required' },
        { status: 400 }
      )
    }

    let deleted = false

    // Try to delete from Firebase
    if (adminDb) {
      try {
        await adminDb.collection('submissions').doc(id).delete()
        deleted = true
        console.log(`✅ Deleted submission ${id} from Firebase`)
      } catch (fbError) {
        console.warn('⚠️ Firebase delete failed:', fbError)
      }
    }

    // Also try to delete from local file
    try {
      const localFile = path.join(process.cwd(), '.tmp', 'submissions.json')
      const content = await fs.readFile(localFile, 'utf-8')
      const submissions = JSON.parse(content)
      const filtered = submissions.filter((s: any) => s.id !== id)
      
      if (filtered.length < submissions.length) {
        await fs.writeFile(localFile, JSON.stringify(filtered, null, 2), 'utf-8')
        deleted = true
        console.log(`✅ Deleted submission ${id} from local file`)
      }
    } catch {
      // No local file - that's okay
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, deleted: id })

  } catch (error) {
    console.error('❌ Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}


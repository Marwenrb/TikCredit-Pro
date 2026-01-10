import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * GET /api/submissions/list
 * Protected endpoint - requires admin authentication
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

    let submissions: Record<string, unknown>[] = []
    let source: 'firebase' | 'local' = 'local'

    // Try Firebase first
    if (adminDb) {
      try {
        const snapshot = await adminDb
          .collection('submissions')
          .orderBy('timestamp', 'desc')
          .limit(500)
          .get()

        submissions = snapshot.docs.map(doc => {
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
          }
        })
        source = 'firebase'
      } catch {
        // Firebase failed, will try local
      }
    }

    // Fallback to local file
    if (submissions.length === 0) {
      try {
        const localFile = path.join(process.cwd(), '.tmp', 'submissions.json')
        const content = await fs.readFile(localFile, 'utf-8')
        const localSubmissions = JSON.parse(content)
        
        submissions = localSubmissions.map((s: Record<string, unknown>) => ({
          id: s.id,
          timestamp: s.timestamp,
          data: s.data || {
            fullName: s.fullName || (s.data as Record<string, unknown>)?.fullName,
            phone: s.phone || (s.data as Record<string, unknown>)?.phone,
            email: s.email || (s.data as Record<string, unknown>)?.email,
            wilaya: s.wilaya || (s.data as Record<string, unknown>)?.wilaya,
            financingType: s.financingType || (s.data as Record<string, unknown>)?.financingType,
            requestedAmount: s.requestedAmount || (s.data as Record<string, unknown>)?.requestedAmount,
            salaryReceiveMethod: s.salaryReceiveMethod || (s.data as Record<string, unknown>)?.salaryReceiveMethod,
            monthlyIncomeRange: s.monthlyIncomeRange || (s.data as Record<string, unknown>)?.monthlyIncomeRange,
            isExistingCustomer: s.isExistingCustomer || (s.data as Record<string, unknown>)?.isExistingCustomer,
            preferredContactTime: s.preferredContactTime || (s.data as Record<string, unknown>)?.preferredContactTime,
            profession: s.profession || (s.data as Record<string, unknown>)?.profession,
            customProfession: s.customProfession || (s.data as Record<string, unknown>)?.customProfession,
            notes: s.notes || (s.data as Record<string, unknown>)?.notes,
          },
        }))
        source = 'local'
      } catch {
        // No local file exists
      }
    }

    // Sort by timestamp (newest first)
    submissions.sort((a, b) => {
      const dateA = new Date((a.timestamp as string) || '0').getTime()
      const dateB = new Date((b.timestamp as string) || '0').getTime()
      return dateB - dateA
    })

    return NextResponse.json({ success: true, submissions, source, count: submissions.length })

  } catch {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

/**
 * DELETE /api/submissions/list
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

    // Try Firebase
    if (adminDb) {
      try {
        await adminDb.collection('submissions').doc(id).delete()
        deleted = true
      } catch {
        // Firebase delete failed
      }
    }

    // Also try local file
    try {
      const localFile = path.join(process.cwd(), '.tmp', 'submissions.json')
      const content = await fs.readFile(localFile, 'utf-8')
      const submissions = JSON.parse(content)
      const filtered = submissions.filter((s: Record<string, unknown>) => s.id !== id)
      
      if (filtered.length < submissions.length) {
        await fs.writeFile(localFile, JSON.stringify(filtered, null, 2), 'utf-8')
        deleted = true
      }
    } catch {
      // No local file
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: id })

  } catch {
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}

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
 * Returns submissions from local storage (primary) + Supabase (when available)
 */

// Using types from storage-utils
type StoredSubmission = {
  id: string
  timestamp: string
  data: Record<string, unknown>
  syncedToSupabase?: boolean
  syncedToFirebase?: boolean // Legacy compatibility
  status?: string
  source?: string
  metadata?: {
    ip?: string
    userAgent?: string
    savedAt?: string
    syncedToSupabase?: boolean
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
    let source: 'supabase' | 'local' | 'combined' = 'local'
    let supabaseCount = 0
    let localCount = 0

    // 1. Get submissions from local JSON file FIRST (always available)
    const localSubmissions = await getLocalSubmissions() as StoredSubmission[]
    localCount = localSubmissions.length

    if (isDev && localCount > 0) {
      console.log(`✅ Loaded ${localCount} submissions from local storage`)
    }

    // 2. Try Supabase (optional, may fail)
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-admin')

      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500)

        if (!error && data) {
          const supabaseSubmissions = data.map(record => ({
            id: record.id,
            timestamp: record.created_at,
            data: {
              fullName: record.full_name,
              phone: record.phone,
              email: record.email,
              wilaya: record.wilaya,
              financingType: record.financing_type,
              requestedAmount: record.requested_amount,
              salaryReceiveMethod: record.salary_receive_method,
              monthlyIncomeRange: record.monthly_income_range,
              isExistingCustomer: record.is_existing_customer,
              preferredContactTime: record.preferred_contact_time,
              profession: record.profession,
              customProfession: record.custom_profession,
              notes: record.notes,
            },
            syncedToSupabase: true,
            status: record.status || 'synced',
            source: 'supabase' as const
          }))

          supabaseCount = supabaseSubmissions.length

          if (isDev && supabaseCount > 0) {
            console.log(`✅ Loaded ${supabaseCount} submissions from Supabase`)
          }

          // Merge: Supabase submissions take priority for duplicates
          const supabaseIds = new Set(supabaseSubmissions.map((s: StoredSubmission) => s.id))
          const uniqueLocalSubs = localSubmissions.filter((s: StoredSubmission) => !supabaseIds.has(s.id))

          submissions = [...supabaseSubmissions, ...uniqueLocalSubs]
          source = supabaseCount > 0 && localCount > 0 ? 'combined' :
            supabaseCount > 0 ? 'supabase' : 'local'
        }
      }
    } catch (error) {
      // Supabase error - silently fall back to local storage
      if (isDev) {
        console.log('ℹ️ Supabase unavailable, using local storage only')
      }
    }

    // If no Supabase data, use local submissions
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
        supabase: supabaseCount,
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

    // Try to delete from Supabase too
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-admin')
      if (supabaseAdmin) {
        await supabaseAdmin.from('submissions').delete().eq('id', id)
      }
    } catch {
      // Ignore Supabase errors
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

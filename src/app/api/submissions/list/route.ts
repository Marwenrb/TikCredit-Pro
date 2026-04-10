import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  deleteLocalSubmission as deleteFromStorage,
  getLocalSubmissions,
  isDev
} from '@/lib/storage-utils'

// ═══════════════════════════════════════════════════════════════════════════════
// Force dynamic rendering — no stale cached data in admin dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic'
export const revalidate = 0

type StoredSubmission = {
  id: string
  timestamp: string
  data: Record<string, unknown>
  syncedToSupabase?: boolean
  status?: string
  source?: string
  metadata?: { ip?: string; userAgent?: string; savedAt?: string }
}

// ── Auth helper ────────────────────────────────────────────────────────────────
async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return null
  const decoded = await verifyToken(token)
  if (!decoded || decoded.role !== 'admin') return null
  return decoded
}

// ── GET /api/submissions/list ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    if (!await requireAdmin(request)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wilaya        = searchParams.get('wilaya')
    const search        = searchParams.get('search')
    const period        = searchParams.get('period') as 'today' | 'week' | 'month' | 'all' | null
    const paymentMethod = searchParams.get('paymentMethod')

    let submissions: StoredSubmission[] = []
    let source: 'supabase' | 'local' | 'combined' = 'local'
    let supabaseCount = 0
    let localCount = 0

    // 1. Local file (dev / hybrid deployments)
    const localSubmissions = await getLocalSubmissions() as StoredSubmission[]
    localCount = localSubmissions.length

    // 2. Supabase with server-side filters
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-admin')
      if (supabaseAdmin) {
        let query = supabaseAdmin
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500)

        if (wilaya && wilaya !== 'all')               query = query.eq('wilaya', wilaya)
        if (search?.trim())                            query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
        if (paymentMethod && paymentMethod !== 'all') query = query.eq('payment_method', paymentMethod)

        if (period && period !== 'all') {
          const now = new Date()
          let startDate: Date
          switch (period) {
            case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
            case 'week':  startDate = new Date(now); startDate.setDate(now.getDate() - 7); break
            case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
            default:      startDate = new Date(2020, 0, 1)
          }
          query = query.gte('created_at', startDate.toISOString())
        }

        const { data, error } = await query
        if (!error && data) {
          const supabaseSubs = data.map(r => ({
            id: r.id,
            timestamp: r.created_at,
            data: {
              fullName:              r.full_name,
              phone:                 r.phone,
              email:                 r.email,
              wilaya:                r.wilaya,
              financingType:         r.financing_type,
              requestedAmount:       r.requested_amount,
              salaryReceiveMethod:   r.salary_receive_method,
              monthlyIncomeRange:    r.monthly_income_range,
              isExistingCustomer:    r.is_existing_customer,
              preferredContactTime:  r.preferred_contact_time,
              profession:            r.profession,
              customProfession:      r.custom_profession,
              notes:                 r.notes,
              banking: r.payment_method === 'CCP'
                ? { paymentMethod: 'CCP' as const, ccpNumber: r.ccp_number || '', ccpKey: r.ccp_key || '', ccpFullNumber: r.ccp_full_number || '' }
                : r.payment_method === 'بنك'
                  ? { paymentMethod: 'بنك' as const, bankName: r.bank_name || '', bankAccountNumber: r.bank_account_number || '', bankAgencyCode: r.bank_agency_code || '' }
                  : null,
            },
            syncedToSupabase: true,
            status: r.status || 'synced',
            source: 'supabase' as const,
          }))

          supabaseCount = supabaseSubs.length
          const supabaseIds = new Set(supabaseSubs.map(s => s.id))
          const uniqueLocal  = localSubmissions.filter(s => !supabaseIds.has(s.id))
          submissions = [...supabaseSubs, ...uniqueLocal]
          source = supabaseCount > 0 && localCount > 0 ? 'combined'
                 : supabaseCount > 0 ? 'supabase' : 'local'
        }
      }
    } catch {
      // Supabase unavailable — fall back to local
    }

    if (submissions.length === 0) {
      submissions = localSubmissions
      source = 'local'
    }

    submissions.sort((a, b) =>
      new Date(b.timestamp || '0').getTime() - new Date(a.timestamp || '0').getTime()
    )

    return NextResponse.json({
      success: true, submissions, source,
      count: submissions.length,
      stats: { supabase: supabaseCount, local: localCount, total: submissions.length },
    }, {
      headers: {
        // no-store: admin dashboard must never serve stale data
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

// ── DELETE /api/submissions/list ───────────────────────────────────────────────
//
// Three modes:
//   1. ?id=xxx                          → single delete (backward-compatible)
//   2. body { mode:'ids', ids:[...] }   → bulk delete by ID list
//   3. body { mode:'criteria', criteria:{wilaya?,paymentMethod?,period?,from?,to?,financingType?} }
//      → delete all matching records
//
export async function DELETE(request: NextRequest) {
  try {
    if (!await requireAdmin(request)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('id')

    // ── Mode 1: single delete (?id=xxx) ─────────────────────────────────────
    if (singleId) {
      let deleted = false

      // Try local file (dev)
      const localOk = await deleteFromStorage(singleId)
      if (localOk) deleted = true

      // Try Supabase (production primary)
      try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin')
        if (supabaseAdmin) {
          const { error } = await supabaseAdmin
            .from('submissions')
            .delete()
            .eq('id', singleId)
          if (!error) deleted = true  // ← FIX: Supabase success counts
        }
      } catch {
        // Supabase error — rely on local result only
      }

      if (!deleted) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        deleted: singleId,
        deletedCount: 1,
        message: 'تم حذف الطلب بنجاح',
      })
    }

    // ── Modes 2 + 3: bulk / criteria delete (JSON body) ─────────────────────
    let body: {
      mode?: string
      ids?: string[]
      criteria?: {
        wilaya?: string
        paymentMethod?: string
        financingType?: string
        period?: string
        from?: string
        to?: string
      }
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body invalid or missing' }, { status: 400 })
    }

    // ── Mode 2: bulk by IDs ──────────────────────────────────────────────────
    if (body.mode === 'ids') {
      const ids = body.ids ?? []
      if (ids.length === 0) {
        return NextResponse.json({ error: 'ids array is empty' }, { status: 400 })
      }

      let deletedCount = 0

      // Local
      for (const id of ids) {
        const ok = await deleteFromStorage(id)
        if (ok) deletedCount++
      }

      // Supabase
      try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin')
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from('submissions')
            .delete()
            .in('id', ids)
            .select('id')
          if (!error && data) deletedCount = Math.max(deletedCount, data.length)
        }
      } catch {
        // ignore — local count is the fallback
      }

      return NextResponse.json({
        success: true,
        deletedCount,
        message: `تم حذف ${deletedCount} طلب بنجاح`,
      })
    }

    // ── Mode 3: criteria delete ──────────────────────────────────────────────
    if (body.mode === 'criteria') {
      const c = body.criteria ?? {}
      let deletedCount = 0

      try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin')
        if (!supabaseAdmin) throw new Error('Supabase unavailable')

        // Step 1: SELECT matching IDs with criteria
        let query = supabaseAdmin
          .from('submissions')
          .select('id')

        if (c.wilaya)         query = query.eq('wilaya', c.wilaya)
        if (c.paymentMethod)  query = query.eq('payment_method', c.paymentMethod)
        if (c.financingType)  query = query.eq('financing_type', c.financingType)

        // Date range
        if (c.period && c.period !== 'all') {
          const now = new Date()
          let startDate: Date
          let endDate: Date | null = null

          if (c.period === 'custom') {
            startDate = c.from ? new Date(c.from) : new Date(2020, 0, 1)
            endDate   = c.to   ? new Date(c.to + 'T23:59:59.999Z') : null
          } else {
            switch (c.period) {
              case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
              case 'week':  startDate = new Date(now); startDate.setDate(now.getDate() - 7); break
              case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
              default:      startDate = new Date(2020, 0, 1)
            }
          }

          query = query.gte('created_at', startDate.toISOString())
          if (endDate) query = query.lte('created_at', endDate.toISOString())
        }

        const { data: matchedRows, error: selectError } = await query
        if (selectError) throw selectError
        if (!matchedRows || matchedRows.length === 0) {
          return NextResponse.json({ success: true, deletedCount: 0, message: 'لا توجد طلبات تطابق المعايير' })
        }

        const matchedIds = matchedRows.map(r => r.id as string)

        // Step 2: DELETE by ID list (safe — no accidental mass delete)
        const { data: deleted, error: deleteError } = await supabaseAdmin
          .from('submissions')
          .delete()
          .in('id', matchedIds)
          .select('id')

        if (deleteError) throw deleteError
        deletedCount = deleted?.length ?? matchedIds.length

        // Also purge from local file
        for (const id of matchedIds) {
          await deleteFromStorage(id).catch(() => {})
        }

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('Criteria delete error:', msg)
        return NextResponse.json({ error: `فشل الحذف: ${msg}` }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        deletedCount,
        message: `تم حذف ${deletedCount} طلب بنجاح`,
      })
    }

    return NextResponse.json({ error: 'mode must be "ids" or "criteria"' }, { status: 400 })

  } catch (error) {
    console.error('Error deleting submission(s):', error)
    return NextResponse.json({ error: 'Failed to delete submission(s)' }, { status: 500 })
  }
}

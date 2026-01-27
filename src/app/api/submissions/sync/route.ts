import { NextRequest, NextResponse } from 'next/server'

/**
 * Sync API for TikCredit Pro (Supabase Edition)
 * Syncs local submissions to Supabase
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions for Supabase Sync
// ═══════════════════════════════════════════════════════════════════════════════

async function getLocalSubmissions() {
    try {
        const { getLocalSubmissions } = await import('@/lib/storage-utils')
        return await getLocalSubmissions()
    } catch {
        return []
    }
}

async function syncToSupabase(submissions: any[]): Promise<{
    total: number
    synced: number
    errors: string[]
}> {
    const result = { total: submissions.length, synced: 0, errors: [] as string[] }

    try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin')

        if (!supabaseAdmin) {
            result.errors.push('Supabase Admin not initialized')
            return result
        }

        for (const sub of submissions) {
            try {
                // Skip already synced
                if (sub.syncedToSupabase) {
                    result.synced++
                    continue
                }

                const data = sub.data || {}

                const { error } = await supabaseAdmin
                    .from('submissions')
                    .upsert({
                        id: sub.id,
                        created_at: sub.timestamp || sub.createdAt || new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        full_name: data.fullName || '',
                        phone: data.phone || '',
                        email: data.email || null,
                        wilaya: data.wilaya || '',
                        profession: data.profession || null,
                        custom_profession: data.customProfession || null,
                        monthly_income_range: data.monthlyIncomeRange || null,
                        salary_receive_method: data.salaryReceiveMethod || '',
                        financing_type: data.financingType || '',
                        requested_amount: data.requestedAmount || 0,
                        is_existing_customer: data.isExistingCustomer || null,
                        preferred_contact_time: data.preferredContactTime || null,
                        notes: data.notes || null,
                        status: sub.status || 'synced',
                        source: 'sync-migration',
                        ip_address: sub.ip || sub.metadata?.ip || null,
                        user_agent: sub.userAgent || sub.metadata?.userAgent || null,
                    })

                if (error) {
                    result.errors.push(`${sub.id}: ${error.message}`)
                } else {
                    result.synced++
                }
            } catch (err) {
                result.errors.push(`${sub.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
        }
    } catch (error) {
        result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
}

async function getSyncStats() {
    try {
        const localSubs = await getLocalSubmissions()
        const synced = localSubs.filter((s: any) => s.syncedToSupabase || s.syncedToFirebase).length
        const pending = localSubs.filter((s: any) => !s.syncedToSupabase && !s.syncedToFirebase && s.status !== 'failed').length
        const failed = localSubs.filter((s: any) => s.status === 'failed').length

        return {
            total: localSubs.length,
            synced,
            pending,
            failed
        }
    } catch {
        return { total: 0, synced: 0, pending: 0, failed: 0 }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/submissions/sync
 * Get sync status and statistics
 */
export async function GET() {
    try {
        const stats = await getSyncStats()
        const submissions = await getLocalSubmissions()

        return NextResponse.json({
            success: true,
            stats,
            recentSubmissions: submissions.slice(0, 10).map((s: any) => ({
                id: s.id,
                timestamp: s.timestamp,
                name: s.data?.fullName || 'Unknown',
                phone: s.data?.phone || 'Unknown',
                syncedToSupabase: s.syncedToSupabase || false,
                status: s.status || 'pending'
            }))
        })
    } catch (error) {
        console.error('Error getting sync status:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/submissions/sync
 * Trigger sync of pending submissions to Supabase
 */
export async function POST(request: NextRequest) {
    try {
        // Check for admin authorization (optional security)
        const authHeader = request.headers.get('authorization')
        const adminToken = process.env.ADMIN_API_TOKEN

        // For now, allow sync without auth in development
        const isDev = process.env.NODE_ENV === 'development'
        if (!isDev && adminToken && authHeader !== `Bearer ${adminToken}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get action from request body
        let action = 'sync-all'
        try {
            const body = await request.json()
            action = body.action || 'sync-all'
        } catch {
            // No body, use default action
        }

        // Get local submissions
        const localSubmissions = await getLocalSubmissions()
        const unsynced = localSubmissions.filter((s: any) =>
            !s.syncedToSupabase && !s.syncedToFirebase && s.status !== 'failed'
        )

        // Sync to Supabase
        const syncResult = await syncToSupabase(unsynced)

        const stats = await getSyncStats()

        return NextResponse.json({
            success: true,
            action,
            result: {
                total: syncResult.total,
                synced: syncResult.synced,
                failed: syncResult.errors.length,
                errors: syncResult.errors
            },
            currentStats: stats,
            message: syncResult.synced > 0
                ? `تمت مزامنة ${syncResult.synced} طلب بنجاح إلى Supabase`
                : 'لا توجد طلبات للمزامنة'
        })
    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import {
    processSyncQueue,
    syncAllToFirebase,
    getSyncStats,
    getAllSubmissions
} from '@/lib/persistenceService'

/**
 * GET /api/submissions/sync
 * Get sync status and statistics
 */
export async function GET() {
    try {
        const stats = await getSyncStats()
        const submissions = await getAllSubmissions()

        return NextResponse.json({
            success: true,
            stats,
            recentSubmissions: submissions.slice(0, 10).map(s => ({
                id: s.id,
                timestamp: s.timestamp,
                name: s.data.fullName,
                phone: s.data.phone,
                syncedToFirebase: s.syncedToFirebase,
                status: s.status
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
 * Trigger sync of pending submissions to Firebase
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
        let action = 'process-queue'
        try {
            const body = await request.json()
            action = body.action || 'process-queue'
        } catch {
            // No body, use default action
        }

        let result: { processed?: number; synced?: number; failed?: number; total?: number; errors?: string[] }

        switch (action) {
            case 'sync-all':
                // Sync all unsynced submissions to Firebase
                const syncAllResult = await syncAllToFirebase()
                result = {
                    total: syncAllResult.total,
                    synced: syncAllResult.synced,
                    failed: syncAllResult.errors.length,
                    errors: syncAllResult.errors
                }
                break

            case 'process-queue':
            default:
                // Process only items in the sync queue
                const queueResult = await processSyncQueue()
                result = {
                    processed: queueResult.processed,
                    synced: queueResult.succeeded,
                    failed: queueResult.failed
                }
                break
        }

        const stats = await getSyncStats()

        return NextResponse.json({
            success: true,
            action,
            result,
            currentStats: stats,
            message: result.synced && result.synced > 0
                ? `تمت مزامنة ${result.synced} طلب بنجاح`
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

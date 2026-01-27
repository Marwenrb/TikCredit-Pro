/**
 * Supabase Admin SDK for TikCredit Pro
 * Server-side only - uses service role key
 * 
 * SECURITY: This file should NEVER be imported in client components!
 * The service role key bypasses Row Level Security.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Module-level state
let supabaseAdmin: SupabaseClient | null = null
let initializationAttempted = false
let initializationError: Error | null = null

/**
 * Initialize Supabase Admin client
 */
function initializeSupabaseAdmin(): SupabaseClient | null {
    // Prevent running in browser environment
    if (typeof window !== 'undefined') {
        console.error('❌ Supabase Admin SDK cannot be used in browser!')
        return null
    }

    // Return existing client if already initialized
    if (supabaseAdmin) return supabaseAdmin

    // Check if already attempted and failed
    if (initializationAttempted && initializationError) {
        return null
    }

    initializationAttempted = true
    const isDev = process.env.NODE_ENV === 'development'

    // Validate environment variables
    if (!supabaseUrl) {
        initializationError = new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
        if (isDev) {
            console.warn('⚠️ Supabase Admin not initialized - missing SUPABASE_URL')
        }
        return null
    }

    if (!supabaseServiceRoleKey) {
        initializationError = new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
        if (isDev) {
            console.warn('⚠️ Supabase Admin not initialized - missing SERVICE_ROLE_KEY')
            console.warn('   Get it from: Supabase Dashboard → Settings → API → service_role')
        }
        return null
    }

    try {
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                headers: {
                    'x-client-info': 'tikcredit-pro-admin/1.0.0',
                },
            },
        })

        if (isDev) {
            console.log('✅ Supabase Admin initialized successfully')
        }

        return supabaseAdmin
    } catch (error) {
        initializationError = error instanceof Error ? error : new Error('Unknown initialization error')
        if (isDev) {
            console.error('❌ Supabase Admin initialization failed:', initializationError.message)
        }
        return null
    }
}

// Initialize on module load
const adminClient = initializeSupabaseAdmin()

// Export the admin client
export { adminClient as supabaseAdmin }

/**
 * Get the admin client (lazily initialized)
 */
export function getSupabaseAdmin(): SupabaseClient | null {
    if (!supabaseAdmin) {
        return initializeSupabaseAdmin()
    }
    return supabaseAdmin
}

/**
 * Check if Supabase Admin is available
 */
export function isSupabaseAdminAvailable(): boolean {
    return supabaseAdmin !== null
}

/**
 * Get initialization error if any
 */
export function getInitializationError(): Error | null {
    return initializationError
}

// ====================================================================================
// Admin Database Operations
// ====================================================================================

import { FormData } from '@/types'

export interface SubmissionRecord {
    id: string
    created_at: string
    updated_at: string
    full_name: string
    phone: string
    email: string | null
    wilaya: string
    profession: string | null
    custom_profession: string | null
    monthly_income_range: string | null
    salary_receive_method: string
    financing_type: string
    requested_amount: number
    is_existing_customer: string | null
    preferred_contact_time: string | null
    notes: string | null
    status: string
    source: string
    ip_address: string | null
    user_agent: string | null
}

/**
 * Save submission with admin privileges (bypasses RLS)
 */
export async function adminSaveSubmission(
    submissionId: string,
    data: FormData,
    metadata: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseAdmin()

    if (!client) {
        const envCheck = {
            url: !!supabaseUrl,
            serviceKey: !!supabaseServiceRoleKey,
            keyLength: supabaseServiceRoleKey?.length || 0,
        }
        console.error('❌ Supabase Admin not initialized. Environment:', envCheck)
        return {
            success: false,
            error: `Supabase not configured. Missing: ${!envCheck.url ? 'URL ' : ''}${!envCheck.serviceKey ? 'SERVICE_KEY' : ''}`.trim(),
        }
    }

    try {
        const now = new Date().toISOString()

        const { error } = await client
            .from('submissions')
            .upsert({
                id: submissionId,
                created_at: now,
                updated_at: now,
                full_name: data.fullName,
                phone: data.phone,
                email: data.email || null,
                wilaya: data.wilaya,
                profession: data.profession || null,
                custom_profession: data.customProfession || null,
                monthly_income_range: data.monthlyIncomeRange || null,
                salary_receive_method: data.salaryReceiveMethod,
                financing_type: data.financingType,
                requested_amount: data.requestedAmount,
                is_existing_customer: data.isExistingCustomer || null,
                preferred_contact_time: data.preferredContactTime || null,
                notes: data.notes || null,
                status: 'new',
                source: process.env.VERCEL ? 'vercel' : 'local',
                ip_address: metadata.ip || null,
                user_agent: metadata.userAgent || null,
            })

        if (error) {
            console.error('❌ Supabase save error:', error)
            return { success: false, error: error.message }
        }

        console.log(`✅ Submission ${submissionId} saved to Supabase`)
        return { success: true }
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Supabase save exception:', errMsg)
        return { success: false, error: errMsg }
    }
}

/**
 * Get all submissions with admin privileges
 */
export async function adminGetAllSubmissions(limit = 500): Promise<SubmissionRecord[]> {
    const client = getSupabaseAdmin()

    if (!client) {
        console.warn('⚠️ Supabase Admin not available')
        return []
    }

    try {
        const { data, error } = await client
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('❌ Supabase fetch error:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('❌ Supabase fetch exception:', error)
        return []
    }
}

/**
 * Delete submission with admin privileges
 */
export async function adminDeleteSubmission(id: string): Promise<boolean> {
    const client = getSupabaseAdmin()

    if (!client) {
        console.warn('⚠️ Supabase Admin not available')
        return false
    }

    try {
        const { error } = await client
            .from('submissions')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('❌ Supabase delete error:', error)
            return false
        }

        console.log(`✅ Deleted submission ${id} from Supabase`)
        return true
    } catch (error) {
        console.error('❌ Supabase delete exception:', error)
        return false
    }
}

/**
 * Update submission status with admin privileges
 */
export async function adminUpdateSubmissionStatus(
    id: string,
    status: 'new' | 'pending' | 'contacted' | 'approved' | 'rejected'
): Promise<boolean> {
    const client = getSupabaseAdmin()

    if (!client) return false

    try {
        const { error } = await client
            .from('submissions')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        return !error
    } catch {
        return false
    }
}

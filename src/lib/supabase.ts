/**
 * Supabase Client SDK for TikCredit Pro
 * Browser-safe client initialization
 * 
 * This file is safe to import in both client and server components.
 * Uses the anonymous (public) key which respects Row Level Security.
 */

import { createClient } from '@supabase/supabase-js'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not configured')
}

/**
 * Supabase client instance for browser/client-side operations
 * Uses anon key which respects RLS policies
 */
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: false, // We use JWT auth, not Supabase auth
            autoRefreshToken: false,
        },
        global: {
            headers: {
                'x-client-info': 'tikcredit-pro/1.0.0',
            },
        },
    }
)

/**
 * Database types for TypeScript
 */
export interface SupabaseSubmission {
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
    last_backup_at: string | null
    backup_count: number
}

/**
 * Save a submission to Supabase (client-side)
 * Note: For production, use the API route which uses admin client
 */
export async function saveSubmissionToSupabase(data: Partial<SupabaseSubmission>) {
    try {
        const { data: result, error } = await supabase
            .from('submissions')
            .insert([data])
            .select()
            .single()

        if (error) {
            console.error('Error saving to Supabase:', error)
            throw error
        }

        console.log('✅ Submission saved to Supabase:', result.id)
        return result.id
    } catch (error) {
        console.error('Error saving to Supabase:', error)
        throw error
    }
}

/**
 * Get submissions from Supabase (client-side, respects RLS)
 */
export async function getSubmissionsFromSupabase(limit = 100) {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching from Supabase:', error)
            return []
        }

        console.log(`✅ Fetched ${data?.length || 0} submissions from Supabase`)
        return data || []
    } catch (error) {
        console.error('Error fetching from Supabase:', error)
        return []
    }
}

/**
 * Delete a submission from Supabase (client-side)
 */
export async function deleteSubmissionFromSupabase(id: string) {
    try {
        const { error } = await supabase
            .from('submissions')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting from Supabase:', error)
            return false
        }

        console.log(`✅ Deleted submission ${id} from Supabase`)
        return true
    } catch (error) {
        console.error('Error deleting from Supabase:', error)
        return false
    }
}

/**
 * Check Supabase connection
 */
export async function checkSupabaseConnection(): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('submissions')
            .select('id')
            .limit(1)

        return !error
    } catch {
        return false
    }
}

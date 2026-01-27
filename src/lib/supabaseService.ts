/**
 * Supabase Service for TikCredit Pro
 * High-level service layer for submission operations
 * 
 * Features:
 * - Complete CRUD operations
 * - Statistics and analytics
 * - Backup generation
 * - Text export for printing
 */

import { supabaseAdmin, adminGetAllSubmissions, SubmissionRecord } from './supabase-admin'
import { FormData, Submission } from '@/types'

// ====================================================================================
// Core CRUD Operations
// ====================================================================================

/**
 * Save a new submission to Supabase
 */
export async function saveSubmission(formData: FormData): Promise<string | null> {
    if (!supabaseAdmin) {
        console.error('❌ Supabase Admin not initialized')
        return null
    }

    try {
        const now = new Date().toISOString()

        const { data, error } = await supabaseAdmin
            .from('submissions')
            .insert({
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email || null,
                wilaya: formData.wilaya,
                profession: formData.profession === 'أخرى (حدد)' && formData.customProfession
                    ? formData.customProfession
                    : formData.profession || null,
                custom_profession: formData.customProfession || null,
                monthly_income_range: formData.monthlyIncomeRange || null,
                salary_receive_method: formData.salaryReceiveMethod,
                financing_type: formData.financingType,
                requested_amount: formData.requestedAmount,
                is_existing_customer: formData.isExistingCustomer || null,
                preferred_contact_time: formData.preferredContactTime || null,
                notes: formData.notes || null,
                status: 'pending',
                source: 'web-form',
                created_at: now,
                updated_at: now,
            })
            .select('id')
            .single()

        if (error) {
            console.error('❌ Error saving to Supabase:', error)
            return null
        }

        console.log('✅ Submission saved to Supabase:', data.id)
        return data.id
    } catch (error) {
        console.error('❌ Exception saving to Supabase:', error)
        return null
    }
}

/**
 * Get submissions from Supabase with limit
 */
export async function getSubmissions(limitCount = 100): Promise<Submission[]> {
    if (!supabaseAdmin) {
        console.error('❌ Supabase Admin not initialized')
        return []
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limitCount)

        if (error) {
            console.error('❌ Error fetching from Supabase:', error)
            return []
        }

        // Convert to legacy Submission format for compatibility
        const submissions: Submission[] = (data || []).map((record: SubmissionRecord) => ({
            id: record.id,
            timestamp: record.created_at,
            data: {
                isExistingCustomer: (record.is_existing_customer as 'نعم' | 'لا' | '') || '',
                fullName: record.full_name,
                phone: record.phone,
                email: record.email || '',
                preferredContactTime: record.preferred_contact_time || '',
                wilaya: record.wilaya,
                monthlyIncomeRange: record.monthly_income_range || '',
                salaryReceiveMethod: (record.salary_receive_method as 'CCP' | 'بنك' | '') || '',
                profession: record.profession || '',
                customProfession: record.custom_profession || '',
                financingType: record.financing_type,
                requestedAmount: record.requested_amount,
                notes: record.notes || '',
            },
        }))

        console.log(`✅ Fetched ${submissions.length} submissions from Supabase`)
        return submissions
    } catch (error) {
        console.error('❌ Exception fetching from Supabase:', error)
        return []
    }
}

/**
 * Get submissions by date range
 */
export async function getSubmissionsByDateRange(
    startDate: Date,
    endDate: Date
): Promise<Submission[]> {
    if (!supabaseAdmin) return []

    try {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching by date range:', error)
            return []
        }

        return (data || []).map((record: SubmissionRecord) => ({
            id: record.id,
            timestamp: record.created_at,
            data: {
                isExistingCustomer: (record.is_existing_customer as 'نعم' | 'لا' | '') || '',
                fullName: record.full_name,
                phone: record.phone,
                email: record.email || '',
                preferredContactTime: record.preferred_contact_time || '',
                wilaya: record.wilaya,
                monthlyIncomeRange: record.monthly_income_range || '',
                salaryReceiveMethod: (record.salary_receive_method as 'CCP' | 'بنك' | '') || '',
                profession: record.profession || '',
                customProfession: record.custom_profession || '',
                financingType: record.financing_type,
                requestedAmount: record.requested_amount,
                notes: record.notes || '',
            },
        }))
    } catch (error) {
        console.error('Exception fetching by date range:', error)
        return []
    }
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
    submissionId: string,
    status: 'pending' | 'approved' | 'rejected' | 'contacted'
): Promise<boolean> {
    if (!supabaseAdmin) return false

    try {
        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', submissionId)

        if (error) {
            console.error('Error updating status:', error)
            return false
        }

        console.log(`✅ Status updated to ${status} for ${submissionId}`)
        return true
    } catch (error) {
        console.error('Exception updating status:', error)
        return false
    }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId: string): Promise<boolean> {
    if (!supabaseAdmin) return false

    try {
        const { error } = await supabaseAdmin
            .from('submissions')
            .delete()
            .eq('id', submissionId)

        if (error) {
            console.error('Error deleting submission:', error)
            return false
        }

        console.log(`✅ Deleted submission ${submissionId}`)
        return true
    } catch (error) {
        console.error('Exception deleting submission:', error)
        return false
    }
}

// ====================================================================================
// Statistics & Analytics
// ====================================================================================

/**
 * Get submission statistics
 */
export async function getSubmissionStats(): Promise<{
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    totalAmount: number
}> {
    try {
        const submissions = await getSubmissions(1000)

        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart)
        weekStart.setDate(weekStart.getDate() - 7)
        const monthStart = new Date(todayStart)
        monthStart.setMonth(monthStart.getMonth() - 1)

        let total = submissions.length
        let today = 0
        let thisWeek = 0
        let thisMonth = 0
        let totalAmount = 0

        submissions.forEach((sub) => {
            const subDate = new Date(sub.timestamp)
            totalAmount += sub.data.requestedAmount || 0

            if (subDate >= todayStart) today++
            if (subDate >= weekStart) thisWeek++
            if (subDate >= monthStart) thisMonth++
        })

        return { total, today, thisWeek, thisMonth, totalAmount }
    } catch (error) {
        console.error('Error getting stats:', error)
        return { total: 0, today: 0, thisWeek: 0, thisMonth: 0, totalAmount: 0 }
    }
}

// ====================================================================================
// Backup & Export Functions
// ====================================================================================

/**
 * Generate text export for printing (French + Arabic)
 */
export function generatePrintableText(submissions: Submission[]): string {
    const lines: string[] = []
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })

    lines.push('═══════════════════════════════════════════════════════════════════')
    lines.push(`       TIKCREDIT PRO - LISTE DES DEMANDES / قائمة الطلبات`)
    lines.push(`       Généré le / تم الإنشاء في: ${timestamp}`)
    lines.push(`       Nombre total / العدد الإجمالي: ${submissions.length}`)
    lines.push('═══════════════════════════════════════════════════════════════════')
    lines.push('')

    submissions.forEach((sub, index) => {
        const data = sub.data
        const date = new Date(sub.timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })

        lines.push(`───────────────────────────────────────────────────────────────────`)
        lines.push(`  DEMANDE N° ${index + 1} / الطلب رقم ${index + 1}`)
        lines.push(`───────────────────────────────────────────────────────────────────`)
        lines.push(`  ID: ${sub.id}`)
        lines.push(`  Date / التاريخ: ${date}`)
        lines.push(``)
        lines.push(`  Nom complet / الاسم الكامل: ${data.fullName}`)
        lines.push(`  Téléphone / الهاتف: ${data.phone}`)
        lines.push(`  Email / البريد: ${data.email || 'Non fourni / غير متوفر'}`)
        lines.push(`  Wilaya / الولاية: ${data.wilaya}`)
        lines.push(`  Profession / المهنة: ${data.profession}${data.customProfession ? ` (${data.customProfession})` : ''}`)
        lines.push(`  Revenus / الدخل: ${data.monthlyIncomeRange || 'Non spécifié / غير محدد'}`)
        lines.push(`  Mode de paiement / طريقة الدفع: ${data.salaryReceiveMethod}`)
        lines.push(`  Type financement / نوع التمويل: ${data.financingType}`)
        lines.push(`  Montant demandé / المبلغ المطلوب: ${data.requestedAmount.toLocaleString('ar-DZ')} د.ج`)
        lines.push(`  Client existant / عميل حالي: ${data.isExistingCustomer || 'Non spécifié'}`)
        lines.push(`  Horaire préféré / الوقت المفضل: ${data.preferredContactTime || 'Non spécifié'}`)
        if (data.notes) {
            lines.push(`  Notes / ملاحظات: ${data.notes}`)
        }
        lines.push(``)
    })

    lines.push('═══════════════════════════════════════════════════════════════════')
    lines.push(`                        FIN DU RAPPORT / نهاية التقرير`)
    lines.push('═══════════════════════════════════════════════════════════════════')

    return lines.join('\n')
}

/**
 * Generate JSON backup
 */
export async function generateBackupJSON(): Promise<{
    success: boolean
    data?: {
        submissions: Submission[]
        generatedAt: string
        count: number
    }
    error?: string
}> {
    try {
        const submissions = await getSubmissions(10000)

        return {
            success: true,
            data: {
                submissions,
                generatedAt: new Date().toISOString(),
                count: submissions.length,
            },
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// LocalStorage fallback functions (for client-side)
const STORAGE_KEY = 'tikcredit_submissions'

export function saveToLocalStorage(formData: FormData): void {
    if (typeof window === 'undefined') return

    try {
        const existing = getFromLocalStorage()
        const newSubmission: Submission = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            data: formData,
        }

        existing.unshift(newSubmission)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
        console.log('📦 Saved to localStorage (fallback)')
    } catch (error) {
        console.error('LocalStorage save error:', error)
    }
}

export function getFromLocalStorage(): Submission[] {
    if (typeof window === 'undefined') return []

    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

/**
 * Migrate local submissions to Supabase
 */
export async function migrateLocalToSupabase(): Promise<number> {
    const localSubmissions = getFromLocalStorage()
    let migrated = 0

    for (const sub of localSubmissions) {
        try {
            const id = await saveSubmission(sub.data)
            if (id) migrated++
        } catch (error) {
            console.error('Migration error for:', sub.id)
        }
    }

    // Clear localStorage after migration
    if (migrated > 0 && typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
        console.log(`✅ Migrated ${migrated} submissions to Supabase`)
    }

    return migrated
}

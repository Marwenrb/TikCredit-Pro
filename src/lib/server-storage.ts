/**
 * Server-Side Storage Utility - TikCredit Pro
 * ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCTION-GRADE local file storage with atomic writes and fail-safe guarantees.
 * 
 * Features:
 * - Atomic writes (temp file → rename) to prevent corruption
 * - Auto-creates `dat` directory if missing
 * - Individual submission files + master submissions.json
 * - Bilingual text reports (French & Arabic)
 * - Zero dependencies on Firebase
 * - Silent in production, verbose in development
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { promises as fs } from 'fs'
import path from 'path'
import { FormData } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// CRITICAL: Use 'data' directory to match API routes (was 'dat' - caused data inconsistency)
const DAT_DIR = path.join(process.cwd(), 'data')
const REPORTS_DIR = path.join(DAT_DIR, 'reports')
const MASTER_FILE = path.join(DAT_DIR, 'submissions.json')
const isDev = process.env.NODE_ENV === 'development'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LocalSubmission {
    id: string
    timestamp: string
    data: FormData
    metadata: {
        ip?: string
        userAgent?: string
        savedAt: string
        syncedToSupabase: boolean
        /** @deprecated Use syncedToSupabase instead */
        syncedToFirebase?: boolean
    }
}

interface SubmissionsMasterFile {
    version: string
    createdAt: string
    lastUpdated: string
    totalCount: number
    submissions: LocalSubmission[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Conditional logging - only logs in development mode
 */
function devLog(message: string, ...args: unknown[]): void {
    if (isDev) {
        console.log(message, ...args)
    }
}

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error
        }
    }
}

/**
 * Ensure the dat and reports directories exist
 */
async function ensureDatDirectory(): Promise<void> {
    await ensureDirectory(DAT_DIR)
    await ensureDirectory(REPORTS_DIR)
}

/**
 * Atomic write: Write to temp file first, then rename
 * This prevents file corruption if the server crashes mid-write
 */
async function atomicWriteFile(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`

    try {
        await fs.writeFile(tempPath, content, 'utf-8')
        await fs.rename(tempPath, filePath)
    } catch (error) {
        // Clean up temp file if rename failed
        try {
            await fs.unlink(tempPath)
        } catch {
            // Ignore cleanup errors
        }
        throw error
    }
}

/**
 * Read the master submissions file, or return empty structure if doesn't exist
 */
async function readMasterFile(): Promise<SubmissionsMasterFile> {
    try {
        const content = await fs.readFile(MASTER_FILE, 'utf-8')
        return JSON.parse(content) as SubmissionsMasterFile
    } catch {
        // File doesn't exist or is corrupted - return fresh structure
        return {
            version: '2.0.0',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            totalCount: 0,
            submissions: []
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILINGUAL TEXT REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format amount in Algerian locale
 */
function formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-DZ').format(amount) + ' DA'
}

/**
 * Format date in French with Arabic day names
 */
function formatBilingualDate(date: Date): string {
    const frenchDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const frenchMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    const day = frenchDays[date.getDay()]
    const dateNum = date.getDate()
    const month = frenchMonths[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day} ${dateNum} ${month} ${year} (${hours}:${minutes})`
}

/**
 * Generate a professional bilingual text report
 */
function formatTextReport(submission: LocalSubmission): string {
    const date = new Date(submission.timestamp)
    const data = submission.data

    const divider = '══════════════════════════════════════════════════════════════════════'
    const thinDivider = '──────────────────────────────────────────────────────────────────────'

    const report = `
${divider}
                    RAPPORT DE DEMANDE DE FINANCEMENT
                           تقرير طلب التمويل
${divider}

📅 Date / التاريخ    : ${formatBilingualDate(date)}
🆔 ID Référence      : ${submission.id}
💾 Sauvegardé le     : ${formatBilingualDate(new Date(submission.metadata.savedAt))}

${thinDivider}
                     👤 INFORMATIONS CLIENT / معلومات العميل
${thinDivider}

Nom Complet / الاسم الكامل     : ${data.fullName}
Téléphone / الهاتف             : ${data.phone}
Email / البريد الإلكتروني      : ${data.email || 'Non fourni / غير متوفر'}
Wilaya / الولاية               : ${data.wilaya}
Client Existant / عميل حالي    : ${data.isExistingCustomer === 'نعم' ? 'Oui / نعم' : 'Non / لا'}

${thinDivider}
                     💼 INFORMATIONS PROFESSIONNELLES / المعلومات المهنية
${thinDivider}

Profession / المهنة            : ${data.profession === 'أخرى (حدد)' && data.customProfession ? data.customProfession : data.profession}
Réception Salaire / استلام الراتب : ${data.salaryReceiveMethod === 'CCP' ? 'CCP (Poste)' : data.salaryReceiveMethod}
Tranche de Revenu / نطاق الدخل : ${data.monthlyIncomeRange || 'Non spécifié / غير محدد'}

${thinDivider}
                     💰 DÉTAILS DU FINANCEMENT / تفاصيل التمويل
${thinDivider}

Type de Financement / نوع التمويل : ${data.financingType}
Montant Demandé / المبلغ المطلوب  : ${formatAmount(data.requestedAmount)}
Contact Préféré / وقت التواصل    : ${data.preferredContactTime || 'Non spécifié / غير محدد'}

${thinDivider}
                     📝 NOTES ADDITIONNELLES / ملاحظات إضافية
${thinDivider}

${data.notes || 'Aucune note / لا توجد ملاحظات'}

${divider}
                           📊 ÉTAT DE LA DEMANDE
${divider}

✅ Statut           : En attente de traitement / قيد المعالجة
🔄 Sync Supabase   : ${submission.metadata.syncedToSupabase ? 'Synchronisé / متزامن ✓' : 'En attente / قيد الانتظار'}
🌐 IP Client       : ${submission.metadata.ip || 'Non disponible'}

${divider}
           TikCredit Pro - Service de Financement Professionnel
                    خدمة التمويل الاحترافية - تيك كريديت برو
${divider}
`.trim()

    return report
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a submission to local storage
 * 
 * Creates:
 * 1. Individual file: dat/{id}.json
 * 2. Appends to master: dat/submissions.json
 * 3. Text report: dat/reports/{id}.txt
 * 
 * @returns Object with success status and any error message
 */
export async function saveToLocalDisk(
    submissionId: string,
    data: FormData,
    metadata: { ip?: string; userAgent?: string; syncedToSupabase?: boolean; /** @deprecated */ syncedToFirebase?: boolean }
): Promise<{ success: boolean; error?: string; filePath?: string; reportPath?: string }> {
    try {
        await ensureDatDirectory()

        const now = new Date().toISOString()

        const submission: LocalSubmission = {
            id: submissionId,
            timestamp: now,
            data,
            metadata: {
                ip: metadata.ip,
                userAgent: metadata.userAgent,
                savedAt: now,
                syncedToSupabase: metadata.syncedToSupabase ?? metadata.syncedToFirebase ?? false
            }
        }

        // 1. Save individual submission file (for easy access/backup)
        const individualPath = path.join(DAT_DIR, `${submissionId}.json`)
        await atomicWriteFile(individualPath, JSON.stringify(submission, null, 2))

        // 2. Append to master file
        const masterData = await readMasterFile()

        // Check for duplicates (update if exists)
        const existingIndex = masterData.submissions.findIndex(s => s.id === submissionId)
        if (existingIndex >= 0) {
            masterData.submissions[existingIndex] = submission
        } else {
            masterData.submissions.unshift(submission) // Add at beginning (newest first)
        }

        masterData.lastUpdated = now
        masterData.totalCount = masterData.submissions.length

        await atomicWriteFile(MASTER_FILE, JSON.stringify(masterData, null, 2))

        // 3. Generate bilingual text report
        const reportPath = path.join(REPORTS_DIR, `${submissionId}.txt`)
        const textReport = formatTextReport(submission)
        await atomicWriteFile(reportPath, textReport)

        devLog(`✅ DAT: Saved submission ${submissionId}`)
        devLog(`✅ DAT: Generated report at ${reportPath}`)

        return {
            success: true,
            filePath: individualPath,
            reportPath: reportPath
        }

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown local storage error'
        console.error(`❌ DAT: Failed to save ${submissionId}:`, errorMsg)

        return {
            success: false,
            error: errorMsg
        }
    }
}

/**
 * Update a submission's Firebase sync status
 */
export async function markAsSynced(submissionId: string): Promise<boolean> {
    try {
        await ensureDatDirectory()

        // Update individual file
        const individualPath = path.join(DAT_DIR, `${submissionId}.json`)
        let submission: LocalSubmission | null = null

        try {
            const content = await fs.readFile(individualPath, 'utf-8')
            submission = JSON.parse(content) as LocalSubmission
            submission.metadata.syncedToSupabase = true
            submission.metadata.syncedToFirebase = true // deprecated alias
            await atomicWriteFile(individualPath, JSON.stringify(submission, null, 2))
        } catch {
            // Individual file might not exist - continue to master file
        }

        // Update master file
        const masterData = await readMasterFile()
        const masterSubmission = masterData.submissions.find(s => s.id === submissionId)
        if (masterSubmission) {
            masterSubmission.metadata.syncedToSupabase = true
            masterSubmission.metadata.syncedToFirebase = true // deprecated alias
            masterData.lastUpdated = new Date().toISOString()
            await atomicWriteFile(MASTER_FILE, JSON.stringify(masterData, null, 2))
        }

        // Regenerate text report with updated sync status
        if (submission) {
            const reportPath = path.join(REPORTS_DIR, `${submissionId}.txt`)
            const textReport = formatTextReport(submission)
            await atomicWriteFile(reportPath, textReport)
        }

        devLog(`✅ DAT: Marked ${submissionId} as synced`)
        return true

    } catch (error) {
        console.error(`❌ DAT: Failed to mark ${submissionId} as synced:`, error)
        return false
    }
}

/**
 * Get all submissions from local storage
 */
export async function getAllLocalSubmissions(): Promise<LocalSubmission[]> {
    try {
        const masterData = await readMasterFile()
        return masterData.submissions
    } catch {
        return []
    }
}

/**
 * Get pending (unsynced) submissions
 */
export async function getPendingSubmissions(): Promise<LocalSubmission[]> {
    const all = await getAllLocalSubmissions()
    return all.filter(s => !s.metadata.syncedToSupabase)
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
    total: number
    synced: number
    pending: number
    lastUpdated: string | null
}> {
    try {
        const masterData = await readMasterFile()
        const synced = masterData.submissions.filter(s => s.metadata.syncedToSupabase).length

        return {
            total: masterData.totalCount,
            synced,
            pending: masterData.totalCount - synced,
            lastUpdated: masterData.lastUpdated
        }
    } catch {
        return {
            total: 0,
            synced: 0,
            pending: 0,
            lastUpdated: null
        }
    }
}

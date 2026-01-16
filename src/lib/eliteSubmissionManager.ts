/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TikCredit Pro - Elite Submission Management System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ultra-Professional Folder-Based Storage with:
 * - Monthly organized folders (e.g., /2026/01-Janvier/)
 * - Daily text files ready for printing (Arabic + French)
 * - Automatic backup and security
 * - Real-time Firebase sync
 * 
 * Folder Structure:
 * G:\TikCredit-Pro\data\
 * ├── submissions\
 * │   ├── 2026\
 * │   │   ├── 01-Janvier\
 * │   │   │   ├── 2026-01-15_submissions.json
 * │   │   │   ├── 2026-01-15_rapport_ar.txt
 * │   │   │   ├── 2026-01-15_rapport_fr.txt
 * │   │   │   └── 2026-01-16_submissions.json
 * │   │   ├── 02-Février\
 * │   │   └── ...
 * │   └── backup\
 * ├── sync-queue.json
 * └── config.json
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { FormData } from '@/types'
import { adminDb } from './firebase-admin'
import { promises as fs } from 'fs'
import path from 'path'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DATA_ROOT = path.join(process.cwd(), 'data')
const SUBMISSIONS_ROOT = path.join(DATA_ROOT, 'submissions')
const BACKUP_DIR = path.join(SUBMISSIONS_ROOT, 'backup')
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Month names in French for folder naming
const FRENCH_MONTHS: Record<number, string> = {
    1: '01-Janvier',
    2: '02-Février',
    3: '03-Mars',
    4: '04-Avril',
    5: '05-Mai',
    6: '06-Juin',
    7: '07-Juillet',
    8: '08-Août',
    9: '09-Septembre',
    10: '10-Octobre',
    11: '11-Novembre',
    12: '12-Décembre'
}

// Arabic month names for reports
const ARABIC_MONTHS: Record<number, string> = {
    1: 'يناير',
    2: 'فبراير',
    3: 'مارس',
    4: 'أبريل',
    5: 'مايو',
    6: 'يونيو',
    7: 'يوليو',
    8: 'أغسطس',
    9: 'سبتمبر',
    10: 'أكتوبر',
    11: 'نوفمبر',
    12: 'ديسمبر'
}

// Arabic day names
const ARABIC_DAYS: Record<number, string> = {
    0: 'الأحد',
    1: 'الإثنين',
    2: 'الثلاثاء',
    3: 'الأربعاء',
    4: 'الخميس',
    5: 'الجمعة',
    6: 'السبت'
}

// French day names
const FRENCH_DAYS: Record<number, string> = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi'
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EliteSubmission {
    id: string
    timestamp: string
    date: string // YYYY-MM-DD
    time: string // HH:MM:SS
    data: FormData
    syncedToFirebase: boolean
    firebaseId?: string
    createdAt: string
    updatedAt: string
    ip?: string
    userAgent?: string
    status: 'pending' | 'synced' | 'processed' | 'failed'
    retryCount: number
    printedAt?: string
}

export interface DailySubmissionsFile {
    date: string
    year: number
    month: number
    day: number
    monthNameFr: string
    monthNameAr: string
    submissions: EliteSubmission[]
    statistics: {
        total: number
        totalAmount: number
        avgAmount: number
        byWilaya: Record<string, number>
        byFinancingType: Record<string, number>
        bySalaryMethod: Record<string, number>
    }
    metadata: {
        createdAt: string
        lastUpdated: string
        lastPrintedAt?: string
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOLDER STRUCTURE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the folder path for a specific date
 */
function getMonthFolderPath(date: Date): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthFolder = FRENCH_MONTHS[month]
    return path.join(SUBMISSIONS_ROOT, year.toString(), monthFolder)
}

/**
 * Get the file paths for a specific date
 */
function getFilePaths(date: Date): {
    folder: string
    jsonFile: string
    arabicReport: string
    frenchReport: string
} {
    const folder = getMonthFolderPath(date)
    const dateStr = formatDateISO(date)

    return {
        folder,
        jsonFile: path.join(folder, `${dateStr}_submissions.json`),
        arabicReport: path.join(folder, `${dateStr}_rapport_ar.txt`),
        frenchReport: path.join(folder, `${dateStr}_rapport_fr.txt`)
    }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0]
}

/**
 * Format time as HH:MM:SS
 */
function formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0]
}

/**
 * Ensure all required directories exist
 */
async function ensureDirectories(date: Date): Promise<void> {
    const folder = getMonthFolderPath(date)
    await fs.mkdir(folder, { recursive: true })
    await fs.mkdir(BACKUP_DIR, { recursive: true })
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY SUBMISSIONS FILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read daily submissions file (or create empty one)
 */
async function readDailySubmissions(date: Date): Promise<DailySubmissionsFile> {
    const paths = getFilePaths(date)

    try {
        await ensureDirectories(date)
        const content = await fs.readFile(paths.jsonFile, 'utf-8')
        return JSON.parse(content)
    } catch {
        // Create new daily file
        const month = date.getMonth() + 1
        return createEmptyDailyFile(date, month)
    }
}

/**
 * Create empty daily submissions file structure
 */
function createEmptyDailyFile(date: Date, month: number): DailySubmissionsFile {
    return {
        date: formatDateISO(date),
        year: date.getFullYear(),
        month,
        day: date.getDate(),
        monthNameFr: FRENCH_MONTHS[month].split('-')[1],
        monthNameAr: ARABIC_MONTHS[month],
        submissions: [],
        statistics: {
            total: 0,
            totalAmount: 0,
            avgAmount: 0,
            byWilaya: {},
            byFinancingType: {},
            bySalaryMethod: {}
        },
        metadata: {
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }
    }
}

/**
 * Update statistics from submissions
 */
function updateStatistics(file: DailySubmissionsFile): void {
    const submissions = file.submissions

    file.statistics = {
        total: submissions.length,
        totalAmount: submissions.reduce((sum, s) => sum + (s.data.requestedAmount || 0), 0),
        avgAmount: submissions.length > 0
            ? submissions.reduce((sum, s) => sum + (s.data.requestedAmount || 0), 0) / submissions.length
            : 0,
        byWilaya: {},
        byFinancingType: {},
        bySalaryMethod: {}
    }

    submissions.forEach(s => {
        if (s.data.wilaya) {
            file.statistics.byWilaya[s.data.wilaya] = (file.statistics.byWilaya[s.data.wilaya] || 0) + 1
        }
        if (s.data.financingType) {
            file.statistics.byFinancingType[s.data.financingType] = (file.statistics.byFinancingType[s.data.financingType] || 0) + 1
        }
        if (s.data.salaryReceiveMethod) {
            file.statistics.bySalaryMethod[s.data.salaryReceiveMethod] = (file.statistics.bySalaryMethod[s.data.salaryReceiveMethod] || 0) + 1
        }
    })
}

/**
 * Write daily submissions file atomically
 */
async function writeDailySubmissions(date: Date, data: DailySubmissionsFile): Promise<void> {
    const paths = getFilePaths(date)
    await ensureDirectories(date)

    data.metadata.lastUpdated = new Date().toISOString()
    updateStatistics(data)

    // Atomic write
    const tempFile = `${paths.jsonFile}.tmp.${Date.now()}`
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8')
    await fs.rename(tempFile, paths.jsonFile)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT-READY REPORT GENERATION (ARABIC)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Arabic print-ready report
 */
function generateArabicReport(file: DailySubmissionsFile): string {
    const date = new Date(file.date)
    const dayName = ARABIC_DAYS[date.getDay()]

    let report = `╔════════════════════════════════════════════════════════════════════════════════╗
║                        تيك كريديت برو - TikCredit Pro                         ║
║                              تقرير الطلبات اليومي                              ║
╚════════════════════════════════════════════════════════════════════════════════╝

📅 التاريخ: ${dayName}، ${file.day} ${file.monthNameAr} ${file.year}
📊 إجمالي الطلبات: ${file.statistics.total}
💰 إجمالي المبالغ المطلوبة: ${formatCurrencyAr(file.statistics.totalAmount)}
📈 متوسط المبلغ: ${formatCurrencyAr(file.statistics.avgAmount)}

════════════════════════════════════════════════════════════════════════════════
                                 تفاصيل الطلبات
════════════════════════════════════════════════════════════════════════════════

`

    file.submissions.forEach((sub, index) => {
        report += `┌─────────────────────────────────────────────────────────────────────────────┐
│ الطلب رقم ${index + 1}                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔖 رقم المعرف: ${sub.id}
│ ⏰ الوقت: ${sub.time}
│ 👤 الاسم الكامل: ${sub.data.fullName}
│ 📱 رقم الهاتف: ${sub.data.phone}
${sub.data.email ? `│ 📧 البريد الإلكتروني: ${sub.data.email}\n` : ''}│ 📍 الولاية: ${sub.data.wilaya}
│ 💼 المهنة: ${sub.data.profession === 'أخرى (حدد)' && sub.data.customProfession ? sub.data.customProfession : sub.data.profession}
│ 🏦 طريقة استلام الراتب: ${sub.data.salaryReceiveMethod === 'CCP' ? 'البريد (CCP)' : 'حساب بنكي'}
│ 💳 نوع التمويل: ${sub.data.financingType}
│ 💵 المبلغ المطلوب: ${formatCurrencyAr(sub.data.requestedAmount)}
│ 👥 عميل موجود: ${sub.data.isExistingCustomer === 'نعم' ? 'نعم ✓' : 'لا ✗'}
${sub.data.notes ? `│ 📝 ملاحظات: ${sub.data.notes}\n` : ''}│ 📊 الحالة: ${getStatusArabic(sub.status)}
└─────────────────────────────────────────────────────────────────────────────┘

`
    })

    report += `════════════════════════════════════════════════════════════════════════════════
                                   الإحصائيات
════════════════════════════════════════════════════════════════════════════════

📍 توزيع حسب الولاية:
${Object.entries(file.statistics.byWilaya).map(([w, c]) => `   • ${w}: ${c} طلب`).join('\n')}

💳 توزيع حسب نوع التمويل:
${Object.entries(file.statistics.byFinancingType).map(([t, c]) => `   • ${t}: ${c} طلب`).join('\n')}

🏦 توزيع حسب طريقة الراتب:
${Object.entries(file.statistics.bySalaryMethod).map(([m, c]) => `   • ${m === 'CCP' ? 'البريد (CCP)' : 'بنك'}: ${c} طلب`).join('\n')}

════════════════════════════════════════════════════════════════════════════════
تم إنشاء هذا التقرير بواسطة نظام TikCredit Pro الآلي
التاريخ: ${new Date().toLocaleString('ar-DZ')}
════════════════════════════════════════════════════════════════════════════════
`

    return report
}

/**
 * Format currency in Arabic
 */
function formatCurrencyAr(amount: number): string {
    return `${amount.toLocaleString('ar-DZ')} د.ج`
}

/**
 * Get status in Arabic
 */
function getStatusArabic(status: string): string {
    const statusMap: Record<string, string> = {
        'pending': '⏳ قيد الانتظار',
        'synced': '✅ تمت المزامنة',
        'processed': '✔️ تمت المعالجة',
        'failed': '❌ فشل'
    }
    return statusMap[status] || status
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT-READY REPORT GENERATION (FRENCH)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate French print-ready report
 */
function generateFrenchReport(file: DailySubmissionsFile): string {
    const date = new Date(file.date)
    const dayName = FRENCH_DAYS[date.getDay()]

    let report = `╔════════════════════════════════════════════════════════════════════════════════╗
║                           TikCredit Pro                                        ║
║                      Rapport Journalier des Demandes                           ║
╚════════════════════════════════════════════════════════════════════════════════╝

📅 Date: ${dayName}, ${file.day} ${file.monthNameFr} ${file.year}
📊 Total des demandes: ${file.statistics.total}
💰 Montant total demandé: ${formatCurrencyFr(file.statistics.totalAmount)}
📈 Montant moyen: ${formatCurrencyFr(file.statistics.avgAmount)}

════════════════════════════════════════════════════════════════════════════════
                              DÉTAILS DES DEMANDES
════════════════════════════════════════════════════════════════════════════════

`

    file.submissions.forEach((sub, index) => {
        report += `┌─────────────────────────────────────────────────────────────────────────────┐
│ Demande N° ${index + 1}                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔖 ID: ${sub.id}
│ ⏰ Heure: ${sub.time}
│ 👤 Nom complet: ${sub.data.fullName}
│ 📱 Téléphone: ${sub.data.phone}
${sub.data.email ? `│ 📧 Email: ${sub.data.email}\n` : ''}│ 📍 Wilaya: ${sub.data.wilaya}
│ 💼 Profession: ${sub.data.profession === 'أخرى (حدد)' && sub.data.customProfession ? sub.data.customProfession : sub.data.profession}
│ 🏦 Mode de réception salaire: ${sub.data.salaryReceiveMethod === 'CCP' ? 'CCP (Poste)' : 'Compte bancaire'}
│ 💳 Type de financement: ${sub.data.financingType}
│ 💵 Montant demandé: ${formatCurrencyFr(sub.data.requestedAmount)}
│ 👥 Client existant: ${sub.data.isExistingCustomer === 'نعم' ? 'Oui ✓' : 'Non ✗'}
${sub.data.notes ? `│ 📝 Notes: ${sub.data.notes}\n` : ''}│ 📊 Statut: ${getStatusFrench(sub.status)}
└─────────────────────────────────────────────────────────────────────────────┘

`
    })

    report += `════════════════════════════════════════════════════════════════════════════════
                                  STATISTIQUES
════════════════════════════════════════════════════════════════════════════════

📍 Répartition par Wilaya:
${Object.entries(file.statistics.byWilaya).map(([w, c]) => `   • ${w}: ${c} demande(s)`).join('\n')}

💳 Répartition par Type de Financement:
${Object.entries(file.statistics.byFinancingType).map(([t, c]) => `   • ${t}: ${c} demande(s)`).join('\n')}

🏦 Répartition par Mode de Salaire:
${Object.entries(file.statistics.bySalaryMethod).map(([m, c]) => `   • ${m === 'CCP' ? 'CCP (Poste)' : 'Banque'}: ${c} demande(s)`).join('\n')}

════════════════════════════════════════════════════════════════════════════════
Ce rapport a été généré automatiquement par le système TikCredit Pro
Date: ${new Date().toLocaleString('fr-FR')}
════════════════════════════════════════════════════════════════════════════════
`

    return report
}

/**
 * Format currency in French
 */
function formatCurrencyFr(amount: number): string {
    return `${amount.toLocaleString('fr-DZ')} DA`
}

/**
 * Get status in French
 */
function getStatusFrench(status: string): string {
    const statusMap: Record<string, string> = {
        'pending': '⏳ En attente',
        'synced': '✅ Synchronisé',
        'processed': '✔️ Traité',
        'failed': '❌ Échec'
    }
    return statusMap[status] || status
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE SYNC
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save submission to Firebase with retry logic
 */
async function saveToFirebase(submission: EliteSubmission): Promise<{ success: boolean; firebaseId?: string; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Firebase Admin not initialized' }
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const docRef = adminDb.collection('submissions').doc(submission.id)

            await docRef.set({
                ...submission,
                syncedToFirebase: true,
                status: 'synced',
                updatedAt: new Date().toISOString(),
                serverTimestamp: new Date(),
            })

            console.log(`✅ Firebase: Submission ${submission.id} saved (attempt ${attempt + 1})`)
            return { success: true, firebaseId: submission.id }
        } catch (error) {
            console.error(`❌ Firebase attempt ${attempt + 1} failed:`, error)

            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)))
            }
        }
    }

    return { success: false, error: 'Max retries exceeded' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ELITE PERSISTENCE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Elite Submission Persistence
 * Saves to Firebase + Monthly organized folders with print-ready reports
 */
export async function elitePersistSubmission(
    formData: FormData,
    metadata: { ip?: string; userAgent?: string }
): Promise<{
    success: boolean
    submissionId: string
    savedTo: string[]
    folderPath: string
    errors: string[]
}> {
    const now = new Date()
    const submissionId = crypto.randomUUID()

    const submission: EliteSubmission = {
        id: submissionId,
        timestamp: now.toISOString(),
        date: formatDateISO(now),
        time: formatTime(now),
        data: formData,
        syncedToFirebase: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        status: 'pending',
        retryCount: 0
    }

    const savedTo: string[] = []
    const errors: string[] = []
    const paths = getFilePaths(now)

    // 1. Save to Firebase (primary cloud storage)
    const firebaseResult = await saveToFirebase(submission)
    if (firebaseResult.success) {
        submission.syncedToFirebase = true
        submission.firebaseId = firebaseResult.firebaseId
        submission.status = 'synced'
        savedTo.push('Firebase')
    } else {
        errors.push(`Firebase: ${firebaseResult.error}`)
    }

    // 2. Save to monthly organized folder
    try {
        const dailyFile = await readDailySubmissions(now)

        // Check for duplicate
        if (!dailyFile.submissions.find(s => s.id === submissionId)) {
            dailyFile.submissions.push(submission)
        }

        await writeDailySubmissions(now, dailyFile)
        savedTo.push('LocalJSON')

        console.log(`✅ Local: Saved to ${paths.jsonFile}`)
    } catch (error) {
        errors.push(`Local: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 3. Generate print-ready reports
    try {
        const dailyFile = await readDailySubmissions(now)

        // Arabic report
        const arabicReport = generateArabicReport(dailyFile)
        await fs.writeFile(paths.arabicReport, arabicReport, 'utf-8')
        savedTo.push('ArabicReport')

        // French report
        const frenchReport = generateFrenchReport(dailyFile)
        await fs.writeFile(paths.frenchReport, frenchReport, 'utf-8')
        savedTo.push('FrenchReport')

        console.log(`✅ Reports: Generated AR & FR reports`)
    } catch (error) {
        errors.push(`Reports: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 4. Create backup
    try {
        const backupFile = path.join(BACKUP_DIR, `${formatDateISO(now)}_backup.json`)
        const dailyFile = await readDailySubmissions(now)
        await fs.writeFile(backupFile, JSON.stringify(dailyFile, null, 2), 'utf-8')
        savedTo.push('Backup')
    } catch (error) {
        // Backup failure is not critical
        console.warn('Backup warning:', error)
    }

    return {
        success: savedTo.length >= 1, // At least one storage method (e.g. Firebase on Vercel)
        submissionId,
        savedTo,
        folderPath: paths.folder,
        errors
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS FOR ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all submissions for a specific date
 */
export async function getSubmissionsByDate(date: Date): Promise<EliteSubmission[]> {
    const file = await readDailySubmissions(date)
    return file.submissions
}

/**
 * Get all submissions for a specific month
 */
export async function getSubmissionsByMonth(year: number, month: number): Promise<EliteSubmission[]> {
    const monthFolder = path.join(SUBMISSIONS_ROOT, year.toString(), FRENCH_MONTHS[month])
    const allSubmissions: EliteSubmission[] = []

    try {
        const files = await fs.readdir(monthFolder)
        const jsonFiles = files.filter(f => f.endsWith('_submissions.json'))

        for (const file of jsonFiles) {
            const content = await fs.readFile(path.join(monthFolder, file), 'utf-8')
            const dailyFile: DailySubmissionsFile = JSON.parse(content)
            allSubmissions.push(...dailyFile.submissions)
        }
    } catch {
        // Month folder doesn't exist
    }

    return allSubmissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Regenerate reports for a specific date
 */
export async function regenerateReports(date: Date): Promise<{ arabic: string; french: string }> {
    const dailyFile = await readDailySubmissions(date)
    const paths = getFilePaths(date)

    const arabicReport = generateArabicReport(dailyFile)
    await fs.writeFile(paths.arabicReport, arabicReport, 'utf-8')

    const frenchReport = generateFrenchReport(dailyFile)
    await fs.writeFile(paths.frenchReport, frenchReport, 'utf-8')

    dailyFile.metadata.lastPrintedAt = new Date().toISOString()
    await writeDailySubmissions(date, dailyFile)

    return { arabic: paths.arabicReport, french: paths.frenchReport }
}

/**
 * Get folder structure summary
 */
export async function getFolderStructure(): Promise<{
    years: {
        year: number
        months: {
            month: string
            submissionCount: number
            totalAmount: number
        }[]
    }[]
}> {
    const structure: { years: { year: number; months: { month: string; submissionCount: number; totalAmount: number }[] }[] } = { years: [] }

    try {
        const years = await fs.readdir(SUBMISSIONS_ROOT)

        for (const yearStr of years) {
            if (yearStr === 'backup' || isNaN(parseInt(yearStr))) continue

            const year = parseInt(yearStr)
            const yearPath = path.join(SUBMISSIONS_ROOT, yearStr)
            const months: { month: string; submissionCount: number; totalAmount: number }[] = []

            const monthFolders = await fs.readdir(yearPath)

            for (const monthFolder of monthFolders) {
                const monthPath = path.join(yearPath, monthFolder)
                const files = await fs.readdir(monthPath)
                const jsonFiles = files.filter(f => f.endsWith('_submissions.json'))

                let submissionCount = 0
                let totalAmount = 0

                for (const file of jsonFiles) {
                    const content = await fs.readFile(path.join(monthPath, file), 'utf-8')
                    const dailyFile: DailySubmissionsFile = JSON.parse(content)
                    submissionCount += dailyFile.statistics.total
                    totalAmount += dailyFile.statistics.totalAmount
                }

                months.push({ month: monthFolder, submissionCount, totalAmount })
            }

            structure.years.push({ year, months })
        }
    } catch {
        // Root doesn't exist yet
    }

    return structure
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Backup API for TikCredit Pro
 * Generate and download backups of all submissions
 */

const DATA_DIR = path.join(process.cwd(), 'data')
const BACKUPS_DIR = path.join(DATA_DIR, 'backups')

// Ensure backups directory exists
async function ensureBackupsDir() {
    try {
        await fs.mkdir(BACKUPS_DIR, { recursive: true })
    } catch { }
}

/**
 * GET /api/backup
 * Get latest backup status or download backup
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const decoded = await verifyToken(token)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const download = searchParams.get('download') === 'true'

        // Get submissions from Supabase or local storage
        let submissions: any[] = []

        try {
            const { supabaseAdmin } = await import('@/lib/supabase-admin')
            if (supabaseAdmin) {
                const { data, error } = await supabaseAdmin
                    .from('submissions')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    submissions = data
                }
            }
        } catch {
            // Fall back to local storage
            const { getLocalSubmissions } = await import('@/lib/storage-utils')
            submissions = await getLocalSubmissions()
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

        if (format === 'text' || format === 'txt') {
            // Generate printable text format
            const textContent = generatePrintableText(submissions)

            if (download) {
                return new NextResponse(textContent, {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Content-Disposition': `attachment; filename="submissions-${timestamp}.txt"`,
                    },
                })
            }

            return NextResponse.json({
                success: true,
                format: 'text',
                content: textContent,
                count: submissions.length,
                generatedAt: new Date().toISOString(),
            })
        }

        // JSON format
        const backup = {
            metadata: {
                generatedAt: new Date().toISOString(),
                count: submissions.length,
                source: 'supabase',
                version: '2.0.0',
            },
            submissions,
        }

        if (download) {
            return new NextResponse(JSON.stringify(backup, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="submissions-${timestamp}.json"`,
                },
            })
        }

        return NextResponse.json({
            success: true,
            format: 'json',
            ...backup,
        })

    } catch (error) {
        console.error('Backup error:', error)
        return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 })
    }
}

/**
 * POST /api/backup
 * Create and save a backup file
 */
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('admin-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const decoded = await verifyToken(token)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        }

        await ensureBackupsDir()

        // Get submissions
        let submissions: any[] = []

        try {
            const { supabaseAdmin } = await import('@/lib/supabase-admin')
            if (supabaseAdmin) {
                const { data, error } = await supabaseAdmin
                    .from('submissions')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (!error && data) {
                    submissions = data
                }
            }
        } catch {
            const { getLocalSubmissions } = await import('@/lib/storage-utils')
            submissions = await getLocalSubmissions()
        }

        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const timestamp = now.toISOString().replace(/[:.]/g, '-')

        // Save JSON backup
        const jsonBackup = {
            metadata: {
                generatedAt: now.toISOString(),
                count: submissions.length,
                source: 'supabase',
                version: '2.0.0',
            },
            submissions,
        }
        const jsonPath = path.join(BACKUPS_DIR, `backup-${dateStr}.json`)
        await fs.writeFile(jsonPath, JSON.stringify(jsonBackup, null, 2), 'utf-8')

        // Save text backup
        const textContent = generatePrintableText(submissions)
        const textPath = path.join(BACKUPS_DIR, `backup-${dateStr}.txt`)
        await fs.writeFile(textPath, textContent, 'utf-8')

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء النسخة الاحتياطية بنجاح',
            files: {
                json: jsonPath,
                text: textPath,
            },
            count: submissions.length,
            generatedAt: now.toISOString(),
        })

    } catch (error) {
        console.error('Backup creation error:', error)
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
    }
}

/**
 * Generate printable text format (French + Arabic)
 */
function generatePrintableText(submissions: any[]): string {
    const lines: string[] = []
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })

    lines.push('═══════════════════════════════════════════════════════════════════════════════')
    lines.push('                    TIKCREDIT PRO - LISTE DES DEMANDES')
    lines.push('                         قائمة طلبات التمويل')
    lines.push('═══════════════════════════════════════════════════════════════════════════════')
    lines.push(`  Généré le / تم الإنشاء في: ${timestamp}`)
    lines.push(`  Nombre total / العدد الإجمالي: ${submissions.length}`)
    lines.push('═══════════════════════════════════════════════════════════════════════════════')
    lines.push('')

    submissions.forEach((sub, index) => {
        const data = sub.data || sub
        const date = new Date(sub.timestamp || sub.created_at).toLocaleString('fr-FR', {
            timeZone: 'Africa/Algiers'
        })

        lines.push('───────────────────────────────────────────────────────────────────────────────')
        lines.push(`  DEMANDE N° ${index + 1} / الطلب رقم ${index + 1}`)
        lines.push('───────────────────────────────────────────────────────────────────────────────')
        lines.push(`  ID: ${sub.id}`)
        lines.push(`  Date / التاريخ: ${date}`)
        lines.push('')
        lines.push(`  Nom complet / الاسم الكامل:`)
        lines.push(`    ${data.fullName || data.full_name || 'N/A'}`)
        lines.push('')
        lines.push(`  Téléphone / الهاتف:`)
        lines.push(`    ${data.phone || 'N/A'}`)
        lines.push('')
        lines.push(`  Email / البريد الإلكتروني:`)
        lines.push(`    ${data.email || 'Non fourni / غير متوفر'}`)
        lines.push('')
        lines.push(`  Wilaya / الولاية:`)
        lines.push(`    ${data.wilaya || 'N/A'}`)
        lines.push('')
        lines.push(`  Profession / المهنة:`)
        lines.push(`    ${data.profession || data.custom_profession || 'Non spécifié / غير محدد'}`)
        lines.push('')
        lines.push(`  Revenus mensuels / الدخل الشهري:`)
        lines.push(`    ${data.monthlyIncomeRange || data.monthly_income_range || 'Non spécifié / غير محدد'}`)
        lines.push('')
        lines.push(`  Mode de réception salaire / طريقة استلام الراتب:`)
        lines.push(`    ${data.salaryReceiveMethod || data.salary_receive_method || 'N/A'}`)
        lines.push('')
        lines.push(`  Type de financement / نوع التمويل:`)
        lines.push(`    ${data.financingType || data.financing_type || 'N/A'}`)
        lines.push('')
        lines.push(`  Montant demandé / المبلغ المطلوب:`)
        const amount = data.requestedAmount || data.requested_amount || 0
        lines.push(`    ${amount.toLocaleString('fr-FR')} DA / ${amount.toLocaleString('ar-DZ')} د.ج`)
        lines.push('')
        lines.push(`  Client existant / عميل حالي:`)
        lines.push(`    ${data.isExistingCustomer || data.is_existing_customer || 'Non spécifié'}`)
        lines.push('')
        lines.push(`  Horaire préféré / الوقت المفضل للاتصال:`)
        lines.push(`    ${data.preferredContactTime || data.preferred_contact_time || 'Non spécifié'}`)

        if (data.notes) {
            lines.push('')
            lines.push(`  Notes / ملاحظات:`)
            lines.push(`    ${data.notes}`)
        }
        lines.push('')
        lines.push('')
    })

    lines.push('═══════════════════════════════════════════════════════════════════════════════')
    lines.push('                           FIN DU RAPPORT')
    lines.push('                           نهاية التقرير')
    lines.push('═══════════════════════════════════════════════════════════════════════════════')

    return lines.join('\n')
}

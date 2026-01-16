import { NextRequest, NextResponse } from 'next/server'
import { relaxedRateLimiter } from '@/lib/rateLimit'
import { validatePhone, validateEmail } from '@/lib/utils'
import { elitePersistSubmission } from '@/lib/eliteSubmissionManager'
import { FormData } from '@/types'
import { sendSubmissionNotification } from '@/lib/emailService'

// ═══════════════════════════════════════════════════════════════════════════════
// ELITE SUBMISSION API - TikCredit Pro
// Ultra-Professional Form Submission Handler
// ═══════════════════════════════════════════════════════════════════════════════

// Loan amount validation constants
const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000

// Duplicate prevention cache
const recentSubmissions = new Map<string, number>()
const DUPLICATE_WINDOW_MS = 60_000

/**
 * Clean up duplicate cache
 */
function cleanupDuplicateCache(): void {
  const now = Date.now()
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentSubmissions.delete(key)
    }
  }
}

/**
 * Generate submission fingerprint
 */
function generateFingerprint(data: FormData, ip: string): string {
  return `${ip}-${data.phone}-${data.fullName}-${data.requestedAmount}`
}

/**
 * Validate loan amount
 */
function validateLoanAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: 'المبلغ المطلوب مطلوب' }
  }
  if (amount < MIN_LOAN_AMOUNT) {
    return { valid: false, error: `المبلغ الأدنى: ${MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  }
  if (amount > MAX_LOAN_AMOUNT) {
    return { valid: false, error: `المبلغ الأقصى: ${MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  }
  return { valid: true }
}

/**
 * Calculate approval probability
 */
function calculateApprovalProbability(data: FormData): number {
  let score = 50

  const incomeRanges = ['أقل من 30,000 د.ج', '30,000 - 50,000 د.ج', '50,000 - 80,000 د.ج', '80,000 - 120,000 د.ج', 'أكثر من 120,000 د.ج']
  const incomeIndex = incomeRanges.indexOf(data.monthlyIncomeRange)
  if (incomeIndex >= 0) score += incomeIndex * 10

  if (data.isExistingCustomer === 'نعم') score += 10
  if (data.email) score += 5
  if (data.preferredContactTime) score += 5

  return Math.min(95, Math.max(30, score))
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    cleanupDuplicateCache()

    // Rate limiting
    const rateLimitResult = relaxedRateLimiter.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() } }
      )
    }

    // Parse body
    let data: FormData
    try {
      data = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON', message: 'يرجى التحقق من البيانات' }, { status: 400 })
    }

    // Validation
    const errors: string[] = []
    if (!data.fullName || data.fullName.trim().length < 3) errors.push('الاسم الكامل مطلوب (3 أحرف على الأقل)')
    if (!data.phone || !validatePhone(data.phone)) errors.push('رقم الهاتف غير صحيح')
    if (data.email && !validateEmail(data.email)) errors.push('البريد الإلكتروني غير صحيح')
    if (!data.wilaya) errors.push('الولاية مطلوبة')
    if (!data.salaryReceiveMethod) errors.push('طريقة استلام الراتب مطلوبة')
    if (!data.financingType) errors.push('نوع التمويل مطلوب')

    const amountValidation = validateLoanAmount(data.requestedAmount)
    if (!amountValidation.valid) errors.push(amountValidation.error!)

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors, message: 'يرجى تصحيح الأخطاء' }, { status: 400 })
    }

    // Client info
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Duplicate check
    const fingerprint = generateFingerprint(data, clientIp)
    if (recentSubmissions.has(fingerprint)) {
      return NextResponse.json({ success: true, message: 'تم استلام طلبك بالفعل', duplicate: true }, { status: 200 })
    }
    recentSubmissions.set(fingerprint, Date.now())

    // ═══════════════════════════════════════════════════════════════════════════
    // ELITE PERSISTENCE - Triple layer with monthly organization
    // ═══════════════════════════════════════════════════════════════════════════

    const result = await elitePersistSubmission(data, { ip: clientIp, userAgent })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'حدث خطأ في حفظ الطلب',
        error: 'Storage unavailable',
        errors: result.errors
      }, { status: 503 })
    }

    // Log success
    console.log('═'.repeat(60))
    console.log('✅ ELITE SUBMISSION SAVED')
    console.log(`   ID: ${result.submissionId}`)
    console.log(`   Saved to: ${result.savedTo.join(', ')}`)
    console.log(`   Folder: ${result.folderPath}`)
    console.log('═'.repeat(60))

    // Send email notification (non-blocking)
    sendSubmissionNotification(
      result.submissionId,
      new Date().toISOString(),
      data,
      process.env.NEXT_PUBLIC_APP_URL || 'https://tikcredit.com'
    ).catch(console.error)

    // Real-time broadcast (non-blocking)
    const internalToken = process.env.INTERNAL_API_TOKEN
    if (internalToken) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/realtime/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Token': internalToken },
        body: JSON.stringify({ id: result.submissionId, timestamp: new Date().toISOString(), data, status: 'pending' }),
      }).catch(() => { })
    }

    return NextResponse.json({
      success: true,
      message: 'تم استلام طلبك بنجاح!',
      submissionId: result.submissionId,
      savedTo: result.savedTo,
      folderPath: result.folderPath,
      approvalProbability: calculateApprovalProbability(data),
      storageInfo: {
        firebase: result.savedTo.includes('Firebase'),
        localJson: result.savedTo.includes('LocalJSON'),
        arabicReport: result.savedTo.includes('ArabicReport'),
        frenchReport: result.savedTo.includes('FrenchReport'),
        backup: result.savedTo.includes('Backup')
      }
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } })

  } catch (error) {
    console.error('❌ Submission API Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: 'حدث خطأ في الخادم',
      ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.message : 'Unknown' })
    }, { status: 500 })
  }
}

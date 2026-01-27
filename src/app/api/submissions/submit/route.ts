import { NextRequest, NextResponse } from 'next/server'
import { validatePhone, validateEmail } from '@/lib/utils'
import { FormData } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION-READY SUBMISSION API - TikCredit Pro v4.0 (Supabase Edition)
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Storage Strategy:
// - PRODUCTION: Supabase ONLY (local storage disabled on Vercel)
// - DEVELOPMENT: Supabase + Local storage (dual persistence)
// ═══════════════════════════════════════════════════════════════════════════════

const isDev = process.env.NODE_ENV === 'development'
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined

// Loan amount validation constants
const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000

// In-memory duplicate prevention (works per-instance)
const recentSubmissions = new Map<string, number>()
const DUPLICATE_WINDOW_MS = 60_000

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

function log(message: string, ...args: unknown[]): void {
  console.log(`[SUBMIT] ${message}`, ...args)
}

function logError(message: string, ...args: unknown[]): void {
  console.error(`[SUBMIT ERROR] ${message}`, ...args)
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function cleanupDuplicates(): void {
  const now = Date.now()
  for (const [k, t] of recentSubmissions.entries()) {
    if (now - t > DUPLICATE_WINDOW_MS) recentSubmissions.delete(k)
  }
}

function fingerprint(data: FormData, ip: string): string {
  return `${ip}-${data.phone}-${data.fullName}-${data.requestedAmount}`
}

function validateAmount(amount: number): { ok: boolean; msg?: string } {
  if (!amount || isNaN(amount)) return { ok: false, msg: 'المبلغ المطلوب مطلوب' }
  if (amount < MIN_LOAN_AMOUNT) return { ok: false, msg: `الحد الأدنى: ${MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  if (amount > MAX_LOAN_AMOUNT) return { ok: false, msg: `الحد الأقصى: ${MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` }
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE STORAGE - PRIMARY for Production
// ═══════════════════════════════════════════════════════════════════════════════

async function saveToSupabase(
  submissionId: string,
  data: FormData,
  metadata: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()

  try {
    log(`Supabase: Attempting to save ${submissionId}...`)

    // Import supabase-admin module
    const { adminSaveSubmission } = await import('@/lib/supabase-admin')

    const result = await adminSaveSubmission(submissionId, data, metadata)

    const elapsed = Date.now() - startTime

    if (result.success) {
      log(`Supabase: SUCCESS - Saved ${submissionId} in ${elapsed}ms`)
    } else {
      logError(`Supabase: FAILED after ${elapsed}ms - ${result.error}`)
    }

    return result

  } catch (error) {
    const elapsed = Date.now() - startTime
    const errMsg = error instanceof Error ? error.message : 'Supabase save failed'
    const errStack = error instanceof Error ? error.stack : ''

    logError(`Supabase: FAILED after ${elapsed}ms - ${errMsg}`)
    if (isDev && errStack) {
      console.error('Stack:', errStack)
    }

    return { success: false, error: errMsg }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE - Development ONLY (Vercel has read-only filesystem)
// ═══════════════════════════════════════════════════════════════════════════════

async function saveToLocalDisk(
  submissionId: string,
  data: FormData,
  metadata: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string }> {
  // CRITICAL: Skip local storage on Vercel - filesystem is read-only!
  if (isVercel) {
    log('LocalDisk: SKIPPED (Vercel has read-only filesystem)')
    return { success: false, error: 'Vercel read-only filesystem' }
  }

  try {
    const { saveToLocalDisk: save } = await import('@/lib/server-storage')
    const result = await save(submissionId, data, metadata)

    if (result.success) {
      log(`LocalDisk: SUCCESS - Saved ${submissionId}`)
    } else {
      log(`LocalDisk: FAILED - ${result.error}`)
    }

    return { success: result.success, error: result.error }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Local storage failed'
    logError(`LocalDisk: EXCEPTION - ${errMsg}`)
    return { success: false, error: errMsg }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATION (non-blocking, fire-and-forget)
// ═══════════════════════════════════════════════════════════════════════════════

function sendNotificationAsync(id: string, data: FormData): void {
  import('@/lib/emailService')
    .then(({ sendSubmissionNotification }) => {
      return sendSubmissionNotification(id, new Date().toISOString(), data, process.env.NEXT_PUBLIC_APP_URL || '')
    })
    .then(() => log(`Email: Notification sent for ${id}`))
    .catch((err) => log(`Email: Failed to send (non-critical) - ${err?.message || 'unknown'}`))
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST HANDLER - Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const submissionId = crypto.randomUUID()

  log(`═══════════════════════════════════════════════════════`)
  log(`NEW REQUEST - ID: ${submissionId}`)
  log(`Environment: ${isVercel ? 'VERCEL/PRODUCTION' : 'LOCAL/DEVELOPMENT'}`)
  log(`Backend: SUPABASE`)
  log(`═══════════════════════════════════════════════════════`)

  try {
    cleanupDuplicates()

    // Parse request body
    let data: FormData
    try {
      data = await request.json()
    } catch (parseError) {
      logError('Failed to parse JSON body:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON',
        message: 'البيانات المرسلة غير صحيحة'
      }, { status: 400 })
    }

    log(`Client: ${data.fullName} | Phone: ${data.phone} | Amount: ${data.requestedAmount?.toLocaleString()} DZD`)

    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    const validationErrors: string[] = []
    if (!data.fullName || data.fullName.trim().length < 3) {
      validationErrors.push('الاسم مطلوب (3 أحرف على الأقل)')
    }
    if (!data.phone || !validatePhone(data.phone)) {
      validationErrors.push('رقم الهاتف غير صحيح')
    }
    if (data.email && !validateEmail(data.email)) {
      validationErrors.push('البريد الإلكتروني غير صحيح')
    }
    if (!data.wilaya) validationErrors.push('الولاية مطلوبة')
    if (!data.salaryReceiveMethod) validationErrors.push('طريقة الراتب مطلوبة')
    if (!data.financingType) validationErrors.push('نوع التمويل مطلوب')

    const amtCheck = validateAmount(data.requestedAmount)
    if (!amtCheck.ok) validationErrors.push(amtCheck.msg!)

    if (validationErrors.length > 0) {
      log(`Validation FAILED: ${validationErrors.join(', ')}`)
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        message: 'يرجى تصحيح الأخطاء'
      }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DUPLICATE CHECK
    // ═══════════════════════════════════════════════════════════════════════════

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const fp = fingerprint(data, ip)

    if (recentSubmissions.has(fp)) {
      log(`Duplicate detected for fingerprint: ${fp.substring(0, 30)}...`)
      return NextResponse.json({
        success: true,
        message: 'تم استلام طلبك بالفعل',
        duplicate: true,
        submissionId: 'duplicate'
      }, { status: 200 })
    }
    recentSubmissions.set(fp, Date.now())

    // ═══════════════════════════════════════════════════════════════════════════
    // SAVE SUBMISSION
    // ═══════════════════════════════════════════════════════════════════════════

    const userAgent = request.headers.get('user-agent') || 'unknown'
    const metadata = { ip, userAgent }

    let supabaseResult: { success: boolean; error?: string }
    let localResult: { success: boolean; error?: string } = { success: false, error: 'skipped' }

    // Try Supabase first (primary storage)
    supabaseResult = await saveToSupabase(submissionId, data, metadata)

    // Try local storage only in development
    if (!isVercel) {
      localResult = await saveToLocalDisk(submissionId, data, metadata)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DETERMINE SUCCESS
    // ═══════════════════════════════════════════════════════════════════════════

    const savedTo: string[] = []
    const errors: string[] = []

    if (supabaseResult.success) {
      savedTo.push('Supabase')
    } else if (supabaseResult.error) {
      errors.push(`Supabase: ${supabaseResult.error}`)
    }

    if (localResult.success) {
      savedTo.push('LocalDisk')
    } else if (localResult.error && localResult.error !== 'skipped') {
      errors.push(`Local: ${localResult.error}`)
    }

    // SUCCESS = at least one storage worked
    const success = savedTo.length > 0

    log(`RESULT: ${success ? 'SUCCESS' : 'FAILED'}`)
    log(`Saved to: ${savedTo.join(', ') || 'NONE'}`)
    if (errors.length > 0) {
      log(`Errors: ${errors.join(' | ')}`)
    }
    log(`═══════════════════════════════════════════════════════`)

    // Send email notification (fire-and-forget, non-blocking)
    if (success) {
      sendNotificationAsync(submissionId, data)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE
    // ═══════════════════════════════════════════════════════════════════════════

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'تم استلام طلبك بنجاح!',
        submissionId,
        syncedToSupabase: supabaseResult.success,
        persisted: supabaseResult.success ? 'supabase' : 'local',
      }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      })
    } else {
      // CRITICAL FAILURE - Nothing was saved
      logError(`CRITICAL: No storage succeeded for ${submissionId}`)
      logError(`Errors: ${errors.join(' | ')}`)

      return NextResponse.json({
        success: false,
        message: 'حدث خطأ أثناء حفظ الطلب',
        submissionId,
        errors: isDev ? errors : [],
        debug: isDev ? { savedTo, errors, isVercel } : undefined
      }, {
        status: 500,
        headers: { 'Cache-Control': 'no-store' }
      })
    }

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    const errStack = error instanceof Error ? error.stack : ''

    logError(`CRITICAL EXCEPTION: ${errMsg}`)
    if (errStack) {
      console.error('Stack:', errStack)
    }

    return NextResponse.json({
      success: false,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      submissionId,
      error: isDev ? errMsg : undefined
    }, { status: 500 })
  }
}

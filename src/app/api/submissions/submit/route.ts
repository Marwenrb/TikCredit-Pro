import { NextRequest, NextResponse } from 'next/server'
import { validatePhone, validateEmail } from '@/lib/utils'
import { FormData } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION-READY SUBMISSION API - TikCredit Pro v2.1
// ULTRA-PROFESSIONAL with Dual-Persistence: DAT (Local) + Firebase (Cloud)
// Non-blocking I/O with Promise.allSettled for fail-safe operation
// Enhanced Firebase debugging for sync issues
// ═══════════════════════════════════════════════════════════════════════════════

const isDev = process.env.NODE_ENV === 'development'

// Loan amount validation constants
const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000

// In-memory duplicate prevention
const recentSubmissions = new Map<string, number>()
const DUPLICATE_WINDOW_MS = 60_000

// ═══════════════════════════════════════════════════════════════════════════════
// CONDITIONAL LOGGING - Silent in production
// ═══════════════════════════════════════════════════════════════════════════════

function devLog(message: string, ...args: unknown[]): void {
  if (isDev) {
    console.log(message, ...args)
  }
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
// STORAGE LAYER 1: LOCAL DISK (dat folder) - GUARANTEED
// ═══════════════════════════════════════════════════════════════════════════════

async function saveToLocalDisk(
  submissionId: string,
  data: FormData,
  metadata: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string; reportPath?: string }> {
  try {
    const { saveToLocalDisk: save } = await import('@/lib/server-storage')
    const result = await save(submissionId, data, metadata)
    return { success: result.success, error: result.error, reportPath: result.reportPath }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Local storage failed'
    console.error('❌ DAT Storage Error:', errMsg)
    return { success: false, error: errMsg }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE LAYER 2: FIREBASE (Cloud) - WITH DETAILED DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════════

async function saveToFirebase(
  submissionId: string,
  data: FormData,
  metadata: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string; diagnostics?: string }> {
  const startTime = Date.now()

  try {
    // Step 1: Import firebase-admin module
    devLog(`🔄 Firebase: Importing firebase-admin module...`)
    const firebaseModule = await import('@/lib/firebase-admin')
    const { adminDb } = firebaseModule

    // Step 2: Check if Firebase is initialized
    if (!adminDb) {
      const diagnostics = [
        'Firebase Admin SDK not initialized.',
        'Possible causes:',
        '  1. Missing FIREBASE_PROJECT_ID environment variable',
        '  2. Missing FIREBASE_CLIENT_EMAIL environment variable',
        '  3. Missing or malformed FIREBASE_PRIVATE_KEY environment variable',
        '  4. No service-account-key.json file found',
        '',
        'Current environment check:',
        `  - FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}`,
        `  - FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing'}`,
        `  - FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? `✓ Set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '✗ Missing'}`,
      ].join('\n')

      console.warn('⚠️ Firebase Connection Issue:\n' + diagnostics)
      return { success: false, error: 'Firebase not configured', diagnostics }
    }

    // Step 3: Attempt to save
    devLog(`🔄 Firebase: Saving submission ${submissionId}...`)
    const now = new Date()

    await adminDb.collection('submissions').doc(submissionId).set({
      id: submissionId,
      timestamp: now.toISOString(),
      data,
      metadata: {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        savedAt: now.toISOString()
      },
      serverTimestamp: now,
    })

    const elapsed = Date.now() - startTime
    devLog(`✅ Firebase: Saved ${submissionId} in ${elapsed}ms`)

    // Step 4: Mark as synced in local storage
    try {
      const { markAsSynced } = await import('@/lib/server-storage')
      await markAsSynced(submissionId)
      devLog(`✅ Firebase: Updated local sync status for ${submissionId}`)
    } catch (syncError) {
      // Non-critical - local sync status update failed
      devLog(`⚠️ Firebase: Could not update local sync status:`, syncError)
    }

    return { success: true, diagnostics: `Saved in ${elapsed}ms` }

  } catch (error) {
    const elapsed = Date.now() - startTime
    const errMsg = error instanceof Error ? error.message : 'Firebase save failed'
    const errStack = error instanceof Error ? error.stack : ''

    // Detailed error diagnostics
    const diagnostics = [
      `Firebase Error after ${elapsed}ms:`,
      `  Message: ${errMsg}`,
      '',
      'Error classification:',
      errMsg.includes('private key') || errMsg.includes('PEM')
        ? '  → Private key format issue - check FIREBASE_PRIVATE_KEY escaping'
        : errMsg.includes('PERMISSION_DENIED') || errMsg.includes('permission')
          ? '  → Firestore rules blocking write - check firestore.rules'
          : errMsg.includes('NOT_FOUND')
            ? '  → Collection or project not found'
            : errMsg.includes('timeout') || errMsg.includes('DEADLINE_EXCEEDED')
              ? '  → Network timeout - check connectivity'
              : errMsg.includes('UNAUTHENTICATED')
                ? '  → Authentication failed - credentials may be invalid'
                : '  → Unknown error type',
      '',
      isDev ? `Stack trace:\n${errStack}` : ''
    ].filter(Boolean).join('\n')

    console.error('❌ Firebase Error:\n' + diagnostics)

    return { success: false, error: errMsg, diagnostics }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATION (non-blocking, fire-and-forget)
// ═══════════════════════════════════════════════════════════════════════════════

function sendNotificationAsync(id: string, data: FormData): void {
  // Fire and forget - don't await
  import('@/lib/emailService')
    .then(({ sendSubmissionNotification }) => {
      return sendSubmissionNotification(id, new Date().toISOString(), data, process.env.NEXT_PUBLIC_APP_URL || '')
    })
    .catch(() => {
      // Email failure is non-critical - silently ignore
    })
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST HANDLER - Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const submissionId = crypto.randomUUID()

  try {
    cleanupDuplicates()

    // Parse request body
    let data: FormData
    try {
      data = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Validation failed', errors: validationErrors }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DUPLICATE CHECK
    // ═══════════════════════════════════════════════════════════════════════════

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const fp = fingerprint(data, ip)

    if (recentSubmissions.has(fp)) {
      return NextResponse.json({
        success: true,
        message: 'تم استلام طلبك بالفعل',
        duplicate: true
      }, { status: 200 })
    }
    recentSubmissions.set(fp, Date.now())

    // ═══════════════════════════════════════════════════════════════════════════
    // DUAL-PERSISTENCE: Promise.allSettled for Non-Blocking I/O
    // Both saves run in parallel - one can fail without affecting the other
    // ═══════════════════════════════════════════════════════════════════════════

    const userAgent = request.headers.get('user-agent') || 'unknown'
    const metadata = { ip, userAgent }

    devLog(`\n═══════════════════════════════════════════════════════`)
    devLog(`   🆔 NEW SUBMISSION: ${submissionId}`)
    devLog(`   👤 Name: ${data.fullName}`)
    devLog(`   📱 Phone: ${data.phone}`)
    devLog(`   💰 Amount: ${data.requestedAmount.toLocaleString()} DZD`)
    devLog(`═══════════════════════════════════════════════════════`)

    const [localResult, firebaseResult] = await Promise.allSettled([
      saveToLocalDisk(submissionId, data, metadata),
      saveToFirebase(submissionId, data, metadata)
    ])

    // Parse results
    const savedTo: string[] = []
    const errors: string[] = []

    // Local Disk Result
    if (localResult.status === 'fulfilled' && localResult.value.success) {
      savedTo.push('LocalDisk')
      if (localResult.value.reportPath) {
        savedTo.push('TextReport')
      }
    } else {
      const err = localResult.status === 'fulfilled'
        ? localResult.value.error
        : localResult.reason?.message || 'Local save failed'
      errors.push(`Local: ${err}`)
    }

    // Firebase Result
    if (firebaseResult.status === 'fulfilled' && firebaseResult.value.success) {
      savedTo.push('Firebase')
    } else {
      const err = firebaseResult.status === 'fulfilled'
        ? firebaseResult.value.error
        : firebaseResult.reason?.message || 'Firebase save failed'
      errors.push(`Firebase: ${err}`)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LOGGING - Results Summary
    // ═══════════════════════════════════════════════════════════════════════════

    if (isDev) {
      console.log(`   ✅ Saved To: ${savedTo.join(', ') || 'NONE'}`)
      if (errors.length > 0) {
        console.log(`   ⚠️ Errors: ${errors.join(' | ')}`)
      }
      console.log(`═══════════════════════════════════════════════════════\n`)
    }

    // Send email notification (fire-and-forget)
    sendNotificationAsync(submissionId, data)

    // ═══════════════════════════════════════════════════════════════════════════
    // RESPONSE - Success if at least ONE storage layer worked
    // ═══════════════════════════════════════════════════════════════════════════

    const success = savedTo.length > 0
    const syncedToFirebase = savedTo.includes('Firebase')

    return NextResponse.json({
      success,
      message: success ? 'تم استلام طلبك بنجاح!' : 'حدث خطأ أثناء حفظ الطلب',
      submissionId,
      syncedToFirebase, // Explicit sync status for debugging
      persisted: syncedToFirebase ? 'firebase' :
        savedTo.includes('LocalDisk') ? 'local' : 'failed',
      // Debug info only in development
      ...(isDev && {
        debug: {
          savedTo,
          errors,
          firebaseDiagnostics: firebaseResult.status === 'fulfilled'
            ? firebaseResult.value.diagnostics
            : firebaseResult.reason?.message
        }
      })
    }, {
      status: success ? 200 : 500,
      headers: { 'Cache-Control': 'no-store' }
    })

  } catch (error) {
    console.error('❌ Critical API Error:', error)

    return NextResponse.json({
      success: false,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      submissionId,
      error: isDev ? (error instanceof Error ? error.message : 'Unknown') : undefined
    }, { status: 500 })
  }
}

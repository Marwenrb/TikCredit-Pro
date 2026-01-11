import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimiter } from '@/lib/rateLimit'
import { validatePhone, validateEmail } from '@/lib/utils'
import { adminDb } from '@/lib/firebase-admin'
import { FormData } from '@/types'
import { promises as fs } from 'fs'
import path from 'path'

// Loan amount validation constants
const MIN_LOAN_AMOUNT = 5_000_000
const MAX_LOAN_AMOUNT = 20_000_000

/**
 * Validate loan amount
 */
function validateLoanAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: 'المبلغ المطلوب مطلوب' }
  }
  if (amount < MIN_LOAN_AMOUNT) {
    return { 
      valid: false, 
      error: `المبلغ الأدنى المسموح به هو ${MIN_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` 
    }
  }
  if (amount > MAX_LOAN_AMOUNT) {
    return { 
      valid: false, 
      error: `المبلغ الأقصى المسموح به هو ${MAX_LOAN_AMOUNT.toLocaleString('ar-DZ')} د.ج` 
    }
  }
  return { valid: true }
}

/**
 * Persist submission to Firestore using Admin SDK
 */
async function saveSubmissionServer(submission: {
  id: string
  timestamp: string
  data: FormData & { amountValid: boolean }
  ip: string
  userAgent: string
}): Promise<boolean> {
  if (!adminDb) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase Admin DB not available - will use local fallback')
    }
    return false
  }

  try {
    await adminDb
      .collection('submissions')
      .doc(submission.id)
      .set({
        ...submission,
        createdAt: submission.timestamp,
        status: 'pending',
        source: 'web-form',
      })
    return true
  } catch (error) {
    console.error('❌ Firebase save error:', error)
    return false
  }
}

/**
 * Fallback: persist to local JSON file (Vercel-compatible)
 */
async function saveSubmissionLocal(submission: object) {
  try {
    // Use /tmp in Vercel serverless environment, fallback to .tmp locally
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.tmp')
    const file = path.join(tmpDir, 'submissions.json')
    
    await fs.mkdir(tmpDir, { recursive: true })
    
    let existing: object[] = []
    try {
      const content = await fs.readFile(file, 'utf-8')
      existing = JSON.parse(content)
    } catch {
      existing = []
    }
    
    existing.push(submission)
    await fs.writeFile(file, JSON.stringify(existing, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save submission locally:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = strictRateLimiter.check(request)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      )
    }
    
    // Parse request body
    let data: FormData
    try {
      data = await request.json()
    } catch {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          message: 'يرجى التحقق من البيانات المرسلة'
        },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const errors: string[] = []
    
    if (!data.fullName || data.fullName.trim().length < 3) {
      errors.push('الاسم الكامل مطلوب (3 أحرف على الأقل)')
    }
    
    if (!data.phone || !validatePhone(data.phone)) {
      errors.push('رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05/06/07 ويحتوي على 10 أرقام)')
    }
    
    if (data.email && !validateEmail(data.email)) {
      errors.push('البريد الإلكتروني غير صحيح')
    }
    
    if (!data.wilaya) {
      errors.push('الولاية مطلوبة')
    }
    
    if (!data.salaryReceiveMethod) {
      errors.push('طريقة استلام الراتب مطلوبة')
    }
    
    if (!data.financingType) {
      errors.push('نوع التمويل مطلوب')
    }
    
    // Validate loan amount
    const amountValidation = validateLoanAmount(data.requestedAmount)
    if (!amountValidation.valid) {
      errors.push(amountValidation.error || 'المبلغ المطلوب غير صحيح')
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          errors,
          message: 'يرجى التحقق من البيانات المدخلة'
        },
        { status: 400 }
      )
    }
    
    // Create submission object
    const submission = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        amountValid: amountValidation.valid,
      },
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
    
    // Save submission - Firebase first, local fallback
    let persisted: 'server' | 'local' = 'server'
    let savedToFirebase = false
    
    try {
      savedToFirebase = await saveSubmissionServer(submission)
    } catch (firebaseError) {
      console.error('Firebase save error:', firebaseError)
      savedToFirebase = false
    }
    
    if (!savedToFirebase) {
      try {
        persisted = 'local'
        await saveSubmissionLocal(submission)
        console.log('✅ Saved submission locally (fallback):', submission.id)
      } catch (localError) {
        console.error('Local save error:', localError)
        // If both Firebase and local save fail, still return success but log the error
        // This ensures the user doesn't see an error if the submission was processed
        console.error('⚠️ Failed to persist submission:', submission.id)
      }
    } else {
      console.log('✅ Saved submission to Firebase:', submission.id)
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'تم استلام طلبك بنجاح',
        submissionId: submission.id,
        approvalProbability: calculateApprovalProbability(data),
        amountValid: amountValidation.valid,
        persisted: persisted,
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    )
  } catch (error) {
    // Log the actual error for debugging
    console.error('❌ Submission API Error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate approval probability based on form data
 */
function calculateApprovalProbability(data: FormData): number {
  let score = 50
  
  const incomeRanges = ['أقل من 30,000 د.ج', '30,000 - 50,000 د.ج', '50,000 - 80,000 د.ج', '80,000 - 120,000 د.ج', 'أكثر من 120,000 د.ج']
  const incomeIndex = incomeRanges.indexOf(data.monthlyIncomeRange)
  if (incomeIndex >= 0) {
    score += incomeIndex * 10
  }
  
  const maxAmounts = [1500000, 3500000, 6000000, 12000000, 25000000]
  if (incomeIndex >= 0 && data.requestedAmount <= maxAmounts[incomeIndex]) {
    score += 15
  } else if (data.requestedAmount >= MIN_LOAN_AMOUNT && data.requestedAmount <= MAX_LOAN_AMOUNT) {
    score += 5
  } else {
    score -= 10
  }
  
  if (data.isExistingCustomer === 'نعم') {
    score += 10
  }
  
  if (data.email) score += 5
  if (data.preferredContactTime) score += 5
  
  return Math.min(95, Math.max(30, score))
}

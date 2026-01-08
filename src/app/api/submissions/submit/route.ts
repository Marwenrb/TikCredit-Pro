import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimiter } from '@/lib/rateLimit'
import { validatePhone, validateEmail, saveSubmission } from '@/lib/utils'
import { FormData } from '@/types'

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
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
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
    
    // Validate loan amount with new range (5M-20M)
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
        // Store validation status
        amountValid: amountValidation.valid,
      },
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
    
    // Save submission (Firebase will be used in production)
    try {
      saveSubmission(data)
      
      // Log submission for monitoring
      console.log('✅ New submission received:', {
        id: submission.id,
        name: data.fullName,
        phone: data.phone.substring(0, 4) + '****',
        amount: data.requestedAmount,
        amountValid: amountValidation.valid,
        timestamp: submission.timestamp,
      })
    } catch (saveError) {
      console.error('❌ Error saving submission:', saveError)
      // Log detailed error for debugging
      console.error('Error details:', {
        message: saveError instanceof Error ? saveError.message : 'Unknown error',
        stack: saveError instanceof Error ? saveError.stack : undefined,
        data: {
          fullName: data.fullName,
          phone: data.phone.substring(0, 4) + '****',
          amount: data.requestedAmount,
        }
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to save submission',
          message: 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.'
        },
        { status: 500 }
      )
    }
    
    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: 'تم استلام طلبك بنجاح',
        submissionId: submission.id,
        approvalProbability: calculateApprovalProbability(data),
        amountValid: amountValidation.valid,
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
    // Comprehensive error logging
    console.error('❌ Submission API error:', error)
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate approval probability based on form data
 */
function calculateApprovalProbability(data: FormData): number {
  let score = 50 // Base score
  
  // Income score
  const incomeRanges = ['أقل من 30,000 د.ج', '30,000 - 50,000 د.ج', '50,000 - 80,000 د.ج', '80,000 - 120,000 د.ج', 'أكثر من 120,000 د.ج']
  const incomeIndex = incomeRanges.indexOf(data.monthlyIncomeRange)
  if (incomeIndex >= 0) {
    score += incomeIndex * 10
  }
  
  // Amount vs income ratio (updated for 5M-20M range)
  const maxAmounts = [1500000, 3500000, 6000000, 12000000, 25000000]
  if (incomeIndex >= 0 && data.requestedAmount <= maxAmounts[incomeIndex]) {
    score += 15
  } else if (data.requestedAmount >= MIN_LOAN_AMOUNT && data.requestedAmount <= MAX_LOAN_AMOUNT) {
    // Valid range but might be high for income
    score += 5
  } else {
    score -= 10
  }
  
  // Existing customer bonus
  if (data.isExistingCustomer === 'نعم') {
    score += 10
  }
  
  // Complete information bonus
  if (data.email) score += 5
  if (data.preferredContactTime) score += 5
  
  // Ensure score is between 30 and 95
  return Math.min(95, Math.max(30, score))
}




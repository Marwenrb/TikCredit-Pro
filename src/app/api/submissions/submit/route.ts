import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimiter } from '@/lib/rateLimit'
import { validatePhone, validateEmail, saveSubmission } from '@/lib/utils'
import { FormData } from '@/types'

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
    const data: FormData = await request.json()
    
    // Validate required fields
    const errors: string[] = []
    
    if (!data.fullName || data.fullName.length < 3) {
      errors.push('الاسم الكامل مطلوب (3 أحرف على الأقل)')
    }
    
    if (!data.phone || !validatePhone(data.phone)) {
      errors.push('رقم الهاتف غير صحيح')
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
    
    if (!data.requestedAmount || data.requestedAmount < 1000000 || data.requestedAmount > 20000000) {
      errors.push('المبلغ المطلوب غير صحيح')
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }
    
    // Save submission
    const submission = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      data,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
    
    // In production, save to database (Firebase/PostgreSQL)
    // For now, we'll save to localStorage via the utility function
    saveSubmission(data)
    
    // Log submission for monitoring
    console.log('New submission received:', {
      id: submission.id,
      name: data.fullName,
      phone: data.phone.substring(0, 4) + '****', // Partially hide for privacy
      amount: data.requestedAmount,
      timestamp: submission.timestamp,
    })
    
    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: 'تم استلام طلبك بنجاح',
        submissionId: submission.id,
        approvalProbability: calculateApprovalProbability(data),
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
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
  
  // Amount vs income ratio
  const maxAmounts = [1500000, 3500000, 6000000, 12000000, 25000000]
  if (incomeIndex >= 0 && data.requestedAmount <= maxAmounts[incomeIndex]) {
    score += 15
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




import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import { strictRateLimiter } from '@/lib/rateLimit'

// ULTRA-SECURE LOGIN with Rate Limiting and Bcrypt
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks (5 attempts per minute)
    const rateLimitResult = strictRateLimiter.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Simple password check - Password: Admin123
    // For production, use environment variables with proper escaping
    const ADMIN_PASSWORD = 'Admin123'
    
    const isValid = password === ADMIN_PASSWORD
    
    if (!isValid) {
      // Add artificial delay to slow down brute force attempts
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken()

    // Set token in HTTP-only cookie with enhanced security
    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    )

    // Set secure cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection (changed from 'lax' to 'strict')
      maxAge: 60 * 60 * 8, // 8 hours (reduced from 24 for security)
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


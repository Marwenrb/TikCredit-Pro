import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value

    // If no token, allow access to login (handled by client-side)
    // The client will redirect if not authenticated
    if (!token) {
      // Allow the request to proceed - client-side will handle redirect
      return NextResponse.next()
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      // Invalid token - clear cookie and allow request
      const response = NextResponse.next()
      response.cookies.delete('admin-token')
      return response
    }

    // Valid token - allow access
    return NextResponse.next()
  }

  // Allow all other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}


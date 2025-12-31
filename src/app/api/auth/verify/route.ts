import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { authenticated: true, role: decoded.role },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}


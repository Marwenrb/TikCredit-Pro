import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  )

  // Remove cookie
  response.cookies.delete('admin-token')

  return response
}


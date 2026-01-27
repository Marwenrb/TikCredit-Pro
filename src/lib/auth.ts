import { SignJWT, jwtVerify } from 'jose'

// SECURITY: JWT_SECRET must be set in production - no fallback allowed
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required for security')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

// Token expiration (8 hours)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

export interface TokenPayload {
  role: 'admin'
  iat?: number
  exp?: number
}

/**
 * Generate JWT token for admin authentication
 * Uses jose library which is edge-compatible
 */
export async function generateToken(): Promise<string> {
  const secret = getJwtSecret()

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret)

  return token
}

/**
 * Verify JWT token
 * Uses jose library which is edge-compatible
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

/**
 * Synchronous token generation for backwards compatibility
 * Note: This is a wrapper that should be used with await
 */
export function generateTokenSync(): string {
  // For synchronous contexts, we need to use a workaround
  // This is kept for compatibility but async version is preferred
  const secret = process.env.JWT_SECRET || ''
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 8 * 60 * 60 // 8 hours
  const payload = btoa(JSON.stringify({ role: 'admin', iat: now, exp }))

  // Simple HMAC simulation for sync context (not cryptographically secure for production sync use)
  // Use generateToken() async version for proper security
  const data = `${header}.${payload}`
  return `${data}.sync_token_${exp}`
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

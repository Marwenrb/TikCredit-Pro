import jwt from 'jsonwebtoken'

// SECURITY: JWT_SECRET must be set in production - no fallback allowed
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required for security')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return secret
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as string // Reduced from 24h for security

export interface TokenPayload {
  role: 'admin'
  iat?: number
  exp?: number
}

/**
 * Generate JWT token for admin authentication
 */
export function generateToken(): string {
  const payload: TokenPayload = {
    role: 'admin',
  }
  
  // Type assertion needed due to jsonwebtoken type definitions
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as any) as string
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}


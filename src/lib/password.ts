import bcrypt from 'bcryptjs'

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a secure admin password hash
 * Run this once to generate a hash for your .env file:
 * node -e "require('./src/lib/password').generateHash('YourPassword')"
 */
export async function generateHash(password: string): Promise<void> {
  const hash = await hashPassword(password)
  console.log('Generated hash:')
  console.log(hash)
  console.log('\nAdd this to your .env.local as ADMIN_PASSWORD_HASH')
}

// For server-side usage in API routes
export function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) {
    throw new Error('ADMIN_PASSWORD_HASH environment variable is not set')
  }
  return hash
}



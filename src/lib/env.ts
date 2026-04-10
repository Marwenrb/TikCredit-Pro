/**
 * Environment variable validation.
 * Called at startup — throws loudly if required vars are missing or invalid.
 * Import this at the top of any API route that needs env vars.
 */

const required = [
  'JWT_SECRET',
  'ADMIN_PASSWORD',
] as const

const recommended = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

/** Throws if required env vars are absent or fail minimum length checks. */
export function validateEnv(): void {
  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Check your .env.local file.`
    )
  }

  // JWT_SECRET must be ≥ 32 characters
  const jwtSecret = process.env.JWT_SECRET!
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security.')
  }

  // Warn about recommended vars in development
  if (process.env.NODE_ENV === 'development') {
    for (const key of recommended) {
      if (!process.env[key]) {
        console.warn(`[env] Recommended variable ${key} is not set. Some features may not work.`)
      }
    }
  }
}

/**
 * Returns a required env var or throws if missing.
 * Use at call-site to get a type-safe non-null string.
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable ${key} is required but not set.`)
  return value
}

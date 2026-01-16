import admin from 'firebase-admin'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Firebase Admin SDK initialization for server-side operations
 * Production-ready with robust error handling and graceful fallback
 * 
 * Key format fixes:
 * - Handles escaped \n in environment variables
 * - Handles extra quotes from shell escaping
 * - Handles base64-encoded private keys
 * - Validates PEM format before initialization
 */

// Module-level state
let initializationAttempted = false
let initializationError: Error | null = null

/**
 * Robustly format the private key from environment variables
 * Handles various edge cases from different deployment environments
 */
function formatPrivateKey(key: string): string {
  if (!key) return ''
  
  let formatted = key
  
  // Step 1: Remove surrounding quotes (single, double, or backticks)
  formatted = formatted.replace(/^["'`]+|["'`]+$/g, '')
  
  // Step 2: Handle double-escaped newlines (\\n -> \n)
  formatted = formatted.replace(/\\\\n/g, '\n')
  
  // Step 3: Handle single-escaped newlines (\n -> actual newline)
  formatted = formatted.replace(/\\n/g, '\n')
  
  // Step 4: Handle JSON-stringified keys (extra escaping)
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    try {
      formatted = JSON.parse(formatted)
    } catch {
      // Not valid JSON, continue with current value
    }
  }
  
  // Step 5: Check if it's base64-encoded (no spaces or newlines and longer than typical)
  if (!formatted.includes('-----BEGIN') && formatted.length > 500) {
    try {
      const decoded = Buffer.from(formatted, 'base64').toString('utf-8')
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        formatted = decoded
      }
    } catch {
      // Not base64, continue with current value
    }
  }
  
  // Step 6: Ensure proper PEM format with newlines after header and before footer
  if (formatted.includes('-----BEGIN PRIVATE KEY-----') && !formatted.includes('\n')) {
    // Key is all on one line, need to format it
    formatted = formatted
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----')
  }
  
  // Step 7: Trim any trailing/leading whitespace
  formatted = formatted.trim()
  
  return formatted
}

/**
 * Validate PEM private key format
 */
function validatePrivateKey(key: string): { valid: boolean; error?: string } {
  if (!key) {
    return { valid: false, error: 'Private key is empty' }
  }
  
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    return { valid: false, error: 'Missing BEGIN PRIVATE KEY header' }
  }
  
  if (!key.includes('-----END PRIVATE KEY-----')) {
    return { valid: false, error: 'Missing END PRIVATE KEY footer' }
  }
  
  // Check for common corruption patterns
  if (key.includes('\\n') && !key.includes('\n')) {
    return { valid: false, error: 'Newlines still escaped - formatting failed' }
  }
  
  return { valid: true }
}

/**
 * Initialize Firebase Admin with robust error handling
 */
function initializeFirebaseAdmin(): boolean {
  // Prevent running in browser environment
  if (typeof window !== 'undefined') return false
  
  // Return existing state if already attempted
  if (admin.apps.length > 0) return true
  if (initializationAttempted && initializationError) return false
  
  initializationAttempted = true
  const isDev = process.env.NODE_ENV === 'development'

  // Strategy 1: Try service account JSON file first
  try {
    const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json')
    
    if (fs.existsSync(serviceAccountPath)) {
      const fileContent = fs.readFileSync(serviceAccountPath, 'utf-8')
      const serviceAccount = JSON.parse(fileContent)
      
      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('Invalid service account file - missing required fields')
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      
      // Configure Firestore settings
      const db = admin.firestore()
      db.settings({ ignoreUndefinedProperties: true })
      
      if (isDev) {
        console.log('✅ Firebase Admin initialized from service-account-key.json')
      }
      
      return true
    }
  } catch (fileError) {
    if (isDev) {
      console.warn('⚠️ Service account file not available or invalid:', 
        fileError instanceof Error ? fileError.message : 'Unknown error')
    }
    // Continue to try environment variables
  }

  // Strategy 2: Fallback to environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY

  // Check if required env vars are present
  if (!projectId || !clientEmail || !privateKeyRaw) {
    initializationError = new Error('Missing required Firebase environment variables')
    if (isDev) {
      console.warn('⚠️ Firebase Admin not initialized - missing environment variables')
      console.warn('   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
    }
    return false
  }

  // Format and validate the private key
  const formattedPrivateKey = formatPrivateKey(privateKeyRaw)
  const keyValidation = validatePrivateKey(formattedPrivateKey)
  
  if (!keyValidation.valid) {
    initializationError = new Error(`Invalid private key format: ${keyValidation.error}`)
    if (isDev) {
      console.error('❌ Firebase Private Key validation failed:', keyValidation.error)
      console.error('   Tip: Ensure FIREBASE_PRIVATE_KEY in .env.local has literal \\n for newlines')
      console.error('   Example: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----"')
    }
    return false
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    })
    
    // Configure Firestore settings
    const db = admin.firestore()
    db.settings({ ignoreUndefinedProperties: true })
    
    if (isDev) {
      console.log('✅ Firebase Admin initialized from environment variables')
    }
    
    return true
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error('Unknown initialization error')
    
    if (isDev) {
      console.error('❌ Firebase Admin initialization failed:', initializationError.message)
      
      // Provide helpful debugging info
      if (initializationError.message.includes('parse private key') || 
          initializationError.message.includes('ASN.1')) {
        console.error('   This error typically means the private key is corrupted or incorrectly formatted.')
        console.error('   Solutions:')
        console.error('   1. Regenerate the service account key from Firebase Console')
        console.error('   2. Ensure no characters are missing or altered when copying the key')
        console.error('   3. Verify the key is properly escaped in your .env.local file')
      }
    }
    
    return false
  }
}

// Initialize on module load
const isInitialized = initializeFirebaseAdmin()

// Export Firestore and Auth instances
export const adminDb = isInitialized && admin.apps.length > 0 ? admin.firestore() : null
export const adminAuth = isInitialized && admin.apps.length > 0 ? admin.auth() : null

// Helper functions
export async function verifyAdminToken(token: string) {
  if (!adminAuth) return null
  
  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}

export async function createCustomToken(uid: string) {
  if (!adminAuth) return null
  
  try {
    return await adminAuth.createCustomToken(uid, { admin: true })
  } catch {
    return null
  }
}

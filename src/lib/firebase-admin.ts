import admin from 'firebase-admin'

/**
 * Firebase Admin SDK initialization for server-side operations
 * Production-ready with silent initialization
 */
function initializeFirebaseAdmin(): boolean {
  if (typeof window !== 'undefined') return false
  if (admin.apps.length > 0) return true

  // Try service account JSON file first
  try {
    const serviceAccountPath = require('path').join(process.cwd(), 'service-account-key.json')
    const fs = require('fs')
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      
      // Configure Firestore
      const db = admin.firestore()
      db.settings({ ignoreUndefinedProperties: true })
      
      return true
    }
  } catch {
    // Silent fail - will try env vars next
  }

  // Fallback to environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    try {
      let formattedPrivateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
      
      if (!formattedPrivateKey.includes('BEGIN PRIVATE KEY')) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Firebase Private Key format invalid - missing BEGIN PRIVATE KEY')
        }
        return false
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      })
      
      const db = admin.firestore()
      db.settings({ ignoreUndefinedProperties: true })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Firebase Admin initialized successfully')
      }
      
      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Firebase Admin initialization error:', error)
      }
      return false
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Firebase Admin not initialized - missing environment variables')
  }
  
  return false
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

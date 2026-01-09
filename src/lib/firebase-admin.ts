import admin from 'firebase-admin'

/**
 * Initialize Firebase Admin SDK for server-side operations
 * Supports both environment variables and service account JSON file
 */
function initializeFirebaseAdmin(): boolean {
  // Only run on server-side
  if (typeof window !== 'undefined') return false
  
  // Skip if already initialized
  if (admin.apps.length > 0) return true

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  // Check if all required credentials are present
  if (projectId && clientEmail && privateKey) {
    try {
      // Handle escaped newlines in the private key
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      })
      console.log('✅ Firebase Admin: Initialized successfully with service account credentials')
      return true
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed with credentials:', error instanceof Error ? error.message : error)
      return false
    }
  } else {
    // Log which credentials are missing for debugging
    const missing = []
    if (!projectId) missing.push('FIREBASE_PROJECT_ID')
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL')
    if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY')
    
    console.warn(`⚠️ Firebase Admin: Missing environment variables: ${missing.join(', ')}`)
    console.warn('📝 Submissions will be saved locally. Set up environment variables for cloud storage.')
    return false
  }
}

// Initialize on module load
const isInitialized = initializeFirebaseAdmin()

// Export Firestore and Auth instances (null if not initialized)
export const adminDb = isInitialized && admin.apps.length > 0 ? admin.firestore() : null
export const adminAuth = isInitialized && admin.apps.length > 0 ? admin.auth() : null

// Helper functions for admin operations
export async function verifyAdminToken(token: string) {
  if (!adminAuth) return null
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function createCustomToken(uid: string) {
  if (!adminAuth) return null
  
  try {
    const customToken = await adminAuth.createCustomToken(uid, { admin: true })
    return customToken
  } catch (error) {
    console.error('Custom token creation error:', error)
    return null
  }
}





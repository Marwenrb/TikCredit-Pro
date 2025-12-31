import admin from 'firebase-admin'

// Initialize admin SDK only on server-side
if (typeof window === 'undefined' && !admin.apps.length) {
  try {
    // Try to use service account from environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else {
      // Fallback to default credentials (for local development)
      console.warn('Firebase Admin: Using default credentials. Configure environment variables for production.')
      admin.initializeApp()
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
}

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null

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





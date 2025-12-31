import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Configuration Firebase pour le projet tikcredit-prp
const firebaseConfig = {
  apiKey: "AIzaSyDHqdTamwxMWrYHXpUYsxTdZK4hTtrNVCQ",
  authDomain: "tikcredit-prp.firebaseapp.com",
  projectId: "tikcredit-prp",
  storageBucket: "tikcredit-prp.firebasestorage.app",
  messagingSenderId: "250203469696",
  appId: "1:250203469696:web:afe8640b0d2e4923e4f365",
  measurementId: "G-XQ9T5GBLRS"
}

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize services
export const db = getFirestore(app)
export const auth = getAuth(app)

// Enable offline persistence for better UX
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available in this browser')
    }
  })
}

// Initialize Analytics (only in browser and if supported)
let analytics: any = null
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}
export { analytics }

// Helper functions for Firestore operations
export async function saveSubmissionToFirebase(data: any) {
  try {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...data,
      createdAt: new Date().toISOString(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving to Firebase:', error)
    throw error
  }
}

export async function getSubmissionsFromFirebase() {
  try {
    const q = query(
      collection(db, 'submissions'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    const querySnapshot = await getDocs(q)
    const submissions: any[] = []
    querySnapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() })
    })
    return submissions
  } catch (error) {
    console.error('Error fetching from Firebase:', error)
    return []
  }
}

export async function deleteSubmissionFromFirebase(id: string) {
  try {
    await deleteDoc(doc(db, 'submissions', id))
    return true
  } catch (error) {
    console.error('Error deleting from Firebase:', error)
    return false
  }
}


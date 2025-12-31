// Firebase Service for TikCredit Pro
// Handles all Firestore operations for submissions

import { 
  db, 
  saveSubmissionToFirebase, 
  getSubmissionsFromFirebase, 
  deleteSubmissionFromFirebase 
} from './firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { FormData, Submission } from '@/types'

// Collection reference
const SUBMISSIONS_COLLECTION = 'submissions'

/**
 * Save a new submission to Firestore
 */
export async function saveSubmission(formData: FormData): Promise<string | null> {
  try {
    const submissionData = {
      data: {
        ...formData,
        // Clean the profession field
        profession: formData.profession === 'أخرى (حدد)' && formData.customProfession 
          ? formData.customProfession 
          : formData.profession,
      },
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      source: 'web-form'
    }

    const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionData)
    console.log('✅ Submission saved to Firebase:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error)
    // Fallback to localStorage if Firebase fails
    saveToLocalStorage(formData)
    return null
  }
}

/**
 * Get all submissions from Firestore
 */
export async function getSubmissions(limitCount: number = 100): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const submissions: Submission[] = []
    
    querySnapshot.forEach((doc) => {
      const docData = doc.data()
      submissions.push({
        id: doc.id,
        timestamp: docData.createdAt || new Date().toISOString(),
        data: docData.data || docData
      })
    })
    
    console.log(`✅ Fetched ${submissions.length} submissions from Firebase`)
    return submissions
  } catch (error) {
    console.error('❌ Error fetching from Firebase:', error)
    // Fallback to localStorage
    return getFromLocalStorage()
  }
}

/**
 * Get submissions by date range
 */
export async function getSubmissionsByDateRange(
  startDate: Date, 
  endDate: Date
): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const submissions: Submission[] = []
    
    querySnapshot.forEach((doc) => {
      const docData = doc.data()
      submissions.push({
        id: doc.id,
        timestamp: docData.createdAt,
        data: docData.data
      })
    })
    
    return submissions
  } catch (error) {
    console.error('Error fetching by date range:', error)
    return []
  }
}

/**
 * Update submission status
 */
export async function updateSubmissionStatus(
  submissionId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'contacted'
): Promise<boolean> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId)
    await updateDoc(docRef, { 
      status,
      updatedAt: serverTimestamp()
    })
    console.log(`✅ Status updated to ${status} for ${submissionId}`)
    return true
  } catch (error) {
    console.error('Error updating status:', error)
    return false
  }
}

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId))
    console.log(`✅ Deleted submission ${submissionId}`)
    return true
  } catch (error) {
    console.error('Error deleting submission:', error)
    return false
  }
}

/**
 * Get submission statistics
 */
export async function getSubmissionStats(): Promise<{
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  totalAmount: number
}> {
  try {
    const submissions = await getSubmissions(1000)
    
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now)
    monthStart.setMonth(monthStart.getMonth() - 1)

    let total = submissions.length
    let today = 0
    let thisWeek = 0
    let thisMonth = 0
    let totalAmount = 0

    submissions.forEach(sub => {
      const subDate = new Date(sub.timestamp)
      totalAmount += sub.data.requestedAmount || 0
      
      if (subDate >= todayStart) today++
      if (subDate >= weekStart) thisWeek++
      if (subDate >= monthStart) thisMonth++
    })

    return { total, today, thisWeek, thisMonth, totalAmount }
  } catch (error) {
    console.error('Error getting stats:', error)
    return { total: 0, today: 0, thisWeek: 0, thisMonth: 0, totalAmount: 0 }
  }
}

// LocalStorage fallback functions
const STORAGE_KEY = 'tikcredit_submissions'

function saveToLocalStorage(formData: FormData): void {
  if (typeof window === 'undefined') return
  
  const existing = getFromLocalStorage()
  const newSubmission: Submission = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    data: formData
  }
  
  existing.unshift(newSubmission)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  console.log('📦 Saved to localStorage (fallback)')
}

function getFromLocalStorage(): Submission[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Export for migration purposes
export async function migrateLocalToFirebase(): Promise<number> {
  const localSubmissions = getFromLocalStorage()
  let migrated = 0
  
  for (const sub of localSubmissions) {
    try {
      await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
        data: sub.data,
        timestamp: serverTimestamp(),
        createdAt: sub.timestamp,
        status: 'migrated',
        source: 'local-migration'
      })
      migrated++
    } catch (error) {
      console.error('Migration error for:', sub.id)
    }
  }
  
  // Clear localStorage after migration
  if (migrated > 0) {
    localStorage.removeItem(STORAGE_KEY)
    console.log(`✅ Migrated ${migrated} submissions to Firebase`)
  }
  
  return migrated
}




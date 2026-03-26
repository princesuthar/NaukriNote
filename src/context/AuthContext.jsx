// Authentication context for contractor and worker auth state, profile loading, and session actions.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getDocs, query, collection, where } from 'firebase/firestore'
import { auth } from '../firebase/firebaseConfig'
import { db } from '../firebase/firebaseConfig'
import { createContractor, getContractor, getWorkerByPhone } from '../services/firestoreService'

const AuthContext = createContext(null)

// Converts Firebase auth error codes into user-friendly messages.
function mapAuthError(error) {
  const code = error?.code || ''

  if (code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please login instead.'
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.'
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }

  if (code === 'auth/user-not-found') {
    return 'No account found with this email.'
  }

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect email or password.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.'
  }

  return error?.message || 'Authentication failed. Please try again.'
}

function AuthProvider({ children }) {
  const [contractorUser, setContractorUser] = useState(null)
  const [contractorProfile, setContractorProfile] = useState(null)
  const [workerUser, setWorkerUser] = useState(null)
  const [workerProfile, setWorkerProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Registers a contractor account in Firebase Auth and creates contractor profile in Firestore.
  const signupContractor = async (name, email, phone, companyName, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const user = credential.user

      await createContractor(user.uid, {
        name,
        email,
        phone,
        companyName,
      })

      const profile = await getContractor(user.uid)
      setContractorUser(user)
      setContractorProfile(profile)

      return user
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Logs in a contractor account and loads the corresponding Firestore profile.
  const loginContractor = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const user = credential.user
      const profile = await getContractor(user.uid)

      setContractorUser(user)
      setContractorProfile(profile)

      return user
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Logs in a worker account using phone number and password and loads the worker profile from Firestore.
  const loginWorker = async (phone, password) => {
    try {
      const email = `91${phone}@worksite.com`
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const user = credential.user

      const workerDoc = await getWorkerByPhone(phone)
      if (!workerDoc) {
        throw new Error('Worker profile not found. Please contact your contractor.')
      }

      setWorkerUser(user)
      setWorkerProfile(workerDoc)

      return workerDoc
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Sends a password reset email to the contractor email address.
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Signs out the current worker and clears worker session state.
  const logoutWorker = async () => {
    try {
      await signOut(auth)
      setWorkerUser(null)
      setWorkerProfile(null)
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Signs out the current user and clears contractor and worker session state.
  const logout = async () => {
    try {
      await signOut(auth)
      setContractorUser(null)
      setContractorProfile(null)
      setWorkerUser(null)
      setWorkerProfile(null)
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Keeps auth state in sync with Firebase and loads appropriate profile (contractor or worker) on app start.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Check if this is a worker or contractor by email domain
          if (user.email && user.email.endsWith('@worksite.com')) {
            // Extract phone number from email: 91{phone}@worksite.com
            const phone = user.email.replace('@worksite.com', '').replace('91', '')
            const workerDoc = await getWorkerByPhone(phone)
            if (workerDoc) {
              setWorkerUser(user)
              setWorkerProfile(workerDoc)
              setContractorUser(null)
              setContractorProfile(null)
            }
          } else {
            // Load contractor profile
            const profile = await getContractor(user.uid)
            setContractorUser(user)
            setContractorProfile(profile)
            setWorkerUser(null)
            setWorkerProfile(null)
          }
        } else {
          setContractorUser(null)
          setContractorProfile(null)
          setWorkerUser(null)
          setWorkerProfile(null)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        setContractorUser(null)
        setContractorProfile(null)
        setWorkerUser(null)
        setWorkerProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      contractorUser,
      contractorProfile,
      workerUser,
      workerProfile,
      loading,
      signupContractor,
      loginContractor,
      loginWorker,
      resetPassword,
      logout,
      logoutWorker,
    }),
    [contractorProfile, contractorUser, loading, workerUser, workerProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Provides easy access to auth state and auth actions.
function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }

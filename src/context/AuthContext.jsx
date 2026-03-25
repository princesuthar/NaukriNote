// Authentication context for contractor auth state, profile loading, and session actions.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { createContractor, getContractor } from '../services/firestoreService'

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

  // Sends a password reset email to the contractor email address.
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
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
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  // Keeps auth state in sync with Firebase and loads contractor profile on app start.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await getContractor(user.uid)
          setContractorUser(user)
          setContractorProfile(profile)
        } else {
          setContractorUser(null)
          setContractorProfile(null)
          setWorkerUser(null)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        setContractorUser(null)
        setContractorProfile(null)
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
      loading,
      signupContractor,
      loginContractor,
      resetPassword,
      logout,
    }),
    [contractorProfile, contractorUser, loading, workerUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Provides easy access to auth state and auth actions.
function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }

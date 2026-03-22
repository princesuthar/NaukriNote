// Authentication context to manage contractor and worker session state.
import { createContext, useContext, useMemo, useState } from 'react'

// Shared auth context used across the app.
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  // Contractor user state for dashboard-side authentication.
  const [contractorUser] = useState(null)
  // Worker user state for worker app authentication.
  const [workerUser] = useState(null)

  // TODO: implement in later phase.
  const loginContractor = () => {}

  // TODO: implement in later phase.
  const loginWorker = () => {}

  // TODO: implement in later phase.
  const logout = () => {
    // Intentionally empty placeholder for Phase 1.
  }

  const value = useMemo(
    () => ({
      contractorUser,
      workerUser,
      loginContractor,
      loginWorker,
      logout,
    }),
    [contractorUser, workerUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook for consuming authentication state and actions.
function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }

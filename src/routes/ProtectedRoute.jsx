// Route guards for contractor and worker pages with auth loading fallback.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protects contractor routes and redirects unauthenticated users to contractor login.
function ContractorRoute({ children }) {
  const { contractorUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!contractorUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Protects worker routes and redirects unauthenticated worker users to worker login.
function WorkerRoute({ children }) {
  const { workerUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!workerUser) {
    return <Navigate to="/worker/login" replace />
  }

  return children
}

export { ContractorRoute, WorkerRoute }

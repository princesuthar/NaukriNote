// Shared contractor dashboard layout with responsive sidebar and sticky header.
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../firebase/firebaseConfig'

function DashboardLayout({ title, children }) {
  const { contractorUser, contractorProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Real-time listener for pending attendance requests count
  useEffect(() => {
    if (!contractorUser?.uid) return

    const q = query(
      collection(db, 'attendance_requests'),
      where('contractorId', '==', contractorUser.uid),
      where('status', '==', 'pending'),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size)
    })

    return () => unsubscribe()
  }, [contractorUser?.uid])

  const navItems = useMemo(
    () => [
      { label: 'Sites', path: '/dashboard', icon: '🏗️' },
      { label: 'Workers', path: '/workers', icon: '👷' },
      { label: 'Payroll', path: '/payroll', icon: '💰' },
      { label: 'Attendance', path: '/attendance', icon: '✅' },
    ],
    [],
  )

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getNavClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-3 rounded-lg bg-orange-500 px-4 py-3 text-white'
      : 'flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white'

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        role="presentation"
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform border-r border-gray-800 bg-gray-900 p-5 transition-transform md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
              <h1 className="text-xl font-bold text-white">WorkSite Manager</h1>
            </div>
            <p className="mt-2 text-sm text-gray-400">{contractorProfile?.companyName || 'Contractor Company'}</p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={getNavClass}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Attendance' && pendingCount > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-gray-800 pt-4">
            <p className="text-sm text-white">{contractorProfile?.name || 'Contractor'}</p>
            <p className="mt-1 text-xs text-gray-400">{contractorUser?.email || 'No email found'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 text-sm text-red-400 transition hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-700 p-2 text-gray-300 md:hidden"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <p className="text-sm text-gray-400">{formattedDate}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout

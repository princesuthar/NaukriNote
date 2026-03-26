// Premium contractor dashboard layout with glassmorphism sidebar and header.
import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../common/Logo'

function DashboardLayout({ title, children }) {
  const { contractorUser, contractorProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      ? 'flex items-center gap-3 rounded-xl bg-gradient-brand px-4 py-3 text-white shadow-glow font-semibold transition-all duration-300'
      : 'flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white'

  return (
    <div className="flex h-screen bg-surface-400 text-white">
      <div
        className={`fixed inset-0 z-30 transition-all duration-300 md:hidden ${
          isSidebarOpen ? 'bg-black/50 backdrop-blur-sm' : 'pointer-events-none bg-transparent'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        role="presentation"
      />
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform glass-heavy rounded-none p-5 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <h1 className="text-xl font-bold text-white">NaukriNote</h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">{contractorProfile?.companyName || 'Contractor Portal'}</p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={getNavClass} onClick={() => setIsSidebarOpen(false)}>
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                {(contractorProfile?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{contractorProfile?.name || 'Contractor'}</p>
                <p className="truncate text-xs text-gray-500">{contractorUser?.email || 'No email'}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="mt-3 text-sm text-red-400 transition-colors duration-200 hover:text-red-300">
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 glass-heavy rounded-none border-b border-white/5 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-white/10 p-2 text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-white md:hidden" onClick={() => setIsSidebarOpen((prev) => !prev)} aria-label="Toggle sidebar">
                ☰
              </button>
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-surface-400 p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout

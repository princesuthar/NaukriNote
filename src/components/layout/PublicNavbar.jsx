// Responsive public navbar for landing and about pages with auth entry links.
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Login', path: '/login' },
  ]

  const getLinkClass = (path) => {
    const isActive = location.pathname === path
    return isActive
      ? 'text-gray-900 font-semibold underline underline-offset-4'
      : 'text-gray-600 hover:text-gray-900'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white shadow-sm">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-lg font-bold text-gray-900"
          aria-label="Go to home page"
        >
          WorkSite Manager
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
              {item.label}
            </Link>
          ))}
          <Link
            to="/signup"
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-sm font-semibold">{isMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClass(item.path)}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/signup"
              className="w-fit rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default PublicNavbar

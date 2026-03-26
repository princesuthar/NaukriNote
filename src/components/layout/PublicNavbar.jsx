// Responsive public navbar with scroll-reactive styling for public pages.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const links = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Login', path: '/login' },
  ]

  const getLinkClass = (path) => {
    const isActive = location.pathname === path
    return isActive
      ? 'font-semibold text-orange-400'
      : 'text-white transition hover:text-orange-300'
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2" aria-label="Go to home page">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="text-lg font-bold text-white">WorkSite Manager</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
              {item.label}
            </Link>
          ))}
          <Link
            to="/signup"
            className="rounded-lg bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClass(item.path)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/signup"
              className="w-fit rounded-lg bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default PublicNavbar

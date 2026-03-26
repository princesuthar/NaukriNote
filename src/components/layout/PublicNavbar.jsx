// Responsive public navbar with glassmorphism scroll effect and gradient CTA.
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
      ? 'font-semibold text-brand-400'
      : 'text-gray-300 transition-colors duration-200 hover:text-white'
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-white/5 bg-surface-400/80 shadow-glass backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Go to home page">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-brand shadow-glow" aria-hidden="true" />
          <span className="text-lg font-bold text-white">NokriNote</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
              {item.label}
            </Link>
          ))}
          <Link to="/signup" className="btn-primary px-5 py-2 text-sm">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white md:hidden"
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
        <div className="animate-slide-down border-t border-white/5 bg-surface-400/95 px-4 py-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((item) => (
              <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
                {item.label}
              </Link>
            ))}
            <Link to="/signup" className="btn-primary w-fit px-5 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default PublicNavbar

// Premium footer with gradient accent and modern layout.
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="relative bg-surface-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-brand shadow-glow" aria-hidden="true" />
            <h3 className="text-xl font-bold text-white">NokriNote</h3>
          </div>
          <p className="mt-3 text-sm text-gray-400">Built for the construction industry.</p>
          <p className="mt-4 text-xs text-gray-500">© 2025 NokriNote. All rights reserved.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Product</h4>
          <ul className="mt-4 space-y-3 text-sm text-gray-400">
            <li><Link to="/" className="transition-colors duration-200 hover:text-brand-400">Home</Link></li>
            <li><Link to="/about" className="transition-colors duration-200 hover:text-brand-400">About</Link></li>
            <li><Link to="/login" className="transition-colors duration-200 hover:text-brand-400">Login</Link></li>
            <li><Link to="/signup" className="transition-colors duration-200 hover:text-brand-400">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-4 text-sm text-gray-400">For support or enquiries:</p>
          <p className="mt-1 text-sm text-brand-400">support@nokrinote.com</p>
        </div>
      </div>
      <div className="border-t border-white/5 py-5">
        <p className="text-center text-xs text-gray-500">
          Made with <span aria-label="love" role="img">❤️</span> for Indian construction contractors
        </p>
      </div>
    </footer>
  )
}

export default Footer
// Reusable public footer shared by landing and about pages.
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-xl font-bold text-white">WorkSite Manager</h3>
          <p className="mt-2 text-sm text-gray-400">Built for the construction industry.</p>
          <p className="mt-4 text-xs text-gray-500">© 2025 WorkSite Manager. All rights reserved.</p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-white">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="transition hover:text-white">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-3 text-sm text-gray-400">For support or enquiries:</p>
          <p className="mt-1 text-sm text-gray-400">support@worksitemanager.com</p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4">
        <p className="text-center text-xs text-gray-500">
          Made with <span aria-label="love" role="img">❤️</span> for Indian construction contractors
        </p>
      </div>
    </footer>
  )
}

export default Footer
// Mobile-first login page for workers where they log in with phone number and password.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function WorkerLoginPage() {
  const navigate = useNavigate()
  const { loginWorker } = useAuth()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate phone is 10 digits
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    try {
      await loginWorker(phone, password)
      navigate('/worker/home', { replace: true })
    } catch (err) {
      const errMessage = err.message || 'Login failed'
      if (errMessage.includes('too-many-requests')) {
        setError('Too many login attempts. Please try again later.')
      } else {
        setError(errMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen w-full flex flex-col justify-center px-4">
      <div className="max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">👷</div>
          <h1 className="text-2xl font-bold text-white">WorkSite Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Worker Login</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mt-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-gray-300 text-sm mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="number"
                placeholder="Enter your 10-digit number"
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg text-base placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-300 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg text-base placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold text-base transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Are you a contractor?{' '}
            <Link to="/login" className="text-gray-400 hover:text-gray-300 underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkerLoginPage

// Contractor login page with inline reset password support.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { loginContractor, resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showResetSection, setShowResetSection] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')

  const validate = () => {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      await loginContractor(email.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      setFormError(error.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetMessage('')
    setResetError('')

    if (!email.trim()) {
      setResetError('Please enter your email to reset password.')
      return
    }

    setResetLoading(true)
    try {
      await resetPassword(email.trim())
      setResetMessage('Reset email sent! Check your inbox.')
    } catch (error) {
      setResetError(error.message || 'Failed to send reset email.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">WorkSite Manager</h1>
        <p className="mb-6 text-center text-sm text-gray-600">Login to your contractor account</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-blue-500 focus:ring-2"
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <div className="flex gap-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-blue-500 focus:ring-2"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded border border-gray-300 px-3 text-sm text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Logging In...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          onClick={() => setShowResetSection((prev) => !prev)}
        >
          Forgot password?
        </button>

        {showResetSection && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-800">Reset Password</p>
            <p className="mb-3 text-xs text-gray-600">Use your account email and we will send reset link.</p>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {resetLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                'Send Reset Email'
              )}
            </button>
            {resetMessage && <p className="mt-2 text-sm text-green-600">{resetMessage}</p>}
            {resetError && <p className="mt-2 text-sm text-red-600">{resetError}</p>}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage

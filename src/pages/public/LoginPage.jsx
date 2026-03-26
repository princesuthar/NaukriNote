// Premium dark-themed contractor login with glassmorphism and gradient accents.
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
    if (!validate()) return
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
    if (!email.trim()) { setResetError('Please enter your email to reset password.'); return }
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
    <div className="relative flex min-h-screen items-center justify-center bg-surface-400 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-amber-500/6 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow"><span className="text-xl">🏗️</span></div>
            <h1 className="text-2xl font-bold text-white">NokriNote</h1>
            <p className="mt-1 text-sm text-gray-400">Login to your contractor account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" />
              {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="password">Password</label>
              <div className="flex gap-2">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/10 hover:text-white">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
            </div>
            {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center py-3">
              {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Logging In...</span> : 'Login'}
            </button>
          </form>
          <button type="button" className="mt-5 text-sm font-medium text-brand-400 transition-colors duration-200 hover:text-brand-300" onClick={() => setShowResetSection((prev) => !prev)}>Forgot password?</button>
          {showResetSection && (
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 animate-slide-down">
              <p className="mb-2 text-sm font-medium text-gray-300">Reset Password</p>
              <p className="mb-3 text-xs text-gray-500">Use your account email and we will send a reset link.</p>
              <button type="button" onClick={handleResetPassword} disabled={resetLoading} className="btn-primary flex items-center justify-center px-4 py-2 text-sm">
                {resetLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Sending...</span> : 'Send Reset Email'}
              </button>
              {resetMessage && <p className="mt-2 text-sm text-emerald-400">{resetMessage}</p>}
              {resetError && <p className="mt-2 text-sm text-red-400">{resetError}</p>}
            </div>
          )}
          <p className="mt-6 text-center text-sm text-gray-500">Don&apos;t have an account?{' '}<Link to="/signup" className="font-medium text-brand-400 transition-colors duration-200 hover:text-brand-300">Sign Up</Link></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

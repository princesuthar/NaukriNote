// Premium worker login page with glassmorphism and animated background.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/common/Logo'

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
    if (!phone || !/^\d{10}$/.test(phone)) { setError('Please enter a valid 10-digit phone number'); return }
    if (!password) { setError('Please enter your password'); return }
    setLoading(true)
    try { await loginWorker(phone, password); navigate('/worker/home', { replace: true }) }
    catch (err) { setError(err.message?.includes('too-many-requests') ? 'Too many attempts. Try later.' : (err.message || 'Login failed')) }
    finally { setLoading(false) }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center bg-surface-400 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-[350px] w-[350px] rounded-full bg-brand-500/8 blur-[100px] animate-float" />
        <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-amber-500/6 blur-[80px] animate-float-delayed" />
      </div>
      <div className="relative mx-auto w-full max-w-sm animate-scale-in">
        <div className="text-center">
          <Logo size={64} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">NaukriNote</h1>
          <p className="mt-1 text-sm text-gray-500">Worker Login</p>
        </div>
        <div className="glass-card mt-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm text-gray-300">Phone Number</label>
              <input id="phone" type="number" placeholder="Enter your 10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 10))} disabled={loading} className="input-field" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-gray-300">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="input-field pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200 disabled:opacity-50">{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3">
              {loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Logging in...</> : 'Login'}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Are you a contractor?{' '}<Link to="/login" className="text-brand-400 underline hover:text-brand-300">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default WorkerLoginPage

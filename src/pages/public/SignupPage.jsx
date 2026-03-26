// Premium dark-themed contractor signup with glassmorphism and gradient accents.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function SignupPage() {
  const navigate = useNavigate()
  const { signupContractor } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!fullName.trim()) nextErrors.fullName = 'Full Name is required.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (email.trim() && !emailPattern.test(email.trim())) nextErrors.email = 'Please enter a valid email address.'
    if (!phone.trim()) nextErrors.phone = 'Phone Number is required.'
    if (!companyName.trim()) nextErrors.companyName = 'Company Name is required.'
    if (!password) nextErrors.password = 'Password is required.'
    if (password && password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm Password is required.'
    if (password && confirmPassword && password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)
    try {
      await signupContractor(fullName.trim(), email.trim(), phone.trim(), companyName.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      setFormError(error.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (id, label, type, value, onChange, placeholder) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} className="input-field" placeholder={placeholder} />
      {errors[id] && <p className="mt-1.5 text-sm text-red-400">{errors[id]}</p>}
    </div>
  )

  const renderPasswordField = (id, label, value, onChange, placeholder, show, toggleShow) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor={id}>{label}</label>
      <div className="flex gap-2">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} className="input-field" placeholder={placeholder} />
        <button type="button" onClick={toggleShow} className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-gray-400 transition-colors duration-200 hover:bg-white/10 hover:text-white">{show ? 'Hide' : 'Show'}</button>
      </div>
      {errors[id] && <p className="mt-1.5 text-sm text-red-400">{errors[id]}</p>}
    </div>
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-400 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[300px] w-[300px] rounded-full bg-amber-500/6 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow"><span className="text-xl">🏗️</span></div>
            <h1 className="text-2xl font-bold text-white">NokriNote</h1>
            <p className="mt-1 text-sm text-gray-400">Create your contractor account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {renderField('fullName', 'Full Name', 'text', fullName, (e) => setFullName(e.target.value), 'Enter your full name')}
            {renderField('email', 'Email', 'email', email, (e) => setEmail(e.target.value), 'Enter your email')}
            {renderField('phone', 'Phone Number', 'tel', phone, (e) => setPhone(e.target.value), 'Enter your phone number')}
            {renderField('companyName', 'Company Name', 'text', companyName, (e) => setCompanyName(e.target.value), 'Enter your company name')}
            {renderPasswordField('password', 'Password', password, (e) => setPassword(e.target.value), 'Create a password', showPassword, () => setShowPassword((prev) => !prev))}
            {renderPasswordField('confirmPassword', 'Confirm Password', confirmPassword, (e) => setConfirmPassword(e.target.value), 'Confirm your password', showConfirmPassword, () => setShowConfirmPassword((prev) => !prev))}
            {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center py-3">
              {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Creating Account...</span> : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">Already have an account?{' '}<Link to="/login" className="font-medium text-brand-400 transition-colors duration-200 hover:text-brand-300">Login</Link></p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage

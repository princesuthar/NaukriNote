// Toast notification with glassmorphism, colored accent, and slide animation.
import { useEffect } from 'react'
import { useState } from 'react'

function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      return undefined
    }

    const rafId = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => {
      window.cancelAnimationFrame(rafId)
      setIsVisible(false)
    }
  }, [message])

  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) {
    return null
  }

  const accentColor =
    type === 'success'
      ? 'border-l-emerald-400'
      : type === 'error'
        ? 'border-l-red-400'
        : 'border-l-brand-400'

  const icon =
    type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  const iconColor =
    type === 'success'
      ? 'text-emerald-400'
      : type === 'error'
        ? 'text-red-400'
        : 'text-brand-400'

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60]">
      <div
        className={`pointer-events-auto min-w-[280px] rounded-xl border border-white/10 border-l-[3px] ${accentColor} bg-white/[0.06] px-4 py-3.5 text-sm text-white shadow-glass backdrop-blur-xl transition-all duration-400 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${iconColor}`}>{icon}</span>
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-white"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast

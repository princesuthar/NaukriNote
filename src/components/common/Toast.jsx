// Toast notification component with timed auto-dismiss and slide animation.
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

  const colorClass =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
        ? 'bg-red-600'
        : 'bg-gray-700'

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60]">
      <div
        className={`pointer-events-auto min-w-[240px] rounded-lg px-4 py-3 text-sm text-white shadow-lg transition-all duration-300 ${colorClass} ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <span>{message}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 transition hover:text-white"
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

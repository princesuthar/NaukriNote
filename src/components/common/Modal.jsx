// Reusable modal wrapper with glassmorphism, keyboard and backdrop close behavior.
import { useEffect } from 'react'
import { useState } from 'react'

function Modal({ isOpen, onClose, title, children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setVisible(false)
      return undefined
    }

    const rafId = window.requestAnimationFrame(() => {
      setVisible(true)
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`glass-card relative w-full max-w-lg overflow-hidden p-6 text-white transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-brand" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  )
}

export default Modal

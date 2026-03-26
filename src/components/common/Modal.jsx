// Reusable modal wrapper with keyboard and backdrop close behavior.
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-800 p-6 text-white shadow-2xl transition-all duration-200 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-300 transition hover:bg-gray-700 hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal

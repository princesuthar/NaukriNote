// Lightweight toast state hook for success, error, and info notifications.
import { useCallback, useState } from 'react'

function useToast() {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    visible: false,
  })

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false, message: '' }))
  }, [])

  return { toast, showToast, hideToast }
}

export default useToast

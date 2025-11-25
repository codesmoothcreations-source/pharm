import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from './Toast'
import styles from './Toast.module.css'

// Global toast context
const ToastContext = createContext()

// Provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Convenience methods
  const showSuccess = useCallback((message, duration = 5000) => addToast(message, 'success', duration), [addToast])
  const showError = useCallback((message, duration = 7000) => addToast(message, 'error', duration), [addToast])
  const showInfo = useCallback((message, duration = 5000) => addToast(message, 'info', duration), [addToast])
  const showWarning = useCallback((message, duration = 6000) => addToast(message, 'warning', duration), [addToast])

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Global toast container */}
      <div className={styles.globalToastContainer}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Custom hook to use global toast
export const useGlobalToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider')
  }
  return context
}

// Export the original useToast hook for backward compatibility
export const useToast = () => {
  const globalToast = useGlobalToast()
  return {
    addToast: globalToast.addToast,
    showSuccess: globalToast.showSuccess,
    showError: globalToast.showError,
    showInfo: globalToast.showInfo,
    showWarning: globalToast.showWarning,
    ToastContainer: () => null // No-op for backward compatibility
  }
}
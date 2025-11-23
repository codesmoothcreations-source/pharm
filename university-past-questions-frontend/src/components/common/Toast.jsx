import React, { useState, useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import styles from './Toast.module.css'

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Show toast after component mounts
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, 300) // Animation duration
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className={`${styles.toastIcon} ${styles.toastIconSuccess}`} />
      case 'error':
        return <FaExclamationCircle className={`${styles.toastIcon} ${styles.toastIconError}`} />
      case 'info':
        return <FaInfoCircle className={`${styles.toastIcon} ${styles.toastIconInfo}`} />
      default:
        return <FaInfoCircle className={`${styles.toastIcon} ${styles.toastIconInfo}`} />
    }
  }

  return (
    <div 
      className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]} ${isVisible ? styles.toastVisible : ''} ${isExiting ? styles.toastExiting : ''}`}
    >
      <div className={styles.toastContent}>
        {getIcon()}
        <span className={styles.toastMessage}>{message}</span>
        <button className={styles.toastClose} onClick={handleClose}>
          <FaTimes />
        </button>
      </div>
      <div className={styles.toastProgress}>
        <div 
          className={styles.toastProgressBar} 
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  )
}

export default Toast

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now()
    const newToast = { id, message, type, duration }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className={styles.toastContainer}>
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
  )

  return { addToast, ToastContainer }
}
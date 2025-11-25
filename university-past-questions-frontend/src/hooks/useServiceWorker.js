import { useEffect, useState } from 'react'

// Service Worker registration hook
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          setRegistration(registration)
          console.log('ServiceWorker registration successful:', registration)
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available')
                }
              })
            }
          })
          
        } catch (error) {
          console.error('ServiceWorker registration failed:', error)
          setError(error)
        }
      }

      registerServiceWorker()
    } else {
      setIsSupported(false)
    }
  }, [])

  return { registration, isSupported, error }
}

// Hook for managing app update notifications
export const useAppUpdate = (registration) => {
  const [showUpdateMessage, setShowUpdateMessage] = useState(false)

  useEffect(() => {
    if (!registration) return

    const handleControllerChange = () => {
      // App has been updated
      setShowUpdateMessage(true)
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [registration])

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const dismissUpdate = () => {
    setShowUpdateMessage(false)
  }

  return { showUpdateMessage, updateApp, dismissUpdate }
}

export default useServiceWorker
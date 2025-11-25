// main.jsx - Application entry point
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import LoadingSpinner from './components/common/LoadingSpinner'
import { useServiceWorker } from './hooks/useServiceWorker'
import './index.css'

// Service Worker registration component
const ServiceWorkerRegistrar = () => {
  const { isSupported } = useServiceWorker()
  
  if (!isSupported) {
    console.log('Service Worker not supported')
    return null
  }
  
  return null
}

// Loading component
const AppLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3', 
        borderTop: '4px solid #007bff', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: '#666', fontSize: '16px' }}>Loading Pharmssag...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
)

const Root = () => {
  return (
    <React.StrictMode>
      <ServiceWorkerRegistrar />
      <Suspense fallback={<AppLoader />}>
        <App />
      </Suspense>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
)
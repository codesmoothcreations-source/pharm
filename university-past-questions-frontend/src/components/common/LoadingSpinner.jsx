import React from 'react'
import styles from './LoadingSpinner.module.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  text = "Loading...", 
  className = "",
  type = "spinner", // 'spinner', 'dots', 'skeleton'
  overlay = false,
  fullScreen = false
}) => {
  const sizeClass = `${type}-${size}`
  
  // Different loading types for various API scenarios
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`${styles.loadingDots} ${sizeClass}`}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        )
      case 'skeleton':
        return (
          <div className={`${styles.skeletonLoader} ${sizeClass}`}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={`${styles.skeletonLine} ${styles.short}`}></div>
          </div>
        )
      default:
        return <div className={`${styles.spinner} ${sizeClass}`}></div>
    }
  }

  const containerClass = `
    ${styles.loadingContainer}
    ${className}
    ${overlay ? styles.loadingOverlay : ''}
    ${fullScreen ? styles.loadingFullscreen : ''}
  `.trim()

  return (
    <div className={containerClass}>
      {renderLoader()}
      {text && <p className={`${styles.loadingText} ${size === 'small' ? styles.loadingTextSmall : ''}`}>{text}</p>}
    </div>
  )
}

// Additional specialized loading components that use the main LoadingSpinner
export const ApiLoadingStates = {
  // For initial page loads
  PageLoading: () => (
    <LoadingSpinner 
      size="large" 
      text="Loading content..." 
      fullScreen 
    />
  ),
  
  // For API data fetching
  DataLoading: () => (
    <LoadingSpinner 
      text="Fetching data..." 
      type="dots"
    />
  ),
  
  // For form submissions
  FormSubmitting: () => (
    <LoadingSpinner 
      size="small" 
      text="Submitting..." 
      type="dots"
    />
  ),
  
  // For file uploads
  FileUploading: () => (
    <LoadingSpinner 
      text="Uploading file..." 
      type="dots"
    />
  ),
  
  // For search operations
  Searching: () => (
    <LoadingSpinner 
      size="small" 
      text="Searching..." 
    />
  ),
  
  // For skeleton loading (content placeholders)
  ContentSkeleton: () => (
    <LoadingSpinner 
      type="skeleton" 
      text=""
    />
  )
}

export default LoadingSpinner
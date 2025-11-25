import React, { useEffect } from 'react'

// Performance monitoring utilities
const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) return

  const navigation = performance.getEntriesByType('navigation')[0]
  if (!navigation) return

  const metrics = {
    // Core Web Vitals
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    timeToInteractive: navigation.domInteractive - navigation.navigationStart,
    firstPaint: 0,
    firstContentfulPaint: 0,
    // Network metrics
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    tls: navigation.connectEnd - navigation.secureConnectionStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    processing: navigation.domComplete - navigation.responseEnd
  }

  // Get paint metrics
  const paintEntries = performance.getEntriesByType('paint')
  const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
  const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
  
  if (firstPaint) metrics.firstPaint = firstPaint.startTime
  if (firstContentfulPaint) metrics.firstContentfulPaint = firstContentfulPaint.startTime

  return metrics
}

const measureRouteChange = (fromPath, toPath) => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    console.log(`[Performance] Route change: ${fromPath} → ${toPath} took ${duration.toFixed(2)}ms`)
    
    // Log slow route changes
    if (duration > 100) {
      console.warn(`[Performance Warning] Slow route change detected: ${duration.toFixed(2)}ms`)
    }
  }
}

// Hook for measuring route changes
export const useRoutePerformance = (currentPath) => {
  useEffect(() => {
    if (currentPath) {
      const endMeasure = measureRouteChange(window.location.pathname, currentPath)
      
      // Measure the time for the route change completion
      const timeout = setTimeout(endMeasure, 0)
      
      return () => clearTimeout(timeout)
    }
  }, [currentPath])
}

// Hook for measuring API call performance
export const useApiPerformance = (apiName) => {
  return (startTime, endTime, error = null) => {
    const duration = endTime - startTime
    const status = error ? 'error' : 'success'
    
    console.log(`[API Performance] ${apiName}: ${status} - ${duration.toFixed(2)}ms`)
    
    // Log slow API calls
    if (duration > 500) {
      console.warn(`[Performance Warning] Slow API call: ${apiName} took ${duration.toFixed(2)}ms`)
    }
    
    // You could send this data to an analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_timing', {
        event_category: 'Performance',
        event_label: apiName,
        value: Math.round(duration)
      })
    }
  }
}

// Performance monitoring component
const PerformanceMonitor = ({ children }) => {
  useEffect(() => {
    // Measure initial page load
    const metrics = measurePageLoad()
    if (metrics) {
      console.log('[Performance] Page Load Metrics:', metrics)
      
      // Log slow initial loads
      if (metrics.loadTime > 3000) {
        console.warn('[Performance Warning] Slow initial page load:', metrics.loadTime)
      }
    }
    
    // Monitor for memory leaks in development
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log(`[Performance] Measure: ${entry.name} took ${entry.duration}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure'] })
      
      return () => observer.disconnect()
    }
  }, [])

  return children
}

export default PerformanceMonitor
export { measurePageLoad, measureRouteChange }
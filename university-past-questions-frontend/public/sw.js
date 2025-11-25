// Service Worker for caching and offline support
const CACHE_NAME = 'pharmssag-v1.0.1'
const urlsToCache = [
  '/',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        // Only cache same-origin resources to avoid CSP issues
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.log(`Failed to cache ${url}:`, error)
              return null
            })
          )
        )
      })
      .catch((error) => {
        console.log('Cache installation failed:', error)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip external resources (fonts, analytics, etc.)
  const url = new URL(event.request.url)
  if (url.origin !== location.origin) {
    // For external requests, just fetch normally without caching
    event.respondWith(fetch(event.request).catch(() => {
      // Return basic response for external resource failures
      if (event.request.destination === 'document') {
        return caches.match('/')
      }
      return new Response('Network error', { status: 503 })
    }))
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Only cache same-origin resources
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
            .catch((error) => {
              console.log('Cache put failed:', error)
            })

          return response
        })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
        // Return a basic response for other failed requests
        return new Response('Resource not available offline', { 
          status: 503,
          statusText: 'Service Unavailable'
        })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
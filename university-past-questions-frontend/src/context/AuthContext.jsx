import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { authApi } from '../api/authApi'

/**
 * Authentication Context - Manages global authentication state
 * Provides login, logout, registration, and user management functions
 */
const AuthContext = createContext()

/**
 * Custom hook to use authentication context
 * Must be used within AuthProvider component
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * AuthProvider Component - Wraps app to provide authentication state
 * Handles JWT tokens, user data, and API interceptors
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null) // Current user data
  const [loading, setLoading] = useState(true) // Initial loading state
  const [error, setError] = useState(null) // Authentication errors
  const interceptorRef = useRef(null) // Reference for axios interceptors

  // Set up axios interceptors for automatic token handling
  useEffect(() => {
    // Request interceptor - automatically add auth token to requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle authentication errors globally
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear authentication state
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
          setError('Session expired. Please login again.')
        }
        return Promise.reject(error)
      }
    )

    // Store interceptor references for cleanup
    interceptorRef.current = { requestInterceptor, responseInterceptor }

    return () => {
      // Cleanup interceptors on component unmount
      if (interceptorRef.current) {
        axios.interceptors.request.eject(interceptorRef.current.requestInterceptor)
        axios.interceptors.response.eject(interceptorRef.current.responseInterceptor)
      }
    }
  }, [])

  // Initialize authentication on app startup
   useEffect(() => {
     const initAuth = async () => {
       console.log('AuthContext: Initializing authentication...')
       const token = localStorage.getItem('token')
       console.log('AuthContext: Token found in localStorage:', !!token)

       if (token) {
         try {
           console.log('AuthContext: Verifying existing token...')
           // CRITICAL FIX: Pass the token to getProfile API call
           const response = await authApi.getProfile(token)
           console.log('AuthContext: Profile response:', response)

           // Backend returns: { success: true, data: userObject }
           const userData = response.data || response.user || response
           console.log('AuthContext: Extracted user data:', userData)

           if (userData && userData._id) {
             setUser(userData)
             setError(null)
             console.log('AuthContext: User set successfully')
           } else {
             throw new Error('Invalid user data received')
           }
         } catch (error) {
           console.error('AuthContext: Token validation failed:', error)
           // Clear invalid token and reset state
           localStorage.removeItem('token')
           setUser(null)
           setError('Session expired. Please login again.')
         }
       } else {
         console.log('AuthContext: No token found, user not authenticated')
       }

       // Set loading to false after authentication check
       console.log('AuthContext: Setting loading to false')
       setLoading(false)
     }

     initAuth()
   }, [])

  /**
   * Login function - Authenticates user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  const login = async (email, password) => {
     try {
       console.log('AuthContext login called with:', { email, password: '***' })
       setLoading(true)
       setError(null)

       // Call authentication service
       console.log('Calling authApi.login...')
       const response = await authApi.login(email, password)
       console.log('authApi.login response:', response)

       // Handle different possible response structures from backend
       const responseData = response.data || response
       console.log('Response data structure:', responseData)

       // Backend returns: { success: true, data: { _id, name, email, role, department, token }, message: "Login successful" }
       const userData = responseData.data || responseData.user || responseData
       const token = responseData.data?.token || responseData.token || responseData.accessToken
       console.log('Extracted token:', token ? 'present' : 'missing')
       console.log('Extracted user data:', userData)

       if (!token) {
         throw new Error('No token received from server')
       }

       // Store JWT token in localStorage
       localStorage.setItem('token', token)
       console.log('Token stored in localStorage')

       // Update user state - use the data object which contains user info + token
       setUser(userData)
       console.log('User state updated:', userData)

       return {
         success: true,
         message: responseData.message || 'Login successful',
         user: userData
       }
     } catch (error) {
       console.error('AuthContext login error:', error)
       const message = error.response?.data?.message || error.message || 'Login failed'
       console.error('Error message:', message)
       setError(message)

       // Clear any potentially invalid token
       localStorage.removeItem('token')

       return {
         success: false,
         message
       }
     } finally {
       setLoading(false)
     }
   }

  const register = async (userData) => {
     try {
       console.log('AuthContext register called with:', { ...userData, password: '***' })
       setLoading(true)
       setError(null)

       const response = await authApi.register(userData)
       console.log('authApi.register response:', response)

       // Handle different response structures
       const responseData = response.data || response
       console.log('Register response data structure:', responseData)

       // Backend returns: { success: true, data: { _id, name, email, role, department, token }, message: "User registered successfully" }
       const newUser = responseData.data || responseData.user || responseData
       const token = responseData.data?.token || responseData.token || responseData.accessToken
       console.log('Extracted token:', token ? 'present' : 'missing')
       console.log('Extracted user data:', newUser)

       if (!token) {
         throw new Error('No token received from server')
       }

       // Store token
       localStorage.setItem('token', token)
       console.log('Token stored in localStorage')

       // Set user data
       setUser(newUser)
       console.log('User state updated:', newUser)

       return {
         success: true,
         message: responseData.message || 'Registration successful',
         user: newUser
       }
     } catch (error) {
       console.error('AuthContext register error:', error)
       const message = error.response?.data?.message || error.message || 'Registration failed'
       console.error('Error message:', message)
       setError(message)

       return {
         success: false,
         message
       }
     } finally {
       setLoading(false)
     }
   }

  /**
   * Logout function - Clears authentication state and tokens
   */
  const logout = () => {
    try {
      // Remove JWT token from localStorage
      localStorage.removeItem('token')

      // Clear user state and any errors
      setUser(null)
      setError(null)

      // Optional: Call logout endpoint if backend needs to invalidate token
      // await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Force clear authentication state even if there's an error
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUser
    }))
  }

  const clearError = () => {
    setError(null)
  }

  const refreshToken = async () => {
     try {
       console.log('AuthContext: Refreshing token...')
       const token = localStorage.getItem('token')
       if (!token) {
         throw new Error('No token available for refresh')
       }
       
       const response = await authApi.getProfile(token)
       const userData = response.data || response.user || response
       console.log('AuthContext: Token refresh successful, user data:', userData)
       setUser(userData)
       return true
     } catch (error) {
       console.error('AuthContext: Token refresh failed:', error)
       logout()
       return false
     }
   }

  // Computed authentication state
   const isAuthenticated = !!user && !!localStorage.getItem('token')
   console.log('AuthContext: Computed isAuthenticated:', isAuthenticated, 'user:', !!user, 'token:', !!localStorage.getItem('token'))

  /**
   * Check if current user has admin privileges
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin === true
  }

  /**
   * Get current JWT token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // Context value object - provides authentication state and functions to components
   console.log('AuthContext: Creating context value - loading:', loading, 'user:', !!user, 'error:', !!error)
   const value = {
     // State variables
     user,        // Current user data
     loading,     // Loading state for async operations
     error,       // Authentication error messages

     // Authentication actions
     login,       // Login function
     register,    // Registration function
     logout,      // Logout function
     updateUser,  // Update user data
     clearError,  // Clear error state
     refreshToken,// Refresh authentication token

     // Computed getters
     isAuthenticated,  // Boolean: is user logged in
     isAdmin: isAdmin(), // Boolean: is user admin
     getToken,    // Function: get JWT token
   }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
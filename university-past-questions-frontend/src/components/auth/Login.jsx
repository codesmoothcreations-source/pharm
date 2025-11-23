import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import styles from './Login.module.css'

/**
 * Login Component - Handles user authentication
 * Provides login form with email/password fields and redirects authenticated users
 */
const Login = () => {
  // State for form data (email and password)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // State for UI controls
  const [showPassword, setShowPassword] = useState(false) // Toggle password visibility
  const [isLoading, setIsLoading] = useState(false) // Loading state during login
  const [error, setError] = useState('') // Error message display

  // Authentication context and navigation hooks
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination after login, default to home page
  const from = location.state?.from?.pathname || '/'

  // Redirect to intended page if user is already authenticated
   useEffect(() => {
     if (isAuthenticated) {
       navigate(from, { replace: true })
     }
   }, [isAuthenticated, navigate, from])

  /**
   * Handle input field changes
   * Updates form data and clears any existing error messages
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  /**
   * Handle form submission for login
   * Validates input, calls login API, and handles success/error states
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation - check if fields are filled
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields')
      return
    }

    // Email format validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    // Set loading state and clear previous errors
    setIsLoading(true)
    setError('')

    try {
      // Call login function from AuthContext with email and password
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Login successful - redirect to intended page (or home)
        navigate(from, { replace: true })
      } else {
        // Login failed - display error message from server
        setError(result.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      // Handle unexpected errors (network issues, etc.)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      // Always reset loading state
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking authentication status or redirecting
   if (isAuthenticated) {
     return (
       <div className={styles.authPage}>
         <div className={styles.authContainer}>
           <LoadingSpinner
             text="Redirecting..."
             size="large"
           />
         </div>
       </div>
     )
   }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Header section with title and description */}
          <div className={styles.authHeader}>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Display error message if login fails */}
          {error && (
            <div className={styles.authError}>
              <div className={styles.errorIcon}>!</div>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
                minLength="6"
              />
            </div>

            {/* Forgot password link */}
            <div className={styles.formOptions}>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot your password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={styles.authButton}
              disabled={isLoading || !formData.email || !formData.password}
            >
              {isLoading ? (
                <LoadingSpinner size="small" text="Signing In..." />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer with link to registration page */}
          <div className={styles.authFooter}>
            <p>
              Don't have an account?{' '}
              <Link
                to="/register"
                className={styles.authLink}
                state={{ from: location.state?.from }}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
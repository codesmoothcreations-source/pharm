import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import { authApi } from '../../api/authApi'
import styles from './Register.module.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Pharmacy'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth() // We'll use login to set the user after registration
  console.log('Register component: Component mounted')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Prepare data for API - remove confirmPassword
      const { confirmPassword, ...registerData } = formData

      console.log('Register component: Calling authApi.register...')
      // Call the register API endpoint
      const response = await authApi.register(registerData)
      console.log('Register component: Register response:', response)

      if (response.success) {
        console.log('Register component: Registration successful, attempting auto-login...')
        // If registration is successful, automatically log the user in using AuthContext
        const loginResult = await login(formData.email, formData.password)
        console.log('Register component: Auto-login result:', loginResult)

        if (loginResult.success) {
          console.log('Register component: Auto-login successful, redirecting to home')
          // Redirect to home page or dashboard
          navigate('/')
        } else {
          console.log('Register component: Auto-login failed, redirecting to login')
          // If auto-login fails, redirect to login page
          setError('Registration successful! Please log in.')
          navigate('/login')
        }
      } else {
        console.log('Register component: Registration failed:', response.message)
        // Handle registration error from API
        setError(response.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      // Handle network errors or other exceptions
      console.error('Registration error:', err)
      
      if (err.response) {
        // Server responded with error status
        setError(err.response.data?.message || 'Registration failed. Please try again.')
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.')
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2>Create Account</h2>
            <p>Join thousands of pharmacy students</p>
          </div>

          {error && (
            <div className={styles.authError}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>

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
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="department" className={styles.formLabel}>
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={styles.formSelect}
                required
                disabled={isLoading}
              >
                <option value="Pharmacy">Pharmssag</option>
              </select>
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
                minLength="6"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className={styles.authButton}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="small" text="" /> : 'Create Account'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" className={styles.authLink}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
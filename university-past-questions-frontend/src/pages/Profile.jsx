import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaEnvelope, FaUniversity, FaCalendar, FaEdit, FaSave, FaTimes, FaKey, FaDownload, FaHistory } from 'react-icons/fa'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './Profile.css'

const Profile = () => {
  const { user, updateUser, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userStats, setUserStats] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    studentId: '',
    phone: ''
  })

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        studentId: user.studentId || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  // Mock user stats - replace with actual API call
  useEffect(() => {
    const fetchUserStats = async () => {
      // Simulate API call
      setTimeout(() => {
        setUserStats({
          questionsDownloaded: 24,
          videosWatched: 15,
          joinedDate: user?.createdAt || '2024-01-01',
          lastActive: new Date().toISOString()
        })
      }, 1000)
    }

    if (user) {
      fetchUserStats()
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Call update profile API here
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user in context
      updateUser(formData)
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      department: user.department || '',
      studentId: user.studentId || '',
      phone: user.phone || ''
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="error-state">
            <h2>User Not Found</h2>
            <p>Unable to load user profile.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="profile-content">
          {/* Profile Information Card */}
          <div className="profile-card card">
            <div className="card-header">
              <h2>
                <FaUser className="header-icon" />
                Personal Information
              </h2>
              {!isEditing && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit />
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <FaUser className="input-icon" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="form-display">{user.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="input-icon" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="form-display">{user.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    <FaUniversity className="input-icon" />
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Department</option>
                      <option value="Pharmacy">Pharmssag</option>
                      {/* <option value="Medicine">Medicine</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Other">Other</option> */}
                    </select>
                  ) : (
                    <p className="form-display">{user.department || 'Not specified'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">
                    Student ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your student ID"
                    />
                  ) : (
                    <p className="form-display">{user.studentId || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="form-display">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Account Role
                  </label>
                  <p className="form-display">
                    <span className={`role-badge ${user.role}`}>
                      {user.role || 'user'}
                    </span>
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <LoadingSpinner size="small" /> : <FaSave />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
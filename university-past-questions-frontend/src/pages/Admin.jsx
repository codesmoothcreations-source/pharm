import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPanel from '../components/admin/AdminPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './Admin.css'

const Admin = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-loading">
            <LoadingSpinner 
              text="Loading admin panel..." 
              size="large"
              type="wave"
            />
          </div>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />
  }


  return (
    <div className="admin-page">
      <div className="container">
        {/* Main Admin Panel */}
        <AdminPanel /> 
      </div>
    </div>
  )
}

export default Admin
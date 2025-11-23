import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaHome, 
  FaSearch, 
  FaArrowLeft, 
  FaGraduationCap, 
  FaBook,
  FaExclamationTriangle 
} from 'react-icons/fa'
import './NotFound.css'

const NotFound = () => {
  const navigate = useNavigate()

  const quickLinks = [
    { path: '/', label: 'Home', icon: FaHome, description: 'Go back to homepage' },
    { path: '/courses', label: 'Browse Courses', icon: FaGraduationCap, description: 'Explore all courses' },
    { path: '/past-questions', label: 'Past Questions', icon: FaBook, description: 'Find past exam papers' },
    { path: '/search', label: 'Search', icon: FaSearch, description: 'Search for resources' }
  ]

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          {/* Error Illustration */}
          <div className="error-illustration">
            <div className="error-icon-wrapper">
              <FaExclamationTriangle className="error-icon" />
            </div>
            <div className="error-code">404</div>
          </div>

          {/* Error Message */}
          <div className="error-message">
            <h1>Page Not Found</h1>
            <p className="error-description">
              The page you're looking for doesn't exist or may have been moved.
            </p>
            <p className="error-suggestion">
              Don't worry though, you can find plenty of other resources below.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={handleGoBack}
              className="btn btn-outline btn-lg"
            >
              <FaArrowLeft />
              Go Back
            </button>
            <Link to="/" className="btn btn-primary btn-lg">
              <FaHome />
              Go Home
            </Link>
            <Link to="/search" className="btn btn-secondary btn-lg">
              <FaSearch />
              Browse Resources
            </Link>
          </div>

          {/* Quick Links */}
          <div className="quick-links-section">
            <h3>Quick Links</h3>
            <p>Here are some helpful pages to get you back on track:</p>
            
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.path} 
                  className="quick-link-card"
                >
                  <div className="quick-link-icon">
                    <link.icon />
                  </div>
                  <div className="quick-link-content">
                    <h4>{link.label}</h4>
                    <p>{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Search Suggestion */}
          <div className="search-suggestion">
            <h4>Can't find what you're looking for?</h4>
            <p>Try searching our database of past questions and video tutorials.</p>
            <Link to="/search" className="btn btn-outline">
              <FaSearch />
              Search Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
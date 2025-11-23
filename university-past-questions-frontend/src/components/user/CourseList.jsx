import React from 'react'
import { FaBook, FaVideo, FaDownload, FaEye } from 'react-icons/fa'
import "./CourseList.css"

const CourseList = ({ 
  level = "All", 
  semester = "All", 
  onCourseSelect, 
  courses = [], 
  loading = false, 
  error = '' 
}) => {
  const handleCourseSelect = (course) => {
    if (onCourseSelect) {
      onCourseSelect(course)
    }
  }

  if (loading) {
    return (
      <div className="course-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading {level} Level - Semester {semester} courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="course-list">
        <div className="error-state">
          <h3>Failed to Load Courses</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="course-list">
        <div className="no-results">
          <FaBook className="no-results-icon" />
          <h3>No Courses Found</h3>
          <p>No courses available for {level} Level - Semester {semester}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="course-list">
      <div className="course-header">
        <div className="header-content">
          <div>
            <h2>Available Courses</h2>
            <p className="course-count">
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
              {level !== "All" && ` • Level ${level}`}
              {semester !== "All" && ` • Semester ${semester}`}
            </p>
          </div>
        </div>
      </div>

      <div className="course-grid">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="course-card card"
            onClick={() => handleCourseSelect(course)}
          >
            <div className="course-header-content">
              <div className="course-icon">
                <FaBook />
              </div>
              <div className="course-meta">
                <h3 className="course-code">{course.code}</h3>
                <h4 className="course-name">{course.name}</h4>
                <span className="course-department">{course.department}</span>
              </div>
            </div>

            <div className="course-stats">
              <div className="stat-item">
                <FaBook className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{course.pastQuestions || 0}</span>
                  <span className="stat-label">Questions</span>
                </div>
              </div>
              <div className="stat-item">
                <FaVideo className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{course.videos || 0}</span>
                  <span className="stat-label">Videos</span>
                </div>
              </div>
              <div className="stat-item">
                <FaDownload className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{(course.downloads || 0).toLocaleString()}</span>
                  <span className="stat-label">Downloads</span>
                </div>
              </div>
            </div>

            <div className="course-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCourseSelect(course)
                }}
              >
                <FaEye />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseList
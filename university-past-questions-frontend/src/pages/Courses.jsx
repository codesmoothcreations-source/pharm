import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaBook, FaDownload, FaSort } from "react-icons/fa"
import { apiClient } from "../api/apiClient"
import "./Courses.css"

const Courses = () => {
  const navigate = useNavigate()
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const levels = ["100", "200", "300", "400"]
  const semesters = ["1", "2"]
  const sortOptions = [
    { value: "name", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "questions", label: "Most Questions" },
    { value: "downloads", label: "Most Downloads" }
  ]

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Build query parameters for filtering
        const queryParams = new URLSearchParams()
        if (selectedLevel) queryParams.append('level', selectedLevel)
        if (selectedSemester) queryParams.append('semester', selectedSemester)
        if (sortBy && sortBy !== 'name') queryParams.append('sort', sortBy)
        
        // Fetch from new courses API endpoint
        const response = await apiClient.get(`/courses?${queryParams}`)
        
        if (response.success) {
          const coursesData = response.data || []
          
          // Apply client-side sorting
          let sortedCourses = [...coursesData]
          if (sortBy === 'name') {
            sortedCourses.sort((a, b) => a.courseName.localeCompare(b.courseName))
          } else if (sortBy === 'name-desc') {
            sortedCourses.sort((a, b) => b.courseName.localeCompare(a.courseName))
          } else if (sortBy === 'questions') {
            sortedCourses.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0))
          } else if (sortBy === 'downloads') {
            sortedCourses.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
          }
          
          setCourses(sortedCourses)
        } else {
          throw new Error(response.message || 'Failed to fetch courses')
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError("Failed to load courses. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedLevel, selectedSemester, sortBy])

  const handleCourseClick = (course) => {
    if (course.questionCount > 0) {
      // Navigate to past questions for this course with filter
      navigate(`/past-questions?course=${course.courseCode}`)
    } else {
      // Show message that no questions are available yet
      alert(`No past questions available for ${course.courseCode} yet. Check back later!`)
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      '100': 'bg-blue-500',
      '200': 'bg-green-500',
      '300': 'bg-yellow-500',
      '400': 'bg-orange-500'
    }
    return colors[level] || 'bg-gray-500'
  }

  const totalQuestions = courses.reduce((sum, course) => sum + (course.questionCount || 0), 0)
  const totalDownloads = courses.reduce((sum, course) => sum + (course.downloadCount || 0), 0)

  if (error) {
    return (
      <div className="courses-page">
        <div className="container">
          <div className="error-state">
            <h3>Failed to Load</h3>
            <p>{error}</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="courses-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Available Courses</h1>
          <p>Browse {courses.length} pharmacy courses by level and semester</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-badge">
            <span className="stat-number">{courses.length}</span>
            <span className="stat-label">Courses</span>
          </div>
          <br />
          <div className="stat-badge">
            <span className="stat-number">{totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <div className="filter-label">Level</div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedLevel === "" ? "active" : ""}`}
                onClick={() => setSelectedLevel("")}
              >
                All
              </button>
              {levels.map(level => (
                <button
                  key={level}
                  className={`filter-btn ${selectedLevel === level ? "active" : ""}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">Semester</div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedSemester === "" ? "active" : ""}`}
                onClick={() => setSelectedSemester("")}
              >
                All
              </button>
              {semesters.map(semester => (
                <button
                  key={semester}
                  className={`filter-btn ${selectedSemester === semester ? "active" : ""}`}
                  onClick={() => setSelectedSemester(semester)}
                >
                  {semester}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">Sort</div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="loading-card">
                <div style={{height: "100px"}}></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <h3>No courses found</h3>
            <p>Try changing your filters</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div
                key={course._id}
                className={`course-card ${course.questionCount > 0 ? 'has-questions' : 'no-questions'}`}
                onClick={() => handleCourseClick(course)}
              >
                <div className="course-header">
                  <div className="course-code">{course.courseCode}</div>
                  <h3 className="course-name">{course.courseName}</h3>
                </div>
                
                <div className="course-meta">
                  <div className={`level-badge ${getLevelColor(course.level)}`}>
                    Level {course.level}
                  </div>
                  <div className="semester-badge">
                    Sem {course.semester}
                  </div>
                </div>

                <div className="course-stats">
                  <div className="stat">
                    <span className="stat-value">{course.questionCount || 0}</span>
                    <span className="stat-label">Questions</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{course.downloadCount || 0}</span>
                    <span className="stat-label">Downloads</span>
                  </div>
                </div>

                {course.questionCount === 0 && (
                  <div className="no-questions-badge">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses
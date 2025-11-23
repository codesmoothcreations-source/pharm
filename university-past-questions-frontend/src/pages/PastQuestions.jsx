import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { FaBook, FaSearch, FaFilter, FaSort, FaDownload, FaEye, FaCalendar, FaImage, FaFile, FaTrash } from 'react-icons/fa'
import { apiClient } from '../api/apiClient'
import './PastQuestions.css'

const PastQuestions = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadedItems, setDownloadedItems] = useState([])
  const [showGallery, setShowGallery] = useState(false)
  const [deletingItems, setDeletingItems] = useState(new Set())
  
  // Dynamic filter options from database
  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    semesters: [],
    departments: [],
    academicYears: [],
    courses: []
  })
  const [loadingFilters, setLoadingFilters] = useState(true)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  
  // Sort state
  const [sortBy, setSortBy] = useState('newest')

  // Legacy filter options (fallback)
  const legacyLevels = ['100', '200', '300', '400']
  const semesters = ['1', '2']
  const years = ['2024', '2023', '2022', '2021', '2020']

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'level', label: 'Level Order' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'views', label: 'Most Viewed' }
  ]

  // Initialize filters from URL parameters
  useEffect(() => {
    const courseFromUrl = searchParams.get('course')
    if (courseFromUrl) {
      setSelectedCourse(courseFromUrl)
    }
  }, [searchParams])

  // Fetch filter options from database
  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true)
      const response = await apiClient.get('/past-questions/filters')
      
      if (response.success) {
        setFilterOptions(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch filter options')
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
      // Use legacy options as fallback
      setFilterOptions({
        levels: legacyLevels,
        semesters: ['1', '2'],
        academicYears: ['2023/2024', '2022/2023', '2021/2022', '2020/2021', '2019/2020'],
        courses: []
      })
    } finally {
      setLoadingFilters(false)
    }
  }

  // Fetch all questions once (no dependencies to prevent refreshes)
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      
      // Fetch ALL questions without any filters initially
      const response = await apiClient.get('/past-questions')
      
      if (response.success) {
        const questionsData = response.data || []
        setQuestions(questionsData)
      } else {
        throw new Error(response.message || 'Failed to fetch questions')
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Failed to load past questions. Please try again.')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilterOptions()
    fetchQuestions()
  }, [])

  // Load downloaded items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('downloadedQuestions')
    if (stored) {
      try {
        const items = JSON.parse(stored)
        setDownloadedItems(items)
        console.log('Loaded downloaded items:', items.map(item => ({
          title: item.title,
          thumbnail: item.thumbnail,
          fileType: item.fileType
        })))
      } catch (err) {
        console.error('Error loading downloaded items:', err)
      }
    }
  }, [])

  // CLIENT-SIDE FILTERING with debouncing for search
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions]

    // Apply all filters
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(question =>
        question.title?.toLowerCase().includes(query) ||
        question.description?.toLowerCase().includes(query) ||
        question.course?.courseCode?.toLowerCase().includes(query) ||
        question.course?.courseName?.toLowerCase().includes(query)
      )
    }

    if (selectedLevel) {
      filtered = filtered.filter(question => question.level === selectedLevel)
    }

    if (selectedSemester) {
      filtered = filtered.filter(question => question.semester === selectedSemester)
    }

    if (selectedDepartment) {
      filtered = filtered.filter(question => question.department === selectedDepartment)
    }

    if (selectedYear) {
      // Handle both old format (2024) and new format (2023/2024)
      const normalizedYear = selectedYear.replace('/', '-')
      filtered = filtered.filter(question =>
        question.academicYear === selectedYear ||
        question.academicYear === normalizedYear ||
        question.academicYear === selectedYear.split('/')[0] // For single year matches
      )
    }

    if (selectedCourse) {
      filtered = filtered.filter(question =>
        question.course?.courseCode === selectedCourse ||
        question.courseCode === selectedCourse
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'downloads':
          return (b.downloadCount || 0) - (a.downloadCount || 0)
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0)
        case 'level':
          return (parseInt(a.level) || 0) - (parseInt(b.level) || 0)
        case 'year':
          const yearA = a.academicYear || '0'
          const yearB = b.academicYear || '0'
          return yearB.localeCompare(yearA)
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return filtered
  }, [questions, searchQuery, selectedLevel, selectedSemester, selectedDepartment, selectedYear, selectedCourse, sortBy])

  const createImageThumbnail = async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // Handle CORS
      img.onload = () => {
        // Create canvas to resize image for thumbnail
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set thumbnail size
        const maxSize = 150
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageUrl
    })
  }

  const handleDownload = async (question) => {
    try {
      // Use primary API URL as base
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'
      
      // Clean the file URL properly
      let cleanFileUrl = question.fileUrl.replace(/^\/*/, '').replace(/\\/g, '/')
      
      // Remove uploads prefix if present to avoid double uploads/
      cleanFileUrl = cleanFileUrl.replace(/^uploads\//, '')
      
      const downloadUrl = `${baseUrl}/uploads/${cleanFileUrl}`
      
      console.log('Downloading from:', downloadUrl, 'for file type:', question.fileType)
      
      // Create download link
      const link = document.createElement('a')
      const extension = question.fileType === 'pdf' ? 'pdf' :
                       question.fileType === 'image' ?
                       (question.fileUrl?.includes('.png') ? 'png' : 'jpg') :
                       'pdf'
      const fileName = `${question.title || 'past_question'}.${extension}`
      
      link.href = downloadUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Create thumbnail for images
      let thumbnailUrl = null
      if (question.fileType === 'image') {
        try {
          thumbnailUrl = await createImageThumbnail(downloadUrl)
          console.log('Created thumbnail for:', question.title)
        } catch (error) {
          console.warn('Failed to create thumbnail:', error)
          // Fallback to direct URL
          thumbnailUrl = downloadUrl
        }
      }

      // Add to downloaded items gallery
      const downloadedItem = {
        id: question._id,
        title: question.title,
        courseCode: question.course?.courseCode || 'Unknown',
        courseName: question.course?.courseName || '',
        fileType: question.fileType,
        fileUrl: downloadUrl,
        thumbnail: thumbnailUrl,
        downloadedAt: new Date().toISOString(),
        academicYear: question.academicYear,
        level: question.level,
        semester: question.semester
      }

      const updatedItems = [downloadedItem, ...downloadedItems.filter(item => item.id !== question._id)]
      setDownloadedItems(updatedItems)
      localStorage.setItem('downloadedQuestions', JSON.stringify(updatedItems))
      
      console.log('Added to gallery:', downloadedItem)
      
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const handleView = (question) => {
    window.location.href = `/preview/${question._id || question.id}`
  }

  const handleDeleteFromGallery = async (itemId) => {
    try {
      // Add visual feedback
      setDeletingItems(prev => new Set(prev).add(itemId))
      
      // Remove from localStorage and state
      const updatedItems = downloadedItems.filter(item => item.id !== itemId)
      setDownloadedItems(updatedItems)
      localStorage.setItem('downloadedQuestions', JSON.stringify(updatedItems))
      
      // Remove visual feedback after animation
      setTimeout(() => {
        setDeletingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 500)
      
    } catch (err) {
      console.error('Delete error:', err)
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedLevel('')
    setSelectedSemester('')
    setSelectedDepartment('')
    setSelectedYear('')
    setSelectedCourse('')
    // Clear URL parameters
    setSearchParams({})
  }

  const clearDownloadedGallery = () => {
    localStorage.removeItem('downloadedQuestions')
    setDownloadedItems([])
    console.log('Gallery cleared')
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <FaImage className="file-icon image" />
      case 'pdf':
        return <FaFile className="file-icon pdf" />
      default:
        return <FaFile className="file-icon" />
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get current filter context for display
  const getCurrentFilterContext = () => {
    const courseFromUrl = searchParams.get('course')
    if (courseFromUrl && selectedCourse === courseFromUrl) {
      const course = filterOptions.courses.find(c => c.value === courseFromUrl)
      const courseName = course ? course.label : courseFromUrl
      return `for ${courseName}`
    }
    return 'all questions'
  }

  if (loading) {
    return (
      <div className="past-questions-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading past questions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="past-questions-page">
        <div className="container">
          <div className="error-state">
            <FaBook className="error-icon" />
            <h2>Unable to Load Questions</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="past-questions-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>
                <FaBook className="header-icon" />
                Past Questions {selectedCourse ? `(Filtered ${getCurrentFilterContext()})` : ''}
              </h1>
              <p>Access past examination questions from various departments</p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{questions.length}</span>
                <span className="stat-label">Total Questions</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{filteredQuestions.length}</span>
                <span className="stat-label">Showing</span>
              </div>
              <div className="stat-card" onClick={() => setShowGallery(!showGallery)} style={{cursor: 'pointer'}}>
                <span className="stat-number">{downloadedItems.length}</span>
                <span className="stat-label">Downloaded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        {showGallery && (
          <div className="gallery-section">
            <div className="gallery-header">
              <h2>Your Downloaded Questions</h2>
              <div className="gallery-actions-header">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={clearDownloadedGallery}
                  disabled={downloadedItems.length === 0}
                >
                  Clear Gallery
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowGallery(false)}
                >
                  Hide Gallery
                </button>
              </div>
            </div>
            {downloadedItems.length === 0 ? (
              <div className="empty-gallery">
                <FaImage className="empty-icon" />
                <p>No downloaded questions yet. Download some to see them here!</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {downloadedItems.map(item => (
                  <div
                    key={item.id}
                    className={`gallery-item ${
                      deletingItems.has(item.id) ? 'deleting' : ''
                    }`}
                  >
                    <div className="gallery-thumbnail">
                      {item.thumbnail ? (
                        <React.Fragment>
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            onError={(e) => {
                              console.error('Image failed to load:', item.thumbnail)
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                            onLoad={() => console.log('Image loaded successfully:', item.thumbnail)}
                          />
                          <div className="file-placeholder" style={{display: 'none'}}>
                            {getFileIcon(item.fileType)}
                          </div>
                        </React.Fragment>
                      ) : (
                        <div className="file-placeholder">
                          {getFileIcon(item.fileType)}
                        </div>
                      )}
                    </div>
                    <div className="gallery-info">
                      <h4>{item.title}</h4>
                      <p>{item.courseCode} - {item.courseName}</p>
                      <small>Downloaded: {new Date(item.downloadedAt).toLocaleDateString()}</small>
                    </div>
                    <div className="gallery-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => window.open(item.fileUrl, '_blank')}
                        disabled={deletingItems.has(item.id)}
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = item.fileUrl
                          link.download = item.title
                          link.target = '_blank'
                          link.click()
                        }}
                        disabled={deletingItems.has(item.id)}
                      >
                        <FaDownload />
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteFromGallery(item.id)}
                        disabled={deletingItems.has(item.id)}
                        title="Remove from gallery"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, course, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="filter-select"
                disabled={loadingFilters}
              >
                <option value="">All Levels</option>
                {(filterOptions.levels.length > 0 ? filterOptions.levels : legacyLevels).map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="filter-select"
                disabled={loadingFilters}
              >
                <option value="">All Semesters</option>
                {(filterOptions.semesters.length > 0 ? filterOptions.semesters : semesters).map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
                disabled={loadingFilters}
              >
                <option value="">All Years</option>
                {(filterOptions.academicYears.length > 0 ? filterOptions.academicYears :
                  ['2023/2024', '2022/2023', '2021/2022', '2020/2021', '2019/2020']).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="filter-select"
                disabled={loadingFilters || filterOptions.courses.length === 0}
                style={{ minWidth: '250px' }}
              >
                <option value="">All Courses</option>
                {filterOptions.courses.map(course => (
                  <option key={course.value} value={course.value}>
                    {course.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedLevel || selectedSemester || selectedDepartment || selectedYear || selectedCourse) && (
            <div className="clear-filters">
              <button onClick={clearFilters} className="btn btn-outline">
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="results-section">
          {filteredQuestions.length === 0 ? (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <h3>No Questions Found</h3>
              <p>
                {questions.length === 0 
                  ? 'No past questions available yet.'
                  : 'No questions match your current filters.'
                }
              </p>
              {(searchQuery || selectedLevel || selectedSemester || selectedDepartment || selectedYear || selectedCourse) && (
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>
                  {filteredQuestions.length === questions.length 
                    ? 'All Past Questions' 
                    : `Showing ${filteredQuestions.length} of ${questions.length} questions`
                  }
                </h2>
              </div>

              <div className="questions-grid">
                {filteredQuestions.map(question => (
                  <div key={question._id} className="question-card card">
                    <div className="question-header">
                      <h3 className="question-title">{question.title}</h3>
                      <div className="question-meta">
                        <span className="meta-item">
                          <FaCalendar />
                          {question.academicYear}
                        </span>
                        <span className="meta-item">
                          Level {question.level} - Semester {question.semester}
                        </span>
                      </div>
                    </div>

                    <div className="question-course">
                      <h4>{question.course?.courseCode || 'Unknown Course'}</h4>
                      <p>{question.course?.courseName}</p>
                    </div>

                    {question.description && (
                      <p className="question-description">{question.description}</p>
                    )}

                    <div className="question-stats">
                      <div className="stat-item">
                        <span className="stat-value">{question.downloadCount || 0}</span>
                        <span className="stat-label">Downloads</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{question.viewCount || 0}</span>
                        <span className="stat-label">Views</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{formatFileSize(question.fileSize)}</span>
                        <span className="stat-label">Size</span>
                      </div>
                    </div>

                    <div className="question-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleView(question)}
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload(question)}
                        disabled={!question.fileUrl}
                      >
                        <FaDownload />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PastQuestions
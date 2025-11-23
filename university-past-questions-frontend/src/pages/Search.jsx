import React, { useState, useEffect } from 'react'
import { FaSearch, FaBook, FaVideo, FaFilter } from 'react-icons/fa'
import { getAllQuestions } from '../api/pastQuestionsApi'
import { searchVideos } from '../api/videosApi'
import { apiClient } from '../api/apiClient'
import './Search.css'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  // Dynamic filter options from database
  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    semesters: [],
    departments: [],
    academicYears: [],
    courses: []
  })
  const [loadingFilters, setLoadingFilters] = useState(true)
  
  const [filters, setFilters] = useState({
    type: 'all',
    level: '',
    semester: '',
    department: '',
    year: '',
    course: ''
  })

  const tabs = [
    { id: 'all', label: 'All Results', icon: <FaSearch /> },
    { id: 'questions', label: 'Past Questions', icon: <FaBook /> },
    { id: 'videos', label: 'Videos', icon: <FaVideo /> }
  ]

  // Legacy filter options (fallback)
  const legacyLevels = ['100', '200', '300', '400', '500']
  const legacyDepartments = ['Pharmacy', 'Medicine', 'Nursing', 'Engineering']
  const legacyYears = ['2023/2024', '2022/2023', '2021/2022', '2020/2021', '2019/2020']

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
        departments: legacyDepartments,
        academicYears: legacyYears,
        courses: []
      })
    } finally {
      setLoadingFilters(false)
    }
  }

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const [questionsResponse, videosResponse] = await Promise.allSettled([
        getAllQuestions(),
        searchVideos(searchQuery)
      ])

      let allResults = []

      // Process questions
      if (questionsResponse.status === 'fulfilled') {
        const questions = questionsResponse.value.data || questionsResponse.value || []
        const filteredQuestions = questions.filter(q => 
          q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.course?.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.course?.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(q => ({
          ...q,
          type: 'question',
          title: q.title || 'Past Question',
          description: q.description || `${q.course?.courseCode || 'Course'} - ${q.level} Level`
        }))
        allResults = [...allResults, ...filteredQuestions]
      }

      // Process videos
      if (videosResponse.status === 'fulfilled') {
        const videos = videosResponse.value.data || videosResponse.value || []
        const filteredVideos = videos.map(v => ({
          ...v,
          type: 'video',
          title: v.title || 'Video Tutorial',
          description: v.description || 'Educational video content'
        }))
        allResults = [...allResults, ...filteredVideos]
      }

      setResults(allResults)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    if (activeTab !== 'all' && result.type !== activeTab.slice(0, -1)) return false
    if (filters.level && result.level !== filters.level) return false
    if (filters.semester && result.semester !== filters.semester) return false
    if (filters.department && result.department !== filters.department) return false
    if (filters.year) {
      // Handle both old format (2024) and new format (2023/2024)
      const normalizedYear = filters.year.replace('/', '-')
      if (!(
        result.academicYear === filters.year ||
        result.academicYear === normalizedYear ||
        result.academicYear === filters.year.split('/')[0]
      )) return false
    }
    if (filters.course) {
      if (!(result.course?.courseCode === filters.course || result.courseCode === filters.course)) return false
    }
    return true
  })

  const clearFilters = () => {
    setFilters({
      type: 'all',
      level: '',
      semester: '',
      department: '',
      year: '',
      course: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all')

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <h1>
            <FaSearch className="header-icon" />
            Search Resources
          </h1>
          <p>Find past questions, videos, and study materials</p>
        </div>

        {/* Search Form */}
        <div className="search-form">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for courses, questions, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="search-filters">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="all">All Types</option>
              <option value="questions">Past Questions</option>
              <option value="videos">Videos</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
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
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="">All Semesters</option>
              {(filterOptions.semesters.length > 0 ? filterOptions.semesters : ['1', '2']).map(semester => (
                <option key={semester} value={semester}>Semester {semester}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="">All Departments</option>
              {(filterOptions.departments.length > 0 ? filterOptions.departments : legacyDepartments).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Academic Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="filter-select"
              disabled={loadingFilters}
            >
              <option value="">All Years</option>
              {(filterOptions.academicYears.length > 0 ? filterOptions.academicYears : legacyYears).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Course</label>
            <select
              value={filters.course}
              onChange={(e) => setFilters({...filters, course: e.target.value})}
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

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="filter-group">
              <label>&nbsp;</label>
              <button onClick={clearFilters} className="btn btn-outline" style={{ width: '100%' }}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="search-results">
          {filteredResults.length > 0 && (
            <div className="results-header">
              <h2>Search Results ({filteredResults.length})</h2>
            </div>
          )}

          {filteredResults.length === 0 && searchQuery && !loading && (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <h3>No Results Found</h3>
              <p>Try different keywords or adjust your filters</p>
            </div>
          )}

          <div className="results-list">
            {filteredResults.map((result, index) => (
              <div key={index} className="result-item card">
                <div className="result-icon">
                  {result.type === 'question' ? <FaBook /> : <FaVideo />}
                </div>
                <div className="result-content">
                  <h3 className="result-title">{result.title}</h3>
                  <p className="result-description">{result.description}</p>
                  <div className="result-meta">
                    <span className="result-type">{result.type}</span>
                    {result.level && <span className="result-level">Level {result.level}</span>}
                    {result.department && <span className="result-department">{result.department}</span>}
                  </div>
                </div>
                <div className="result-actions">
                  <button className="btn btn-secondary btn-sm">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
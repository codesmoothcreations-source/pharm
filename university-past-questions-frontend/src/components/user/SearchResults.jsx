import React, { useState, useEffect } from 'react'
import QuestionCard from './QuestionCard'
import VideoPlayer from './VideoPlayer'
import Filter from '../common/Filter'
import LoadingSpinner from '../common/LoadingSpinner'
import { FaList, FaTh, FaFilter, FaExclamationTriangle } from 'react-icons/fa'
import { getAllQuestions } from '../../api/pastQuestionsApi'
import { searchVideos } from '../../api/videosApi'
import pastQuestionsService from '../../services/pastQuestions'
import videosService from '../../services/videos'
import './SearchResults.css'

const SearchResults = ({ 
  searchQuery,
  onQuestionDownload,
  onQuestionView,
  onVideoSelect 
}) => {
  const [viewMode, setViewMode] = useState('grid')
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState({})
  const [questions, setQuestions] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filterOptions = [
    {
      type: 'level',
      label: 'Academic Level',
      options: [
        { value: '100', label: 'Level 100' },
        { value: '200', label: 'Level 200' },
        { value: '300', label: 'Level 300' },
        { value: '400', label: 'Level 400' }
      ]
    },
    {
      type: 'semester',
      label: 'Semester',
      options: [
        { value: '1', label: 'First Semester' },
        { value: '2', label: 'Second Semester' }
      ]
    },
    {
      type: 'department',
      label: 'Department',
      options: [
        { value: 'pharmacy', label: 'Pharmacy' },
        { value: 'medicine', label: 'Medicine' },
        { value: 'nursing', label: 'Nursing' }
      ]
    }
  ]

  // Fetch search results when searchQuery or filters change
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) return

      setLoading(true)
      setError('')
      
      try {
        // Fetch past questions
        const questionsResponse = await getAllQuestions()
        const allQuestions = questionsResponse.data || questionsResponse || []
        
        // Filter questions based on search query and active filters
        const filteredQuestions = allQuestions.filter(question => {
          const matchesSearch =
            question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.course?.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.course?.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.description?.toLowerCase().includes(searchQuery.toLowerCase())
          
          const matchesFilters =
            (!filters.level || question.level === filters.level) &&
            (!filters.semester || question.semester === filters.semester) &&
            (!filters.department || question.department === filters.department)
          
          return matchesSearch && matchesFilters
        })

        setQuestions(filteredQuestions)

        // Fetch videos if on videos tab or all tab
        if (activeTab === 'all' || activeTab === 'videos') {
          try {
            const videosResponse = await searchVideos(searchQuery)
            const allVideos = videosResponse.data || videosResponse || []
            
            // Filter videos based on active filters
            const filteredVideos = allVideos.filter(video => {
              return (
                (!filters.level || video.level === filters.level) &&
                (!filters.semester || video.semester === filters.semester) &&
                (!filters.department || video.department === filters.department)
              )
            })
            
            setVideos(filteredVideos)
          } catch (videoError) {
            console.error('Error fetching videos:', videoError)
            setVideos([])
          }
        }

      } catch (err) {
        console.error('Error fetching search results:', err)
        setError('Failed to load search results. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchQuery, filters, activeTab])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleRetry = () => {
    // Retry fetching results
    setError('')
    setLoading(true)
    // The useEffect will trigger again due to state changes
  }

  const getResultsCount = () => {
    switch (activeTab) {
      case 'questions':
        return questions.length
      case 'videos':
        return videos.length
      default:
        return questions.length + videos.length
    }
  }

  if (loading) {
    return (
      <div className="search-results">
        <div className="loading-container">
          <LoadingSpinner text={`Searching for "${searchQuery}"...`} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="search-results">
        <div className="error-state">
          <FaExclamationTriangle className="error-icon" />
          <h3>Search Failed</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="results-info">
          <h2>
            {searchQuery ? `Results for "${searchQuery}"` : 'All Resources'}
          </h2>
          <p className="results-count">{getResultsCount()} results found</p>
        </div>

        <div className="results-controls">
          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaTh />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>

          {/* Filter */}
          <Filter 
            filters={filterOptions}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>
      </div>

      {/* Results Tabs */}
      <div className="results-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Resources ({questions.length + videos.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Past Questions ({questions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({videos.length})
        </button>
      </div>

      {/* Results Content */}
      <div className="results-content">
        {(activeTab === 'all' || activeTab === 'questions') && (
          <div className="questions-section">
            <h3>Past Questions</h3>
            {questions.length === 0 ? (
              <div className="no-results">
                <p>No past questions found matching your criteria.</p>
                {searchQuery && (
                  <p>Try adjusting your search terms or filters.</p>
                )}
              </div>
            ) : (
              <div className={`questions-grid ${viewMode}`}>
                {questions.map(question => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onDownload={onQuestionDownload}
                    onView={onQuestionView}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'videos') && (
          <div className="videos-section">
            <h3>Video Tutorials</h3>
            {videos.length === 0 ? (
              <div className="no-results">
                <p>No video tutorials found matching your criteria.</p>
                {searchQuery && (
                  <p>Try adjusting your search terms or filters.</p>
                )}
              </div>
            ) : (
              <div className={`videos-grid ${viewMode}`}>
                {videos.map(video => (
                  <VideoPlayer
                    key={video.videoId || video.id}
                    video={video}
                    onVideoSelect={onVideoSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* No results state */}
      {getResultsCount() === 0 && !loading && (
        <div className="no-results-state">
          <FaExclamationTriangle className="no-results-icon" />
          <h3>No Results Found</h3>
          <p>We couldn't find any resources matching "{searchQuery}"</p>
          <div className="suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Adjust your filters</li>
              <li>Search for different terms</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchResults
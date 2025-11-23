import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaDownload, FaEye, FaArrowLeft, FaFilePdf, FaImage, FaCalendar, FaBook, FaUniversity, FaUser } from 'react-icons/fa'
import { getQuestionById, updateQuestion } from '../api/pastQuestionsApi'
import LoadingSpinner from '../components/common/LoadingSpinner'
import './Preview.css'

const Preview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true)
        const response = await getQuestionById(id)
        if (response.success) {
          setQuestion(response.data)
        } else {
          setError(response.message || 'Question not found')
        }
      } catch (err) {
        console.error('Error fetching question:', err)
        setError('Failed to load question details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchQuestion()
    }
  }, [id])

  // Helper function to construct proper file URL
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null
    
    // Remove any leading slashes and replace backslashes
    const cleanPath = fileUrl.replace(/^\/*/, '').replace(/\\/g, '/')
    
    // Construct full URL using environment variable or default
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'
    return `${baseUrl}/${cleanPath}`
  }

  // Helper function to get file extension
  const getFileExtension = (fileType, fileUrl) => {
    if (fileType === 'pdf') return 'pdf'
    if (fileType === 'image') {
      if (fileUrl?.includes('.png')) return 'png'
      if (fileUrl?.includes('.jpg') || fileUrl?.includes('.jpeg')) return 'jpg'
      return 'png' // default for images
    }
    if (fileType === 'doc' || fileUrl?.includes('.doc')) return 'doc'
    if (fileUrl?.includes('.docx')) return 'docx'
    return 'pdf' // default
  }

  const handleDownload = async () => {
    if (!question) return

    setDownloading(true)
    try {
      // Update download count on backend (non-blocking)
      try {
        await updateQuestion(question._id, {
          downloadCount: (question.downloadCount || 0) + 1
        }, localStorage.getItem('token'))
      } catch (err) {
        console.warn('Could not update download count:', err)
      }

      // Construct proper file URL
      const fileUrl = getFileUrl(question.fileUrl)
      if (!fileUrl) {
        throw new Error('File URL not found')
      }

      // Create download link with proper error handling
      const link = document.createElement('a')
      link.href = fileUrl
      const extension = getFileExtension(question.fileType, question.fileUrl)
      const fileName = `${question.title || 'past_question'}.${extension}`
      link.download = fileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'

      // Add to DOM and trigger download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

      // Update local state
      setQuestion(prev => ({
        ...prev,
        downloadCount: (prev.downloadCount || 0) + 1
      }))

    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleView = async () => {
    if (!question) return

    try {
      // Update view count on backend (non-blocking)
      try {
        await updateQuestion(question._id, {
          viewCount: (question.viewCount || 0) + 1
        }, localStorage.getItem('token'))
      } catch (err) {
        console.warn('Could not update view count:', err)
      }

      // Construct proper file URL
      const fileUrl = getFileUrl(question.fileUrl)
      if (!fileUrl) {
        throw new Error('File URL not found')
      }

      // Open in new tab
      window.open(fileUrl, '_blank', 'noopener,noreferrer')

      // Update local state
      setQuestion(prev => ({
        ...prev,
        viewCount: (prev.viewCount || 0) + 1
      }))

    } catch (error) {
      console.error('View failed:', error)
      alert('Failed to view file. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />
      case 'image':
        return <FaImage className="file-icon image" />
      default:
        return <FaFilePdf className="file-icon" />
    }
  }

  if (loading) {
    return (
      <div className="preview-page">
        <div className="container">
          <LoadingSpinner text="Loading question details..." />
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="preview-page">
        <div className="container">
          <div className="error-state">
            <h2>Question Not Found</h2>
            <p>{error || 'The requested question could not be found.'}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/past-questions')}
            >
              Back to Past Questions
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="preview-page">
      <div className="container">
        {/* Header */} 
        <div className="preview-header">
          <button
            className="back-btn"
            onClick={() => navigate('/past-questions')}
          >
            <FaArrowLeft />
            Back to Past Questions
          </button>
        </div>

        {/* Main Content */}
        <div className="preview-content">
          <div className="question-details">
            {/* File Preview */}
            <div className="file-preview-section">
              <div className="file-preview-card">
                <div className="file-icon-large">
                  {getFileIcon(question.fileType)}
                </div>
                <div className="file-info">
                  <h2 className="question-title">{question.title}</h2>
                  <div className="file-meta">
                    <span className="file-type">{question.fileType?.toUpperCase()}</span>
                    <span className="file-size">
                      {question.fileSize ? `${(question.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleView}
                  disabled={!question.fileUrl}
                >
                  <FaEye />
                  Preview File
                </button>
                {/* <button
                  className="btn btn-outline btn-lg"
                  onClick={handleDownload}
                  disabled={downloading || !question.fileUrl}
                >
                  <FaDownload />
                  {downloading ? 'Downloading...' : 'Download'}
                </button> */}
              </div>
            </div>

            {/* Question Information */}
            <div className="question-info-section">
              <div className="info-card">
                <h3>Question Details</h3>

                <div className="info-grid">
                  <div className="info-item">
                    <FaBook className="info-icon" />
                    <div>
                      <strong>Course:</strong>
                      <span>{question.course?.courseCode} - {question.course?.courseName}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaUniversity className="info-icon" />
                    <div>
                      <strong>Level:</strong>
                      <span>Level {question.level}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaCalendar className="info-icon" />
                    <div>
                      <strong>Semester:</strong>
                      <span>Semester {question.semester}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaCalendar className="info-icon" />
                    <div>
                      <strong>Academic Year:</strong>
                      <span>{question.academicYear}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaEye className="info-icon" />
                    <div>
                      <strong>Views:</strong>
                      <span>{question.viewCount || 0}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaDownload className="info-icon" />
                    <div>
                      <strong>Downloads:</strong>
                      <span>{question.downloadCount || 0}</span>
                    </div>
                  </div>
                </div>

                {question.description && (
                  <div className="description-section">
                    <h4>Description</h4>
                    <p>{question.description}</p>
                  </div>
                )}

                {question.tags && question.tags.length > 0 && (
                  <div className="tags-section">
                    <h4>Tags</h4>
                    <div className="tags">
                      {question.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="dates-section">
                  <div className="date-info">
                    <span>Uploaded: {formatDate(question.createdAt)}</span>
                    {question.updatedAt !== question.createdAt && (
                      <span>Last updated: {formatDate(question.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Videos */}
          {question.youtubeLinks && question.youtubeLinks.length > 0 && (
            <div className="related-videos-section">
              <h3>Related Videos</h3>
              <div className="videos-grid">
                {question.youtubeLinks.map((video, index) => (
                  <div key={index} className="video-card">
                    <div className="video-thumbnail" onClick={() => window.open(video.url, '_blank')}>
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/320x180/3498db/ffffff?text=Video'
                        }}
                      />
                      <div className="video-overlay">
                        <FaPlay className="play-icon" />
                      </div>
                    </div>
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.channelTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Preview
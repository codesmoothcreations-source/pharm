import React from 'react'
import { FaDownload, FaEye, FaCalendar, FaFilePdf, FaBook, FaUniversity } from 'react-icons/fa'
import styles from './QuestionCard.module.css'

const QuestionCard = ({ question, onDownload, onView }) => {
  const {
    _id,
    title,
    course,
    academicYear,
    semester,
    level,
    description,
    fileUrl,
    downloadCount = 0,
    viewCount = 0,
    createdAt,
    updatedAt
  } = question

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Determine file type from URL or description
  const getFileType = () => {
    if (fileUrl?.includes('.pdf')) return 'pdf'
    if (fileUrl?.includes('.doc') || fileUrl?.includes('.docx')) return 'doc'
    if (fileUrl?.includes('.jpg') || fileUrl?.includes('.png') || fileUrl?.includes('.jpeg')) return 'image'
    return 'pdf' // default
  }

  const getFileIcon = (type) => {
    const fileType = type || getFileType()
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className={`file-icon pdf ${styles.fileIcon}`} />
      case 'image':
        return <FaFilePdf className={`file-icon image ${styles.fileIcon}`} />
      case 'doc':
        return <FaFilePdf className={`file-icon doc ${styles.fileIcon}`} />
      default:
        return <FaFilePdf className={`file-icon ${styles.fileIcon}`} />
    }
  }

  const handleDownload = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDownload) {
      onDownload(question)
    } else if (fileUrl) {
      // Fallback: direct download
      window.open(fileUrl, '_blank')
    }
  }

  const handleView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onView) {
      onView(question)
    } else if (fileUrl) {
      // Fallback: open in new tab
      window.open(fileUrl, '_blank')
    }
  }

  const handleCardClick = () => {
    // Navigate to preview page
    window.location.href = `/preview/${question._id}`
  }

  return (
    <div className={`${styles.questionCard} card`} onClick={handleCardClick}>
      <div className={styles.questionHeader}>
        <div className={styles.fileType}>
          {getFileIcon()}
        </div>
        <div className={styles.questionInfo}>
          <h3 className={styles.questionTitle} title={title}>
            {title || 'Untitled Question'}
          </h3>
          
          <div className={styles.courseDetails}>
            <span className="course-info">
              <FaBook className={styles.infoIcon} />
              {course?.courseCode || course || 'No Course'}
            </span>
            {level && (
              <span className="department-info">
                <FaUniversity className={styles.infoIcon} />
                Level {level}
              </span>
            )}
          </div>

          {description && (
            <p className={styles.questionDescription}>
              {description.length > 100 
                ? `${description.substring(0, 100)}...` 
                : description
              }
            </p>
          )}

          <div className={styles.questionMeta}>
            {academicYear && (
              <span className={styles.metaItem}>
                <FaCalendar />
                {academicYear}
              </span>
            )}
            {semester && (
              <span className={styles.metaItem}>
                Semester {semester}
              </span>
            )}
            <span className={styles.metaItem}>
              <FaEye />
              {viewCount} views
            </span>
            <span className={styles.metaItem}>
              <FaDownload />
              {downloadCount} downloads
            </span>
          </div>

          {(createdAt || updatedAt) && (
            <div className={styles.dateInfo}>
              {createdAt && (
                <span className="date-item">
                  Added: {formatDate(createdAt)}
                </span>
              )}
              {updatedAt && updatedAt !== createdAt && (
                <span className="date-item">
                  Updated: {formatDate(updatedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.questionActions}>
        <button 
          className={`${styles.actionButton} ${styles.btnOutline}`}
          onClick={handleView}
          title="Preview this question"
        >
          <FaEye />
          Preview
        </button>
        <button 
          className={`${styles.actionButton} ${styles.btnPrimary}`}
          onClick={handleDownload}
          title="Download this question"
        >
          <FaDownload />
          Download
        </button>
      </div>
    </div>
  )
}

export default QuestionCard
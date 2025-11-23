import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaTrash, FaCheck, FaPlus } from 'react-icons/fa'
import { updateQuestion, deleteQuestion } from '../../api/pastQuestionsApi'
import CourseDropdown from './CourseDropdown'
import styles from './EditQuestion.module.css'

const EditQuestion = ({ question, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    academicYear: '',
    semester: '1',
    level: '100',
    tags: []
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        // Handle both ObjectId reference and populated course object
        course: question.course?._id || question.course || '',
        academicYear: question.academicYear || '',
        semester: question.semester?.toString() || '1',
        level: question.level || '100',
        tags: question.tags || []
      })
    }
  }, [question])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleCourseChange = (courseId) => {
    setFormData(prev => ({
      ...prev,
      course: courseId
    }))
    if (error) setError('')
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.title || !formData.course || !formData.academicYear) {
        setError('Please fill in all required fields (Title, Course, Academic Year)')
        setLoading(false)
        return
      }

      // Prepare update data - only send metadata, no file
      const updateData = {
        title: formData.title,
        course: formData.course, // Send ObjectId
        academicYear: formData.academicYear,
        semester: formData.semester,
        level: formData.level,
        tags: formData.tags
      }

      const updatedQuestion = await updateQuestion(
        question._id || question.id,
        updateData,
        token
      )
      
      setSuccess(true)
      setTimeout(() => {
        onSave(updatedQuestion)
      }, 800)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question. Please try again.')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      await deleteQuestion(question._id || question.id, token)
      onDelete(question._id || question.id)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question. Please try again.')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!question) {
    return (
      <div className={styles.editQuestion}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading question...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editQuestion}>
      <div className={styles.formHeader}>
        <h2>Edit Past Question</h2>
        <button 
          onClick={onCancel} 
          className={styles.closeBtn} 
          disabled={loading}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          <FaCheck className={styles.successAnimation} />
          Question updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.editFormContent}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Enter question title..."
              required
              disabled={loading}
            />
          </div>

          <CourseDropdown
            value={formData.course}
            onChange={handleCourseChange}
            disabled={loading}
            required={true}
            label="Course"
            placeholder="Select a course"
          />

          <div className={styles.formGroup}>
            <label htmlFor="academicYear" className={styles.formLabel}>
              Academic Year *
            </label>
            <input
              id="academicYear"
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="e.g., 2022/2023"
              required
              disabled={loading}
              pattern="[0-9]{4}\/[0-9]{4}"
              title="Please enter academic year in format: 2023/2024"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="level" className={styles.formLabel}>
              Level *
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className={styles.formSelect}
              required
              disabled={loading}
            >
              <option value="100">Level 100</option>
              <option value="200">Level 200</option>
              <option value="300">Level 300</option>
              <option value="400">Level 400</option>
              {/* <option value="500">Level 500</option> */}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="semester" className={styles.formLabel}>
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className={styles.formSelect}
              required
              disabled={loading}
            >
              <option value="1">First Semester</option>
              <option value="2">Second Semester</option>
            </select>
          </div>
        </div>

        {/* Tags Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags</label>
          <div className={styles.tagsInput}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              className={styles.formInput}
              placeholder="Add tags and press Enter"
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={addTag} 
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
              disabled={loading || !tagInput.trim()}
            >
              <FaPlus />
            </button>
          </div>
          <div className={styles.tagsList}>
            {formData.tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  disabled={loading}
                  aria-label={`Remove ${tag} tag`}
                >
                  <FaTimes />
                </button>
              </span>
            ))}
            {formData.tags.length === 0 && (
              <span className={styles.noTags}>No tags added yet</span>
            )}
          </div>
        </div>

        {/* File Information Display */}
        {question.fileUrl && (
          <div className={styles.fileInfo}>
            <label className={styles.formLabel}>Current File</label>
            <div className={styles.currentFile}>
              <span className={styles.fileName}>
                {question.fileType === 'pdf' ? '📄' : question.fileType === 'image' ? '🖼️' : '📝'} 
                {' '}{question.title}.{question.fileType}
              </span>
              <span className={styles.fileSize}>
                {question.fileSize ? `${(question.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
              </span>
            </div>
            <small className={styles.helpText}>
              Note: To change the file, please delete this question and upload a new one.
            </small>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <div className={styles.actionLeft}>
            <button 
              type="button" 
              onClick={handleDelete}
              className={`${styles.btn} ${styles.btnOutline} ${styles.deleteBtn}`}
              disabled={loading}
            >
              <FaTrash />
              {loading ? (
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                'Delete Question'
              )}
            </button>
          </div>
          <div className={styles.actionRight}>
            <button 
              type="button" 
              onClick={onCancel} 
              className={`${styles.btn} ${styles.btnOutline}`}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditQuestion

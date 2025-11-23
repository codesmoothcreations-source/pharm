import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllQuestions, updateQuestion, uploadQuestion, deleteQuestion } from '../../api/pastQuestionsApi'
import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
  const [pastQuestions, setPastQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    academicYear: '',
    semester: '',
    level: '100',
    fileUrl: '',
    description: ''
  })

  useEffect(() => {
    fetchPastQuestions()
  }, [])

  const fetchPastQuestions = async () => {
    try {
      setLoading(true)
      const response = await getAllQuestions()
      setPastQuestions(response.data || response)
    } catch (err) {
      setError('Failed to fetch past questions')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        const token = localStorage.getItem('token')
        await updateQuestion(editingQuestion._id, formData, token)
      } else {
        const token = localStorage.getItem('token')
        await uploadQuestion(formData, token)
      }
      await fetchPastQuestions()
      resetForm()
    } catch (err) {
      setError('Failed to save past question')
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setFormData({
      title: question.title || '',
      course: question.course || '',
      academicYear: question.academicYear || '',
      semester: question.semester || '',
      level: question.level || '100',
      fileUrl: question.fileUrl || '',
      description: question.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('token')
        await deleteQuestion(id, token)
        await fetchPastQuestions()
      } catch (err) {
        setError('Failed to delete past question')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      course: '',
      academicYear: '',
      semester: '',
      level: '100',
      fileUrl: '',
      description: ''
    })
    setEditingQuestion(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite" aria-label="Loading past questions">
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading past questions...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        {/* <button
          className={styles.btnPrimary}
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
          aria-controls="question-form"
        >
          {showForm ? 'Cancel' : 'Add New Question'}
        </button> */}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.formSection} id="question-form" role="region" aria-labelledby="form-title">
          <h2 id="form-title">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          <form onSubmit={handleSubmit} className={styles.questionForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="course">Course</label>
                <input
                  id="course"
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="academicYear">Academic Year</label>
                <input
                  id="academicYear"
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., 2023/2024"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  <option value="1">First Semester</option>
                  <option value="2">Second Semester</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="level">Level</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                  disabled={loading}
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="fileUrl">File URL</label>
                <input
                  id="fileUrl"
                  // type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="https://example.com/file.pdf"
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                rows="3"
                placeholder="Optional description..."
                disabled={loading}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
                aria-describedby="submit-description"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
              <span id="submit-description" className="sr-only">
                {loading ? 'Processing your request' : 'Form is ready for submission'}
              </span>
            </div>
          </form>
        </div>
      )}

      <div className={styles.questionsSection} role="region" aria-label="Past questions list">
        <h2>Past Questions ({pastQuestions.length})</h2>
        
        {pastQuestions.length === 0 ? (
          <div className={styles.emptyState} role="status" aria-live="polite">
            <p>No past questions found. Add your first question!</p>
          </div>
        ) : (
          <div className={styles.courseGrid} role="grid" aria-label="Questions grid">
            {pastQuestions.map((question) => (
              <div key={question._id} className={styles.courseCard} role="gridcell">
                <div className={styles.questionInfo}>
                  <h3>{question.title}</h3>
                  <p><strong>Course:</strong> {question.course?.courseCode || question.course}</p>
                  <p><strong>Year:</strong> {question.academicYear}</p>
                  <p><strong>Semester:</strong> {question.semester}</p>
                  <p><strong>Level:</strong> {question.level}</p>
                  {question.description && (
                    <p><strong>Description:</strong> {question.description}</p>
                  )}
                </div>
                
                <div className={styles.courseActions}>
                  <button
                    className={styles.btnOutline}
                    onClick={() => handleEdit(question)}
                    aria-label={`Edit question: ${question.title}`}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.btnError}
                    onClick={() => handleDelete(question._id)}
                    aria-label={`Delete question: ${question.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
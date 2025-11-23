import React, { useState, useEffect, useCallback } from 'react'
// import AdminDashboard from './AdminDashboard'
import UploadForm from './UploadForm'
import EditQuestion from './EditQuestion'
import { FaTachometerAlt, FaUpload, FaList, FaUsers, FaCog, FaEdit, FaTrash } from 'react-icons/fa'
import { getAllQuestions, uploadQuestion, updateQuestion, deleteQuestion } from '../../api/pastQuestionsApi'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import styles from './AdminPanel.module.css'

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast, ToastContainer } = useToast()

  const menuItems = [
    // { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'questions', label: 'Manage Questions', icon: FaList },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ]

  // Fetch all questions with useCallback for performance
  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAllQuestions()
      // Handle different response structures
      const questionsData = response.data || response
      setQuestions(Array.isArray(questionsData) ? questionsData : [])
    } catch (err) {
      setError('Failed to fetch questions: ' + (err.response?.data?.message || err.message))
      console.error('Error fetching questions:', err)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle upload new question with proper error handling
  const handleUpload = useCallback(async (formData) => {
    setLoading(true)
    // setError('')
    try {
      const token = localStorage.getItem('token')
      await uploadQuestion(formData, token)
      await fetchQuestions() // Refresh the list
      setShowUploadForm(false)
      addToast('Question uploaded successfully!', 'success')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to upload question'
      // setError(errorMsg)
      // addToast(errorMsg, 'error')
      console.error('Error uploading question:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchQuestions, addToast])

  // Handle save edited question
  const handleSaveEdit = useCallback(async (formData) => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await updateQuestion(editingQuestion._id, formData, token)
      await fetchQuestions() // Refresh the list
      setEditingQuestion(null)
      addToast('Question updated successfully!', 'success')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update question'
      setError(errorMsg)
      addToast(errorMsg, 'error')
      console.error('Error updating question:', err)
    } finally {
      setLoading(false)
    }
  }, [editingQuestion?._id, fetchQuestions, addToast])

  // Handle delete question with confirmation
  const handleDeleteQuestion = useCallback(async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await deleteQuestion(questionId, token)
      await fetchQuestions() // Refresh the list
      if (editingQuestion?._id === questionId) {
        setEditingQuestion(null)
      }
      addToast('Question deleted successfully!', 'success')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete question'
      setError(errorMsg)
      addToast(errorMsg, 'error')
      console.error('Error deleting question:', err)
    } finally {
      setLoading(false)
    }
  }, [editingQuestion?._id, fetchQuestions, addToast])

  // Handle menu item clicks
  const handleMenuClick = useCallback((sectionId) => {
    setActiveSection(sectionId)
  }, [])

  // Load questions when component mounts or when activeSection changes to questions
  useEffect(() => {
    if (activeSection === 'questions') {
      fetchQuestions()
    }
  }, [activeSection])

  // Disable background scroll when modals are open
  useEffect(() => {
    if (showUploadForm || editingQuestion) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [showUploadForm, editingQuestion])

  const renderQuestionsList = useCallback(() => {
    if (loading) return <LoadingSpinner text="Loading questions..." />
    
    if (error) return (
      <div className={styles.errorMessage} role="alert" aria-live="polite">
        <p>Error: {error}</p>
        <button
          className={styles.btnPrimary}
          onClick={fetchQuestions}
          aria-label="Retry loading questions"
        >
          Retry
        </button>
      </div>
    )
    
    if (questions.length === 0) return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <p>No questions found.</p>
        <button
          className={styles.btnPrimary}
          onClick={() => setShowUploadForm(true)}
          aria-label="Upload first question"
        >
          <FaUpload aria-hidden="true" />
          Upload First Question
        </button>
      </div>
    )

    return (
      <div className={styles.questionsTable} role="region" aria-label="Questions management table">
        <div className={styles.tableResponsive}>
          <table role="table" aria-label="Past questions list">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Course</th>
                <th scope="col">Year</th>
                <th scope="col">Level</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(question => (
                <tr key={question._id}>
                  <td>{question.title || 'Untitled'}</td>
                  <td>{question.course?.courseCode || 'N/A'}</td>
                  <td>{question.academicYear || 'N/A'}</td>
                  <td>{question.level || 'N/A'}</td>
                  <td className={styles.actions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => setEditingQuestion(question)}
                      title="Edit question"
                      disabled={loading}
                      aria-label={`Edit question: ${question.title || 'Untitled'}`}
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDeleteQuestion(question._id)}
                      title="Delete question"
                      disabled={loading}
                      aria-label={`Delete question: ${question.title || 'Untitled'}`}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [loading, error, questions, fetchQuestions, handleDeleteQuestion])

  const renderContent = useCallback(() => {
    switch (activeSection) {
      case 'dashboard':
        // return <AdminDashboard />
      case 'questions':
        return (
          <div className={styles.questionsManagement} role="region" aria-label="Questions management">
            <div className={styles.sectionHeader}>
              <h2>Manage Past Questions</h2>
              <button
                className={styles.btnPrimary}
                onClick={() => setShowUploadForm(!showUploadForm)}
                disabled={loading}
                aria-label={showUploadForm ? 'Cancel upload' : 'Upload new question'}
                aria-expanded={showUploadForm}
              >
                <FaUpload aria-hidden="true" />
                {showUploadForm ? 'Cancel Upload' : 'Upload New Question'}
              </button>
            </div>
            
            {showUploadForm && (
              <div className={styles.uploadFormSection} role="region" aria-label="Upload form">
                <UploadForm
                  onUpload={handleUpload}
                  onCancel={() => setShowUploadForm(false)}
                  loading={loading}
                />
              </div>
            )}
            
            {renderQuestionsList()}
          </div>
        )
      case 'users':
        return (
          <div className={styles.usersManagement} role="region" aria-label="User management">
            <div className={styles.sectionHeader}>
              <h2>User Management</h2>
            </div>
            <div className={styles.managementContent}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FaUsers />
                </div>
                <h3>User Management Center</h3>
                <p>Comprehensive user administration tools and analytics.</p>
                <p>Features include user roles, permissions, activity monitoring, and account management.</p>
                <div className={styles.featureGrid}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureNumber}>1,247</span>
                    <span className={styles.featureLabel}>Total Users</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureNumber}>89</span>
                    <span className={styles.featureLabel}>Active Today</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureNumber}>12</span>
                    <span className={styles.featureLabel}>New This Week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className={styles.settingsManagement} role="region" aria-label="Platform settings">
            <div className={styles.sectionHeader}>
              <h2>Platform Settings</h2>
            </div>
            <div className={styles.managementContent}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FaCog />
                </div>
                <h3>System Configuration</h3>
                <p>Advanced platform settings and configuration options.</p>
                <p>Manage system preferences, security settings, and administrative controls.</p>
                <div className={styles.settingsGrid}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingHeader}>
                      <FaCog className={styles.settingIcon} />
                      <span>General Settings</span>
                    </div>
                    <p>Platform-wide configuration options</p>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingHeader}>
                      <FaUsers className={styles.settingIcon} />
                      <span>User Permissions</span>
                    </div>
                    <p>Role-based access control</p>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingHeader}>
                      <FaUpload className={styles.settingIcon} />
                      <span>File Management</span>
                    </div>
                    <p>Upload limits and storage settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        // return <AdminDashboard />
    }
  }, [activeSection, loading, renderQuestionsList])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, sectionId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMenuClick(sectionId)
    }
  }, [handleMenuClick])

  return (
    <div className={styles.adminPanel} role="application" aria-label="Admin Panel">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Sidebar */}
      <div className={styles.adminSidebar} role="navigation" aria-label="Admin navigation">
        <div className={styles.sidebarHeader}>
          <h3>Admin Panel</h3>
        </div>
        
        <nav className={styles.sidebarNav} role="menubar">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleMenuClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                disabled={loading}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label} section`}
              >
                <Icon className={styles.navIcon} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className={styles.adminContent} role="main">
        {loading && activeSection !== 'dashboard' && (
          <div className={styles.loadingOverlay} role="status" aria-live="polite">
            <LoadingSpinner text="Processing..." />
          </div>
        )}
        {renderContent()}
      </main>

      {/* Modals */}
      {showUploadForm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <div className={styles.modalContent}>
            <UploadForm
              onUpload={handleUpload}
              onCancel={() => setShowUploadForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {editingQuestion && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <div className={styles.modalContent}>
            <EditQuestion
              question={editingQuestion}
              onSave={handleSaveEdit}
              onCancel={() => setEditingQuestion(null)}
              onDelete={handleDeleteQuestion}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel

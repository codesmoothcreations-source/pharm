import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getAllCourses } from '../../api/coursesApi'
import LoadingSpinner from '../common/LoadingSpinner'
import styles from './CourseDropdown.module.css'

const CourseDropdown = ({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Select a course",
  required = false,
  error = "",
  label = "Course"
}) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Fetch courses from database
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setErrorState('')
      const response = await getAllCourses()
      const coursesData = response.data || response
      
      if (Array.isArray(coursesData)) {
        setCourses(coursesData)
      } else if (coursesData.data && Array.isArray(coursesData.data)) {
        setCourses(coursesData.data)
      } else {
        throw new Error('Invalid courses data format')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setErrorState('Failed to load courses from database')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses
    
    const searchLower = searchTerm.toLowerCase()
    return courses.filter(course => 
      course.courseCode?.toLowerCase().includes(searchLower) ||
      course.courseName?.toLowerCase().includes(searchLower) ||
      course.description?.toLowerCase().includes(searchLower)
    )
  }, [courses, searchTerm])

  // Find selected course
  useEffect(() => {
    if (value && courses.length > 0) {
      const course = courses.find(c => c._id === value || c.courseCode === value)
      setSelectedCourse(course || null)
    } else {
      setSelectedCourse(null)
    }
  }, [value, courses])

  // Handle course selection
  const handleSelect = useCallback((course) => {
    setSelectedCourse(course)
    onChange?.(course ? course._id : '')
    setIsOpen(false)
    setSearchTerm('')
  }, [onChange])

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
  }, [])

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen)
    }
  }, [disabled, loading, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(`.${styles.dropdownContainer}`)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    const currentIndex = filteredCourses.findIndex(course => course._id === selectedCourse?._id)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (currentIndex < filteredCourses.length - 1) {
          setSelectedCourse(filteredCourses[currentIndex + 1])
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (currentIndex > 0) {
          setSelectedCourse(filteredCourses[currentIndex - 1])
        }
        break
      case 'Enter':
        e.preventDefault()
        if (selectedCourse) {
          handleSelect(selectedCourse)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [isOpen, filteredCourses, selectedCourse, handleSelect])

  if (loading) {
    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{label}</label>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="small" text="Loading courses..." />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formGroup}>
      <label htmlFor="course-dropdown" className={styles.formLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.dropdownContainer} id="course-dropdown">
        <button
          type="button"
          className={`${styles.dropdownButton} ${error || errorState ? styles.error : ''}`}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={selectedCourse ? `${selectedCourse.courseCode} - ${selectedCourse.courseName}` : placeholder}
        >
          <div className={styles.selectedValue}>
            {selectedCourse ? (
              <div className={styles.selectedCourse}>
                <span className={styles.courseCode}>{selectedCourse.courseCode}</span>
                <span className={styles.courseName}>{selectedCourse.courseName}</span>
                {selectedCourse.questionCount !== undefined && (
                  <span className={styles.questionCount}>
                    ({selectedCourse.questionCount} questions)
                  </span>
                )}
              </div>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </div>
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`} aria-hidden="true">
            ▼
          </span>
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
            
            <div className={styles.optionsContainer} role="presentation">
              {filteredCourses.length === 0 ? (
                <div className={styles.noResults}>
                  {searchTerm ? 'No courses found' : 'No courses available'}
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className={`${styles.option} ${selectedCourse?._id === course._id ? styles.selected : ''}`}
                    onClick={() => handleSelect(course)}
                    role="option"
                    aria-selected={selectedCourse?._id === course._id}
                  >
                    <div className={styles.courseInfo}>
                      <span className={styles.courseCode}>{course.courseCode}</span>
                      <span className={styles.courseName}>{course.courseName}</span>
                      {course.level && (
                        <span className={styles.courseLevel}>Level {course.level}</span>
                      )}
                    </div>
                    <div className={styles.courseStats}>
                      {course.questionCount !== undefined && (
                        <span className={styles.statItem}>
                          {course.questionCount} questions
                        </span>
                      )}
                      {course.downloadCount !== undefined && (
                        <span className={styles.statItem}>
                          {course.downloadCount} downloads
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(error || errorState) && (
        <div className={styles.errorMessage} role="alert">
          {error || errorState}
        </div>
      )}

      {selectedCourse && (
        <div className={styles.selectedInfo}>
          <small>
            Selected: {selectedCourse.courseCode} - {selectedCourse.courseName}
            {selectedCourse.level && ` (Level ${selectedCourse.level})`}
            {selectedCourse.semester && `, Semester ${selectedCourse.semester}`}
          </small>
        </div>
      )}
    </div>
  )
}

export default CourseDropdown
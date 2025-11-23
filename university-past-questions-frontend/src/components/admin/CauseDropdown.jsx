import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getAllCauses } from '../../api/causesApi'
import LoadingSpinner from '../common/LoadingSpinner'
import styles from './CauseDropdown.module.css'

const CauseDropdown = ({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Select a cause",
  required = false,
  error = "",
  label = "Cause",
  multiple = false,
  showCategories = false
}) => {
  const [causes, setCauses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCause, setSelectedCause] = useState(null)
  const [selectedCauses, setSelectedCauses] = useState([])

  // Fetch causes from database
  const fetchCauses = useCallback(async () => {
    try {
      setLoading(true)
      setErrorState('')
      const response = await getAllCauses()
      const causesData = response.data || response
      
      if (Array.isArray(causesData)) {
        setCauses(causesData)
      } else if (causesData.data && Array.isArray(causesData.data)) {
        setCauses(causesData.data)
      } else {
        throw new Error('Invalid causes data format')
      }
    } catch (err) {
      console.error('Error fetching causes:', err)
      setErrorState('Failed to load causes from database')
      setCauses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCauses()
  }, [fetchCauses])

  // Filter causes based on search term
  const filteredCauses = useMemo(() => {
    if (!searchTerm.trim()) return causes
    
    const searchLower = searchTerm.toLowerCase()
    return causes.filter(cause => 
      cause.name?.toLowerCase().includes(searchLower) ||
      cause.description?.toLowerCase().includes(searchLower) ||
      cause.category?.toLowerCase().includes(searchLower)
    )
  }, [causes, searchTerm])

  // Group causes by category for display
  const groupedCauses = useMemo(() => {
    if (!showCategories) return { 'All Causes': filteredCauses }
    
    const groups = {}
    filteredCauses.forEach(cause => {
      const category = cause.category || 'Uncategorized'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(cause)
    })
    
    // Sort categories and causes within each category
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return groups
  }, [filteredCauses, showCategories])

  // Find selected cause(s)
  useEffect(() => {
    if (multiple) {
      if (value && Array.isArray(value) && causes.length > 0) {
        const selected = causes.filter(c => value.includes(c._id))
        setSelectedCauses(selected)
      } else {
        setSelectedCauses([])
      }
    } else {
      if (value && causes.length > 0) {
        const cause = causes.find(c => c._id === value)
        setSelectedCause(cause || null)
      } else {
        setSelectedCause(null)
      }
    }
  }, [value, causes, multiple])

  // Handle cause selection
  const handleSelect = useCallback((cause) => {
    if (multiple) {
      const isSelected = selectedCauses.find(c => c._id === cause._id)
      if (isSelected) {
        const updated = selectedCauses.filter(c => c._id !== cause._id)
        setSelectedCauses(updated)
        onChange?.(updated.map(c => c._id))
      } else {
        const updated = [...selectedCauses, cause]
        setSelectedCauses(updated)
        onChange?.(updated.map(c => c._id))
      }
    } else {
      setSelectedCause(cause)
      onChange?.(cause ? cause._id : '')
      setIsOpen(false)
      setSearchTerm('')
    }
  }, [onChange, multiple, selectedCauses])

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

    const allCauses = Object.values(groupedCauses).flat()
    const currentIndex = multiple 
      ? selectedCauses.findIndex(cause => cause._id === selectedCause?._id)
      : allCauses.findIndex(cause => cause._id === selectedCause?._id)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (currentIndex < allCauses.length - 1) {
          setSelectedCause(allCauses[currentIndex + 1])
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (currentIndex > 0) {
          setSelectedCause(allCauses[currentIndex - 1])
        }
        break
      case 'Enter':
        e.preventDefault()
        if (selectedCause) {
          handleSelect(selectedCause)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [isOpen, groupedCauses, selectedCause, handleSelect, multiple])

  const removeSelectedCause = useCallback((causeId) => {
    if (multiple) {
      const updated = selectedCauses.filter(c => c._id !== causeId)
      setSelectedCauses(updated)
      onChange?.(updated.map(c => c._id))
    }
  }, [onChange, multiple, selectedCauses])

  if (loading) {
    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{label}</label>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="small" text="Loading causes..." />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formGroup}>
      <label htmlFor="cause-dropdown" className={styles.formLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.dropdownContainer} id="cause-dropdown">
        <button
          type="button"
          className={`${styles.dropdownButton} ${error || errorState ? styles.error : ''}`}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={
            multiple 
              ? selectedCauses.length > 0 
                ? `${selectedCauses.length} causes selected` 
                : placeholder
              : selectedCause 
                ? `${selectedCause.name} - ${selectedCause.category}` 
                : placeholder
          }
        >
          <div className={styles.selectedValue}>
            {multiple ? (
              selectedCauses.length > 0 ? (
                <div className={styles.selectedCausesList}>
                  {selectedCauses.map(cause => (
                    <span 
                      key={cause._id} 
                      className={styles.selectedCause}
                      style={{ backgroundColor: cause.color || '#1fa750' }}
                    >
                      {cause.icon} {cause.name}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSelectedCause(cause._id)
                        }}
                        className={styles.removeButton}
                        aria-label={`Remove ${cause.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className={styles.placeholder}>{placeholder}</span>
              )
            ) : selectedCause ? (
              <div className={styles.selectedCause}>
                <span className={styles.causeIcon}>{selectedCause.icon}</span>
                <div className={styles.causeInfo}>
                  <span className={styles.causeName}>{selectedCause.name}</span>
                  <span className={styles.causeCategory}>{selectedCause.category}</span>
                </div>
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
                placeholder="Search causes..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
            
            <div className={styles.optionsContainer} role="presentation">
              {Object.keys(groupedCauses).length === 0 ? (
                <div className={styles.noResults}>
                  {searchTerm ? 'No causes found' : 'No causes available'}
                </div>
              ) : (
                Object.entries(groupedCauses).map(([category, categoryCauses]) => (
                  <div key={category}>
                    {showCategories && Object.keys(groupedCauses).length > 1 && (
                      <div className={styles.categoryHeader}>
                        {category}
                      </div>
                    )}
                    {categoryCauses.map((cause) => {
                      const isSelected = multiple 
                        ? selectedCauses.find(c => c._id === cause._id)
                        : selectedCause?._id === cause._id
                      
                      return (
                        <div
                          key={cause._id}
                          className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelect(cause)}
                          role="option"
                          aria-selected={!!isSelected}
                          style={{ backgroundColor: cause.color || '#1fa750' }}
                        >
                          <div className={styles.causeInfo}>
                            <span className={styles.causeIcon}>{cause.icon}</span>
                            <div className={styles.causeDetails}>
                              <span className={styles.causeName}>{cause.name}</span>
                              {cause.description && (
                                <span className={styles.causeDescription}>
                                  {cause.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {cause.category && !showCategories && (
                            <span className={styles.causeCategory}>
                              {cause.category}
                            </span>
                          )}
                        </div>
                      )
                    })}
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

      {selectedCause && !multiple && (
        <div className={styles.selectedInfo}>
          <small>
            Selected: {selectedCause.name} ({selectedCause.category})
            {selectedCause.description && ` - ${selectedCause.description}`}
          </small>
        </div>
      )}
    </div>
  )
}

export default CauseDropdown
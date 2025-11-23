import React, { useState, useEffect, useRef } from 'react'
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes, FaCheck } from 'react-icons/fa'
import styles from './Filter.module.css'

const Filter = ({ 
  filters, 
  onFilterChange, 
  className = "",
  initialFilters = {},
  enableMultiSelect = false,
  searchable = false,
  collapsibleGroups = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(initialFilters)
  const [searchTerms, setSearchTerms] = useState({})
  const [expandedGroups, setExpandedGroups] = useState({})
  const panelRef = useRef(null)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update internal state when initialFilters prop changes
  useEffect(() => {
    if (JSON.stringify(activeFilters) !== JSON.stringify(initialFilters)) {
      setActiveFilters(initialFilters)
    }
  }, [initialFilters])

  // Initialize expanded groups
  useEffect(() => {
    if (collapsibleGroups) {
      const initialExpanded = {}
      filters.forEach(filter => {
        initialExpanded[filter.type] = true
      })
      setExpandedGroups(initialExpanded)
    }
  }, [filters, collapsibleGroups])

  const handleFilterChange = (filterType, value) => {
    let newFilters = { ...activeFilters }

    if (enableMultiSelect) {
      if (!newFilters[filterType]) {
        newFilters[filterType] = [value]
      } else if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType]
        }
      } else {
        newFilters[filterType] = [...newFilters[filterType], value]
      }
    } else {
      if (newFilters[filterType] === value) {
        delete newFilters[filterType]
      } else {
        newFilters[filterType] = value
      }
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const removeFilter = (filterType, value = null) => {
    const newFilters = { ...activeFilters }

    if (enableMultiSelect && Array.isArray(newFilters[filterType])) {
      if (value) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType]
        }
      } else {
        delete newFilters[filterType]
      }
    } else {
      delete newFilters[filterType]
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  const getActiveFilterCount = () => {
    if (enableMultiSelect) {
      return Object.values(activeFilters).reduce((total, current) => {
        return total + (Array.isArray(current) ? current.length : 1)
      }, 0)
    }
    return Object.keys(activeFilters).length
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  const isOptionActive = (filterType, value) => {
    if (enableMultiSelect) {
      return activeFilters[filterType] && activeFilters[filterType].includes(value)
    }
    return activeFilters[filterType] === value
  }

  const getFilterDisplayValue = (filterType, value) => {
    const filterGroup = filters.find(f => f.type === filterType)
    if (filterGroup) {
      const option = filterGroup.options.find(opt => opt.value === value)
      return option ? option.label : value
    }
    return value
  }

  const handleSearchChange = (filterType, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [filterType]: value.toLowerCase()
    }))
  }

  const getFilteredOptions = (filterGroup) => {
    const searchTerm = searchTerms[filterGroup.type]
    if (!searchTerm) return filterGroup.options

    return filterGroup.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm)
    )
  }

  const toggleGroup = (filterType) => {
    setExpandedGroups(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }

  return (
    <div className={`${styles.filterContainer} ${className}`} ref={panelRef}>
      {/* Filter Toggle Button */}
      <button 
        className={`${styles.filterToggle} ${hasActiveFilters ? styles.filterToggleBtnPrimary : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaFilter />
        Filters
        {hasActiveFilters && (
          <span className={styles.filterBadge}>
            {getActiveFilterCount()}
          </span>
        )}
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {Object.entries(activeFilters).map(([filterType, value]) => {
            if (enableMultiSelect && Array.isArray(value)) {
              return value.map(singleValue => (
                <span key={`${filterType}-${singleValue}`} className={styles.activeFilterTag}>
                  {getFilterDisplayValue(filterType, singleValue)}
                  <button 
                    onClick={() => removeFilter(filterType, singleValue)}
                    className={styles.removeFilter}
                  >
                    <FaTimes />
                  </button>
                </span>
              ))
            }
            return (
              <span key={filterType} className={styles.activeFilterTag}>
                {getFilterDisplayValue(filterType, value)}
                <button 
                  onClick={() => removeFilter(filterType)}
                  className={styles.removeFilter}
                >
                  <FaTimes />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h3>Filter Results</h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className={styles.clearFiltersBtn}>
                Clear All
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            {filters.map((filterGroup, index) => (
              <div key={filterGroup.type || index} className={styles.filterGroup}>
                <div className={styles.filterGroupHeader}>
                  <label className={styles.filterLabel}>{filterGroup.label}</label>
                  {collapsibleGroups && (
                    <button 
                      className={styles.groupToggle}
                      onClick={() => toggleGroup(filterGroup.type)}
                    >
                      {expandedGroups[filterGroup.type] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  )}
                </div>
                
                {searchable && (
                  <div className={styles.filterSearch}>
                    <input
                      type="text"
                      placeholder={`Search ${filterGroup.label.toLowerCase()}...`}
                      value={searchTerms[filterGroup.type] || ''}
                      onChange={(e) => handleSearchChange(filterGroup.type, e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                )}

                {(collapsibleGroups ? expandedGroups[filterGroup.type] : true) && (
                  <div className={styles.filterOptions}>
                    {getFilteredOptions(filterGroup).map((option, optionIndex) => (
                      <button
                        key={option.value || optionIndex}
                        className={`${styles.filterOption} ${
                          isOptionActive(filterGroup.type, option.value) ? styles.filterOptionActive : ''
                        } ${option.disabled ? 'disabled' : ''}`}
                        onClick={() => !option.disabled && handleFilterChange(filterGroup.type, option.value)}
                        disabled={option.disabled}
                      >
                        <span className="option-content">
                          {option.label}
                          {option.count !== undefined && (
                            <span className={styles.optionCount}>({option.count})</span>
                          )}
                        </span>
                        {isOptionActive(filterGroup.type, option.value) && (
                          <FaCheck className={styles.optionCheck} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.filterActions}>
            <button 
              onClick={() => setIsOpen(false)}
              className={styles.applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filter
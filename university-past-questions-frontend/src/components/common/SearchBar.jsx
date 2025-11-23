import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaTimes, FaHistory, FaBook, FaVideo } from 'react-icons/fa'
import styles from './SearchBar.module.css'

const SearchBar = ({ 
  placeholder = "Search past questions...", 
  onSearch, 
  className = "",
  searchType = "past-questions", // 'past-questions' or 'videos'
  showSuggestions = true,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5)
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Generate search suggestions
  useEffect(() => {
    if (query.length > 2 && showSuggestions) {
      const mockSuggestions = [
        { text: `${query} - Past Questions`, type: 'past-questions', icon: FaBook },
        { text: `${query} - Video Tutorials`, type: 'videos', icon: FaVideo },
        { text: `${query} - Study Guides`, type: 'guides', icon: FaBook },
      ]
      setSuggestions(mockSuggestions)
    } else {
      setSuggestions([])
    }
  }, [query, showSuggestions])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (query.trim()) {
      setLoading(true)
      saveToRecentSearches(query.trim())
      
      try {
        if (onSearch) {
          await onSearch(query, searchType)
        } else {
          navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
        setIsFocused(false)
      }
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    if (onSearch) {
      onSearch('', searchType)
    }
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text.split(' - ')[0])
    setTimeout(() => {
      handleSubmit()
    }, 100)
  }

  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery)
    setTimeout(() => {
      handleSubmit()
    }, 100)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const showSuggestionsPanel = isFocused && (suggestions.length > 0 || recentSearches.length > 0)

  return (
    <div className={`${styles.searchBarContainer} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={`${styles.searchInputWrapper} ${isFocused ? styles.focused : ''} ${loading ? styles.loading : ''}`}>
          <FaSearch className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className={styles.searchInput}
            disabled={loading}
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={styles.clearButton}
              disabled={loading}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
          {loading && (
            <div className="search-loading">
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className={styles.searchButton}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Search Suggestions Panel */}
      {showSuggestionsPanel && (
        <div className={styles.searchSuggestions}>
          <div className="results-preview">
            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length === 0 && (
              <div className="recent-searches">
                <div className={styles.recentHeader}>
                  <span>Recent Searches</span>
                  <button 
                    className={styles.clearRecent}
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((recentQuery, index) => (
                  <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                  >
                    <FaHistory className={styles.suggestionIcon} />
                    <span className={styles.suggestionText}>{recentQuery}</span>
                    <span className={styles.suggestionType}>Recent</span>
                  </div>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <suggestion.icon className={styles.suggestionIcon} />
                <span className={styles.suggestionText}>{suggestion.text}</span>
                <span className={styles.suggestionType}>{suggestion.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
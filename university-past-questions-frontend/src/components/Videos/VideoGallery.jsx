import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlay,
  FaHeart,
  FaHeartO,
  FaShare,
  FaDownload,
  FaEye,
  FaBookmark,
  FaBookmarkO,
  FaFilter,
  FaSearch,
  FaGrid3X3,
  FaList,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  searchVideosEnhanced,
  pinVideo,
  toggleFavorite,
  getPinnedVideos,
  toggleVideoVisibility
} from '../../api/videosApi';
import './videoGallery.css';

const VideoGallery = ({ showFilters = true, initialSearch = '', showBulkActions = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // State management
  const [videos, setVideos] = useState([]);
  const [pinnedVideos, setPinnedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState(new Set());
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    sortBy: 'relevance',
    duration: 'any',
    dateRange: 'any'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  
  // Bulk selection
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // URL parameters initialization
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const sortBy = searchParams.get('sortBy');
    const page = searchParams.get('page');
    
    if (query) setSearchQuery(query);
    if (category) setFilters(prev => ({ ...prev, category }));
    if (difficulty) setFilters(prev => ({ ...prev, difficulty }));
    if (sortBy) setFilters(prev => ({ ...prev, sortBy }));
    if (page) setPagination(prev => ({ ...prev, page: parseInt(page) }));
  }, [searchParams]);
  
  // Search function
  const performSearch = useCallback(async (resetPage = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        query: searchQuery || 'pharmacy education tutorial',
        ...filters,
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit
      };
      
      const response = await searchVideosEnhanced(searchParams);
      
      if (response.success) {
        setVideos(response.data);
        setPagination(response.pagination || pagination);
        
        // Update URL parameters
        const newParams = new URLSearchParams();
        if (searchQuery) newParams.set('q', searchQuery);
        if (filters.category !== 'all') newParams.set('category', filters.category);
        if (filters.difficulty !== 'all') newParams.set('difficulty', filters.difficulty);
        if (filters.sortBy !== 'relevance') newParams.set('sortBy', filters.sortBy);
        if (response.pagination?.page > 1) newParams.set('page', response.pagination.page);
        
        setSearchParams(newParams);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, pagination.page, pagination.limit, searchParams, setSearchParams]);
  
  // Load pinned videos for authenticated users
  useEffect(() => {
    if (user) {
      loadPinnedVideos();
    }
  }, [user]);
  
  // Initial search and search updates
  useEffect(() => {
    performSearch(true);
  }, [performSearch]);
  
  // Load pinned videos
  const loadPinnedVideos = async () => {
    if (!user) return;
    
    try {
      const response = await getPinnedVideos({}, user.token);
      if (response.success) {
        setPinnedVideos(response.data);
      }
    } catch (err) {
      console.error('Failed to load pinned videos:', err);
    }
  };
  
  // Handle video pinning
  const handlePinVideo = async (video) => {
    if (!user) {
      alert('Please log in to pin videos');
      return;
    }
    
    try {
      const videoData = {
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        channelTitle: video.channelTitle,
        thumbnail: video.thumbnail,
        url: video.url,
        category: video.category,
        difficulty: video.difficulty
      };
      
      const response = await pinVideo(videoData, user.token);
      
      if (response.success) {
        setPinnedVideos(prev => [...prev, response.data]);
        
        // Show success message
        alert('Video pinned successfully!');
      }
    } catch (err) {
      alert('Failed to pin video: ' + err.message);
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async (video) => {
    if (!user) {
      alert('Please log in to manage favorites');
      return;
    }
    
    try {
      // Find the pinned video ID first (simplified for demo)
      const pinnedVideo = pinnedVideos.find(p => p.videoId === video.videoId);
      
      if (pinnedVideo) {
        const response = await toggleFavorite(pinnedVideo._id, user.token);
        
        if (response.success) {
          if (response.isFavorited) {
            setFavorites(prev => new Set([...prev, video.videoId]));
          } else {
            setFavorites(prev => {
              const newFavorites = new Set(prev);
              newFavorites.delete(video.videoId);
              return newFavorites;
            });
          }
        }
      }
    } catch (err) {
      alert('Failed to toggle favorite: ' + err.message);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Bulk selection
  const handleVideoSelect = (videoId) => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(videoId)) {
        newSelection.delete(videoId);
      } else {
        newSelection.add(videoId);
      }
      return newSelection;
    });
  };
  
  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.videoId)));
    }
  };
  
  const handleBulkPin = async () => {
    if (selectedVideos.size === 0) return;
    
    const videosToPin = videos.filter(v => selectedVideos.has(v.videoId));
    
    try {
      for (const video of videosToPin) {
        await handlePinVideo(video);
      }
      setSelectedVideos(new Set());
      setShowBulkActions(false);
    } catch (err) {
      alert('Bulk pin failed: ' + err.message);
    }
  };
  
  // Render video card
  const renderVideoCard = (video, index) => {
    const isPinned = pinnedVideos.some(p => p.videoId === video.videoId);
    const isFavorite = favorites.has(video.videoId);
    const isSelected = selectedVideos.has(video.videoId);
    
    return (
      <div key={video.videoId} className={`video-card ${viewMode} ${isSelected ? 'selected' : ''}`}>
        {/* Selection checkbox for bulk actions */}
        {showBulkActions && (
          <div className="video-selection">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleVideoSelect(video.videoId)}
            />
          </div>
        )}
        
        {/* Video thumbnail */}
        <div className="video-thumbnail">
          <img src={video.thumbnail} alt={video.title} loading="lazy" />
          <div className="video-overlay">
            <button className="play-button" onClick={() => window.open(video.url, '_blank')}>
              <FaPlay />
            </button>
          </div>
          {video.duration && (
            <div className="video-duration">{video.duration}</div>
          )}
        </div>
        
        {/* Video info */}
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">{video.channelTitle}</p>
          {video.description && (
            <p className="video-description">{video.description.substring(0, 100)}...</p>
          )}
          
          {/* Video metadata */}
          <div className="video-meta">
            <span className="video-category">{video.category}</span>
            <span className="video-difficulty">{video.difficulty}</span>
            {video.viewCount && (
              <span className="video-views">
                <FaEye /> {video.viewCount}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="video-actions">
            <button
              className={`action-btn ${isPinned ? 'pinned' : ''}`}
              onClick={() => handlePinVideo(video)}
              title={isPinned ? 'Pinned' : 'Pin video'}
            >
              {isPinned ? <FaBookmark /> : <FaBookmarkO />}
            </button>
            
            <button
              className={`action-btn ${isFavorite ? 'favorited' : ''}`}
              onClick={() => handleToggleFavorite(video)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              disabled={!isPinned}
            >
              {isFavorite ? <FaHeart /> : <FaHeartO />}
            </button>
            
            <button
              className="action-btn"
              onClick={() => navigator.share ? navigator.share({
                title: video.title,
                url: video.url
              }) : window.open(video.url, '_blank')}
              title="Share video"
            >
              <FaShare />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render filters
  const renderFilters = () => (
    <div className="video-filters">
      <div className="filter-group">
        <label>Category:</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="medicine">Medicine</option>
          <option value="nursing">Nursing</option>
          <option value="science">Science</option>
          <option value="mathematics">Mathematics</option>
          <option value="engineering">Engineering</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Difficulty:</label>
        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Sort by:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
          <option value="popularity">Popularity</option>
          <option value="duration">Duration</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Duration:</label>
        <select
          value={filters.duration}
          onChange={(e) => handleFilterChange('duration', e.target.value)}
        >
          <option value="any">Any</option>
          <option value="short">Short (< 10 min)</option>
          <option value="medium">Medium (10-30 min)</option>
          <option value="long">Long (> 30 min)</option>
        </select>
      </div>
    </div>
  );
  
  if (error) {
    return (
      <div className="video-gallery error">
        <div className="error-message">
          <FaExclamationTriangle />
          <p>{error}</p>
          <button onClick={() => performSearch(true)}>Try Again</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="video-gallery">
      {/* Header with search and controls */}
      <div className="gallery-header">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search educational videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch(true)}
              className="search-input"
            />
          </div>
          <button
            className="search-btn"
            onClick={() => performSearch(true)}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Search'}
          </button>
        </div>
        
        <div className="gallery-controls">
          {/* View mode toggle */}
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <FaGrid3X3 />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
          
          {/* Bulk actions */}
          {showBulkActions && (
            <div className="bulk-actions">
              <button onClick={handleSelectAll}>
                {selectedVideos.size === videos.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedVideos.size > 0 && (
                <button onClick={handleBulkPin} className="bulk-pin-btn">
                  Pin Selected ({selectedVideos.size})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && renderFilters()}
      
      {/* Results count */}
      <div className="results-info">
        <p>
          {pagination.total} videos found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>
      
      {/* Videos grid/list */}
      <div className={`videos-container ${viewMode}`}>
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner text="Searching videos..." />
          </div>
        ) : videos.length === 0 ? (
          <div className="no-results">
            <p>No videos found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          videos.map(renderVideoCard)
        )}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            <FaChevronLeft />
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="pagination-btn"
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
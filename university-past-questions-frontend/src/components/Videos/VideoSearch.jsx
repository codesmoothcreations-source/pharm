import React, { useState } from 'react';
import { searchVideosEnhanced } from '../../api/videosApi';
import LoadingSpinner from '../common/LoadingSpinner';
import './videoSearch.css';
import { FaSearch, FaPlay, FaClock, FaEye } from 'react-icons/fa';

function VideoSearch() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchVideos = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(false);

    try {
      // Call the enhanced search API
      const response = await searchVideosEnhanced({
        query,
        limit: 12,
        maxResults: 12
      });
      
      // Handle different response formats
      let videoData = [];
      if (response.data && Array.isArray(response.data)) {
        videoData = response.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        videoData = response.data.items;
      } else if (Array.isArray(response)) {
        videoData = response;
      } else if (response.videos && Array.isArray(response.videos)) {
        videoData = response.videos;
      }
      
      if (videoData.length > 0) {
        setVideos(videoData);
        setError('');
      } else {
        setError('No educational videos found for your search query. Try keywords like "pharmacy", "medicine", "nursing", "science", "mathematics", or "engineering".');
        setVideos([]);
      }
    } catch (err) {
      console.error('Video search error:', err);
      setError('Failed to search videos. Please check your connection and try again.');
      setVideos([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  // Format duration from YouTube API
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format view count
  const formatViewCount = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="video-search">
      <div className="search-header">
        <h2>Educational Video Tutorials</h2>
        <p>Search for authentic educational videos related to your courses</p>
      </div>

      <form onSubmit={searchVideos} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for educational videos (e.g., pharmacy, medicine, nursing)..."
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary search-btn"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <LoadingSpinner size="small" text="Searching..." />
            ) : (
              <>
                <FaSearch /> Search
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="search-loading">
          <LoadingSpinner text="Searching educational videos..." />
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => {
              setError('');
              setQuery('');
              setVideos([]);
              setHasSearched(false);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {hasSearched && !loading && videos.length === 0 && !error && (
        <div className="no-results">
          <FaPlay className="no-results-icon" />
          <h3>No videos found</h3>
          <p>Try searching with different keywords or check your spelling.</p>
          <div className="search-suggestions">
            <p>Popular search terms:</p>
            <div className="suggestion-tags">
              <button className="tag" onClick={() => setQuery('pharmacy')}>Pharmacy</button>
              <button className="tag" onClick={() => setQuery('medicine')}>Medicine</button>
              <button className="tag" onClick={() => setQuery('nursing')}>Nursing</button>
              <button className="tag" onClick={() => setQuery('science')}>Science</button>
              <button className="tag" onClick={() => setQuery('mathematics')}>Mathematics</button>
              <button className="tag" onClick={() => setQuery('engineering')}>Engineering</button>
            </div>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h3>Found {videos.length} educational video{videos.length !== 1 ? 's' : ''}</h3>
            <p>Curated content for university learning</p>
          </div>
          <div className="videos-grid">
            {videos.map(video => (
              <div key={video.videoId || video.id} className="video-card">
                <div className="video-thumbnail">
                  <img
                    src={video.thumbnail || video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                    alt={video.title}
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                    }}
                  />
                  <div className="play-overlay">
                    <FaPlay className="play-icon" />
                  </div>
                  {video.duration && (
                    <div className="duration-badge">
                      <FaClock /> {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-channel">Channel: {video.channelTitle || video.channel || 'Educational Provider'}</p>
                  {video.viewCount && (
                    <p className="video-views">
                      <FaEye /> {formatViewCount(video.viewCount)} views
                    </p>
                  )}
                  {video.description && (
                    <p className="video-description">
                      {video.description.length > 80 ? `${video.description.substring(0, 80)}...` : video.description}
                    </p>
                  )}
                  <div className="video-meta">
                    <span className="category-tag">{video.category || 'Education'}</span>
                    <span className="difficulty-tag">{video.difficulty || 'Intermediate'}</span>
                  </div>
                  <a
                    href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline watch-btn"
                  >
                    <FaPlay /> Watch Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoSearch;
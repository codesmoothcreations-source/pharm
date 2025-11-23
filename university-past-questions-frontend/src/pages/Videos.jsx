import React, { useState, useEffect } from "react";
import { FaVideo, FaPlay, FaUser, FaCalendar, FaSearch } from "react-icons/fa";
import { apiClient } from "../api/apiClient";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "./Videos.css";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const searchVideosEnhanced = async ({ query = 'pharmacy education', limit = 12 }) => {
    try {
      // Call the backend video search API
      const params = new URLSearchParams({
        query,
        maxResults: limit.toString()
      });

      const response = await apiClient.get(`/videos/search?${params}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.map(video => ({
            ...video,
            category: video.category || 'education'
          }))
        };
      } else {
        // Return empty result set instead of fake data
        return {
          success: true,
          data: []
        };
      }
    } catch (err) {
      console.error('Video search error:', err);
      // Return empty result set instead of fake data
      return {
        success: true,
        data: []
      };
    }
  };

  const fetchVideos = async (query = 'pharmacy education') => {
    try {
      setLoading(true)
      setError('')
      const response = await searchVideosEnhanced({ 
        query,
        limit: 12
      })
      
      if (response.success && response.data) {
        setVideos(response.data)
      } else {
        setVideos([])
        setError(response.message || 'No videos found')
      }
    } catch (err) {
      setError('Failed to load videos. Please try again.')
      console.error('Video search error:', err)
      setVideos([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchVideos('pharmacy education')
      return
    }
    setSearching(true)
    await fetchVideos(searchQuery)
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="videos-page">
        <div className="container">
          <div className="loading-container">
            <LoadingSpinner text="Loading video tutorials..." />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="videos-page">
        <div className="container">
          <div className="error-state">
            <FaVideo className="error-icon" />
            <h2>Unable to Load Videos</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => fetchVideos()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="videos-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>
                <FaVideo className="header-icon" />
                Educational Video Tutorials
              </h1>
              <p>Learn from expert instructors with our curated educational video content</p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{videos.length}</span>
                <span className="stat-label">Available Videos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for educational videos (e.g., pharmacy, medicine, nursing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" disabled={searching}>
                {searching ? <LoadingSpinner size="small" /> : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Videos Grid */}
        <div className="videos-section">
          {filteredVideos.length === 0 ? (
            <div className="no-results">
              <FaVideo className="no-results-icon" />
              <h3>No Videos Found</h3>
              <p>
                {searchQuery ? 
                  `No videos found for "${searchQuery}". Try searching with different keywords like "pharmacy", "medicine", "nursing", "science", "mathematics", or "engineering".` :
                  'No videos available at the moment. Please check back later.'
                }
              </p>
              {!searchQuery && (
                <div className="search-suggestions">
                  <p>Try searching for:</p>
                  <div className="suggestion-tags">
                    <button 
                      className="tag" 
                      onClick={() => {
                        setSearchQuery('pharmacy')
                        fetchVideos('pharmacy')
                      }}
                    >
                      Pharmacy
                    </button>
                    <button 
                      className="tag" 
                      onClick={() => {
                        setSearchQuery('medicine')
                        fetchVideos('medicine')
                      }}
                    >
                      Medicine
                    </button>
                    <button 
                      className="tag" 
                      onClick={() => {
                        setSearchQuery('nursing')
                        fetchVideos('nursing')
                      }}
                    >
                      Nursing
                    </button>
                    <button 
                      className="tag" 
                      onClick={() => {
                        setSearchQuery('science')
                        fetchVideos('science')
                      }}
                    >
                      Science
                    </button>
                    <button 
                      className="tag" 
                      onClick={() => {
                        setSearchQuery('mathematics')
                        fetchVideos('mathematics')
                      }}
                    >
                      Mathematics
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>
                  {filteredVideos.length === videos.length 
                    ? 'All Educational Videos' 
                    : `Showing ${filteredVideos.length} of ${videos.length} videos`}
                </h2>
                {searchQuery && (
                  <p className="search-query">
                    Results for: "<strong>{searchQuery}</strong>"
                  </p>
                )}
              </div>

              <div className="videos-grid">
                {filteredVideos.map((video, index) => (
                  <div key={video.videoId || index} className="video-card card">
                    <div className="video-thumbnail">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="thumbnail-image"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
                        }}
                      />
                      <div className="video-overlay">
                        <button
                          className="play-button btn btn-primary"
                          onClick={() => {
                            if (video.url && video.url !== '#') {
                              window.open(video.url, '_blank');
                            } else {
                              alert('Video link not available');
                            }
                          }}
                          title="Watch on YouTube"
                        >
                          <FaPlay />
                        </button>
                      </div>
                      <span className="video-duration">{video.duration || 'Watch'}</span>
                    </div>

                    <div className="video-content">
                      <h3 className="video-title" title={video.title}>{video.title}</h3>
                      <p className="video-description">
                        {video.description && video.description.length > 120
                          ? `${video.description.substring(0, 120)}...`
                          : video.description || 'Educational content for university students'
                        }
                      </p>
                      
                      <div className="video-meta">
                        <div className="meta-item">
                          <FaUser className="meta-icon" />
                          <span>{video.channelTitle}</span>
                        </div>
                        <div className="meta-item">
                          <FaCalendar className="meta-icon" />
                          <span>{new Date(video.publishedAt).getFullYear()}</span>
                        </div>
                        {video.viewCount && (
                          <div className="meta-item">
                            <FaUser className="meta-icon" />
                            <span>{video.viewCount.toLocaleString()} views</span>
                          </div>
                        )}
                      </div>

                      <div className="video-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (video.url && video.url !== '#') {
                              window.open(video.url, '_blank');
                            } else {
                              alert('Video link not available');
                            }
                          }}
                        >
                          <FaPlay />
                          Watch Now
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            if (video.url && video.url !== '#') {
                              window.open(video.url, '_blank');
                            } else {
                              alert('Video link not available');
                            }
                          }}
                        >
                          YouTube
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Videos

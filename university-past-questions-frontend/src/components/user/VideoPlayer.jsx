import React, { useState } from 'react'
import { FaPlay, FaYoutube, FaExternalLinkAlt } from 'react-icons/fa'
import './VideoPlayer.css'

const VideoPlayer = ({ video, onVideoSelect }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Map backend fields to component expectations
  const {
    id,
    title,
    description,
    course,
    year,
    semester,
    videoUrl,
    thumbnail,
    duration,
    createdAt
  } = video

  // Extract YouTube video ID if needed
  const getYouTubeId = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
    return match ? match[1] : null
  }

  const handlePlay = () => {
    if (onVideoSelect) {
      onVideoSelect(video)
    } else if (videoUrl) {
      // Fallback: open video URL directly
      window.open(videoUrl, '_blank')
    }
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No description available'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString()
  }

  // Construct YouTube URL from video ID or use provided URL
  const youtubeUrl = videoUrl || (getYouTubeId(videoUrl) ? `https://youtube.com/watch?v=${getYouTubeId(videoUrl)}` : null)

  return (
    <div
      className="video-card card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="video-thumbnail">
        <img 
          src={thumbnail || `/api/placeholder/300/200`} 
          alt={title} 
          className="thumbnail-image" 
        />
        <div className={`video-overlay ${isHovered ? 'hovered' : ''}`}>
          <button className="play-button btn btn-primary" onClick={handlePlay}>
            <FaPlay />
          </button>
        </div>
        {duration && (
          <span className="video-duration">{duration}</span>
        )}
      </div>

      <div className="video-content">
        <h3 className="video-title" title={title}>
          {title || 'Untitled Video'}
        </h3>
        
        <div className="video-meta">
          {course && (
            <span className="meta-item">
              <FaYoutube className="meta-icon" />
              {course}
            </span>
          )}
          {year && (
            <span className="meta-item">Year {year}</span>
          )}
          {semester && (
            <span className="meta-item">Semester {semester}</span>
          )}
        </div>

        <p className="video-description">
          {truncateText(description)}
        </p>

        {createdAt && (
          <p className="video-date">
            Added: {formatDate(createdAt)}
          </p>
        )}

        <div className="video-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={handlePlay}
          >
            <FaPlay />
            Watch
          </button>
          {youtubeUrl && (
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-yellow btn-sm"
            >
              <FaExternalLinkAlt />
              YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
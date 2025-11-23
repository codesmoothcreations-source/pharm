import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaGraduationCap, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaBook, FaVideo, FaUsers } from 'react-icons/fa'
import { getAllQuestions } from '../../api/pastQuestionsApi'
import { apiClient } from '../../api/apiClient'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalVideos: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentQuestions, setRecentQuestions] = useState([])

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      setLoading(true)
      
      // Fetch past questions for stats and recent items
      const questionsResponse = await getAllQuestions()
      const questions = questionsResponse.data || questionsResponse || []
      
      // Fetch videos count (using the correct API endpoint)
      try {
        const videosResponse = await apiClient.get('/videos/search')
        const videos = videosResponse.videos || videosResponse.data || []
        
        setStats({
          totalQuestions: questions.length,
          totalVideos: videos.length,
          totalUsers: 1250 // Placeholder for user count
        })
      } catch (videoError) {
        // Fallback if videos endpoint fails
        setStats({
          totalQuestions: questions.length,
          totalVideos: 45, // Placeholder
          totalUsers: 1250 // Placeholder
        })
      }
      
      // Get recent questions (last 3)
      const recent = questions.slice(0, 3)
      setRecentQuestions(recent)
    } catch (error) {
      console.error('Error fetching footer data:', error)
      // Set default stats if API fails
      setStats({
        totalQuestions: 0,
        totalVideos: 0,
        totalUsers: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const socialLinks = [
    { icon: FaFacebook, url: "https://facebook.com", label: "Facebook" },
    { icon: FaTwitter, url: "https://twitter.com", label: "Twitter" },
    { icon: FaLinkedin, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: FaYoutube, url: "https://youtube.com", label: "YouTube" }
  ]

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/courses", label: "Courses" },
    { path: "/search", label: "Search" },
    { path: "/videos", label: "Video Tutorials" },
    { path: "/admin", label: "Admin Panel" }
  ]

  const resourceLinks = [
    { path: "/past-questions", label: "Past Questions", count: stats.totalQuestions },
    { path: "/videos", label: "Video Tutorials", count: stats.totalVideos },
  ]

  const contactInfo = [
    { type: "email", value: "support@pharmacyuniversity.edu", display: "📧 Pharmssag@university.edu" },
    { type: "phone", value: "+233 123 456 789", display: "📞 +233 55 160 3553" },
    { type: "location", value: "Pharmacy Department, University Campus", display: "📍 Pharmssag, Past Question "}
  ]

  return (
    <footer className="footer animate-fadeIn">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section with Stats */}
          <div className="footer-section">
            <div className="footer-brand">
              <FaGraduationCap className="brand-icon" />
              <div className="brand-text">
                <h3>Pharmssag, Past Question </h3>
                <p>Your trusted platform for academic excellence and success.</p>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="footer-stats">
              <div className="stat-item">
                <FaBook className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{loading ? '...' : stats.totalQuestions}</span>
                  <span className="stat-label">Past Questions</span>
                </div>
              </div>
              <div className="stat-item">
                <FaVideo className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{loading ? '...' : stats.totalVideos}</span>
                  <span className="stat-label">Video Tutorials</span>
                </div>
              </div>
              <div className="stat-item">
                <FaUsers className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-number">{loading ? '...' : stats.totalUsers}</span>
                  <span className="stat-label">Active Users</span>
                </div>
              </div>
            </div>

            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  className="social-link" 
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources with Counts */}
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              {resourceLinks.map((resource, index) => (
                <li key={index}>
                  <Link to={resource.path} className="footer-link">
                    {resource.label}
                    {resource.count !== undefined && (
                      <span className="resource-count">
                        ({loading ? '...' : resource.count})
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Recent Questions */}
            {recentQuestions.length > 0 && (
              <div className="recent-questions">
                <h5>Recently Added</h5>
                <ul className="recent-links">
                  {recentQuestions.map((question, index) => (
                    <li key={index}>
                      <Link 
                        to={`/past-questions/${question._id}`}
                        className="recent-link"
                        title={question.title}
                      >
                        {question.title && question.title.length > 30 
                          ? `${question.title.substring(0, 30)}...` 
                          : question.title || 'Question'
                        }
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-info">
              {contactInfo.map((contact, index) => (
                <p key={index}>
                  {contact.display}
                </p>
              ))}
            </div>
            
            {/* API Status */}
            {/* <div className="api-status">
              <div className={`status-indicator ${loading ? 'loading' : 'online'}`}>
                {loading ? '🔄 Connecting...' : '✅ API Online'}
              </div>
              <small>Backend v1.0.0 | Port: 5001</small>
            </div> */}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} University Past Questions Platform. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
              <Link to="/api-docs">API Docs</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
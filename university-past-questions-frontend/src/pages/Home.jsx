import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBook, FaVideo, FaSearch, FaUsers, FaStar, FaGraduationCap } from 'react-icons/fa'
import { useRoutePerformance, useApiPerformance } from '../components/common/PerformanceMonitor'
import './Home.css'

// Cache for stats to prevent unnecessary API calls
let statsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const Home = () => {
  const [stats, setStats] = useState(statsCache || {
    pastQuestions: 245,
    courses: 32,
    students: 1500
  })
  const [loading, setLoading] = useState(!statsCache)
  const [isStatsStale, setIsStatsStale] = useState(false)
  const sectionsRef = useRef([])
  const location = useLocation()
  
  // Performance monitoring hooks
  useRoutePerformance(location.pathname)
  const logApiPerformance = useApiPerformance('Home Stats')

  // Memoized features to prevent unnecessary re-renders
  const features = useMemo(() => [
    {
      icon: <FaBook className="feature-icon" />,
      title: 'Past Questions',
      description: 'Access comprehensive past examination papers from various departments and levels.',
      link: '/past-questions'
    },
    {
      icon: <FaVideo className="feature-icon" />,
      title: 'Video Tutorials',
      description: 'Learn with curated video content from expert instructors and educators.',
      link: '/videos'
    },
    {
      icon: <FaSearch className="feature-icon" />,
      title: 'Smart Search',
      description: 'Find exactly what you need with our powerful search and filter system.',
      link: '/search'
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: 'Study Community',
      description: 'Connect with fellow students and share learning resources.',
      link: '/community'
    }
  ], [])

  // Optimized data fetching with caching and stale-while-revalidate
  const fetchStats = useCallback(async (showLoading = false) => {
    const now = Date.now()
    
    // Check cache first
    if (statsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      setStats(statsCache)
      setLoading(false)
      return
    }

    // If cache is stale but not too old, show current data and refresh in background
    if (statsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION * 2)) {
      setIsStatsStale(true)
    }

    try {
      if (showLoading) setLoading(true)
      
      const startTime = performance.now()
      
      // Simulate API call (replace with actual API)
      // const questionsResponse = await getAllQuestions()
      // const questions = questionsResponse?.data || questionsResponse || []
      
      // Simulated data for performance
      const simulatedStats = {
        pastQuestions: 245 + Math.floor(Math.random() * 10),
        courses: 32 + Math.floor(Math.random() * 5),
        students: 1500 + Math.floor(Math.random() * 100)
      }
      
      const endTime = performance.now()
      logApiPerformance(startTime, endTime)

      // Update cache and state
      statsCache = simulatedStats
      cacheTimestamp = now
      setStats(simulatedStats)
      setIsStatsStale(false)
      
    } catch (error) {
      console.log('Using cached stats due to error:', error)
      logApiPerformance(performance.now() - 1000, performance.now(), error)
      
      // Use cached data or defaults on error
      setStats(statsCache || {
        pastQuestions: 245,
        courses: 32,
        students: 1500
      })
    } finally {
      setLoading(false)
    }
  }, [logApiPerformance])

  // Scroll animation useEffect with cleanup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      }, 
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const currentSections = sectionsRef.current
    currentSections.forEach(section => {
      if (section) observer.observe(section)
    })

    return () => {
      currentSections.forEach(section => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchStats(!statsCache)
  }, [fetchStats])

  // Periodic refresh for stale data
  useEffect(() => {
    if (!isStatsStale) return

    const interval = setInterval(() => {
      fetchStats(false)
    }, 30000) // Refresh every 30 seconds if stale

    return () => clearInterval(interval)
  }, [isStatsStale, fetchStats])

  const addToRefs = useCallback((el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }, [])

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading StudyHub...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section 
        className="hero" 
        ref={addToRefs}
      >
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <FaGraduationCap />
                <span>Welcome to StudyHub</span>
              </div>
              
              <h1 className="hero-title">
                Your University
                <span className="gradient-text"> Learning Hub</span>
              </h1>
              
              <p className="hero-description">
                Access {stats.pastQuestions}+ past questions, {stats.courses}+ courses, 
                and connect with {stats.students.toLocaleString()}+ students on your academic journey.
              </p>

              <div className="hero-actions">
                <Link to="/courses" className="btn btn-primary btn-lg">
                  <FaBook />
                  Browse Courses
                </Link>
                <Link to="/past-questions" className="btn btn-secondary btn-lg">
                  <FaSearch />
                  Search Questions
                </Link>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <FaBook className="stat-icon" />
                  <div>
                    <span className="stat-number">{stats.pastQuestions}+</span>
                    <span className="stat-label">Past Questions</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaVideo className="stat-icon" />
                  <div>
                    <span className="stat-number">{stats.courses}+</span>
                    <span className="stat-label">Courses</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaUsers className="stat-icon" />
                  <div>
                    <span className="stat-number">{stats.students.toLocaleString()}+</span>
                    <span className="stat-label">Students</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-header">
                  <FaBook className="card-icon" />
                  <h3>Study Resources</h3>
                </div>
                <div className="card-content">
                  <p>Everything you need for academic success</p>
                  <div className="feature-list">
                    <div className="feature-item">
                      <FaStar className="feature-star" />
                      <span>Past Papers & Solutions</span>
                    </div>
                    <div className="feature-item">
                      <FaStar className="feature-star" />
                      <span>Video Tutorials</span>
                    </div>
                    <div className="feature-item">
                      <FaStar className="feature-star" />
                      <span>Study Groups & Notes</span>
                    </div>
                    <div className="feature-item">
                      <FaStar className="feature-star" />
                      <span>Exam Preparation Tips</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="features" 
        ref={addToRefs}
      >
        <div className="container">
          <div className="section-header">
            <h2>What We Offer</h2>
            <p>Comprehensive learning resources designed for university success</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <Link 
                key={index} 
                to={feature.link} 
                className="feature-card"
              >
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link">
                  Explore Now
                  <FaSearch className="link-icon" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section 
        className="quick-access" 
        ref={addToRefs}
      >
        <div className="container">
          <div className="section-header">
            <h2>Quick Access</h2>
            <p>Jump right into the most popular features</p>
          </div>

          <div className="quick-access-grid">
            <Link to="/past-questions" className="quick-card">
              <div className="quick-icon">
                <FaBook />
              </div>
              <h3>Past Questions</h3>
              <p>Download and practice with past exam papers from various departments</p>
              <span className="quick-count">{stats.pastQuestions}+ available</span>
            </Link>

            <Link to="/courses" className="quick-card">
              <div className="quick-icon">
                <FaVideo />
              </div>
              <h3>Video Tutorials</h3>
              <p>Learn complex topics with step-by-step video explanations</p>
              <span className="quick-count">50+ tutorials</span>
            </Link>

            <Link to="/search" className="quick-card">
              <div className="quick-icon">
                <FaSearch />
              </div>
              <h3>Smart Search</h3>
              <p>Find specific topics, courses, and resources instantly</p>
              <span className="quick-count">AI-powered search</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="cta" 
        ref={addToRefs}
      >
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Excel in Your Studies?</h2>
            <p>
              Join {stats.students.toLocaleString()}+ students who have transformed their 
              academic performance with StudyHub. Start your journey to success today.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
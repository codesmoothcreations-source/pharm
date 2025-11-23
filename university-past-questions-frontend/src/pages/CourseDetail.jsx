import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FaBook, 
  FaArrowLeft, 
  FaCalendar, 
  FaDownload, 
  FaEye, 
  FaLayerGroup,
  FaClock,
  FaGraduationCap,
  FaStar,
  FaFilter
} from 'react-icons/fa'
import { apiClient } from '../api/apiClient'
import { useToast } from '../components/common/Toast'
import './CourseDetail.css'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [groupedQuestions, setGroupedQuestions] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { addToast, ToastContainer } = useToast()

  // Enhanced curated video course data
  const curatedVideoCourses = {
    'PHAR101': [
      {
        id: '1',
        title: 'African Studies Foundation - Introduction to African Philosophy',
        duration: '45 min',
        views: '12.5k',
        rating: 4.8,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Comprehensive introduction to African philosophical thought and its impact on modern education.',
        difficulty: 'Beginner',
        instructor: 'Prof. Kwame Asante'
      },
      {
        id: '2',
        title: 'African Cultural Heritage and Identity',
        duration: '38 min',
        views: '8.9k',
        rating: 4.9,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Exploring the rich cultural heritage of Africa and its influence on contemporary society.',
        difficulty: 'Intermediate',
        instructor: 'Dr. Amara Okonkwo'
      }
    ],
    'PHAR102': [
      {
        id: '3',
        title: 'Computer Fundamentals for Healthcare Professionals',
        duration: '52 min',
        views: '15.2k',
        rating: 4.7,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Essential computer skills and digital literacy for healthcare and pharmacy professionals.',
        difficulty: 'Beginner',
        instructor: 'Dr. Sarah Chen'
      },
      {
        id: '4',
        title: 'Healthcare Information Systems and EHR',
        duration: '41 min',
        views: '9.7k',
        rating: 4.6,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Understanding Electronic Health Records and healthcare information management systems.',
        difficulty: 'Intermediate',
        instructor: 'Prof. Michael Roberts'
      }
    ],
    'PHAR201': [
      {
        id: '5',
        title: 'Pharmaceutical Microbiology - Introduction to Bacteria',
        duration: '47 min',
        views: '18.3k',
        rating: 4.9,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Fundamental principles of bacterial structure, function, and pathogenicity in pharmaceutical applications.',
        difficulty: 'Intermediate',
        instructor: 'Dr. Lisa Thompson'
      },
      {
        id: '6',
        title: 'Antibiotics and Antimicrobial Resistance',
        duration: '43 min',
        views: '21.1k',
        rating: 4.8,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        description: 'Understanding antimicrobial mechanisms, resistance patterns, and proper antibiotic usage.',
        difficulty: 'Advanced',
        instructor: 'Prof. David Kim'
      }
    ]
  }

  const topRatedVideos = [
    {
      id: 'curated1',
      title: 'Top 10: Pharmaceutical Calculations Made Easy',
      duration: '35 min',
      views: '47.8k',
      rating: 4.9,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      description: 'Essential pharmaceutical calculations that every pharmacy student must master.',
      difficulty: 'Intermediate',
      instructor: 'Dr. Jennifer Walsh'
    },
    {
      id: 'curated2',
      title: 'Clinical Pharmacology: Drug Interactions',
      duration: '42 min',
      views: '38.4k',
      rating: 4.8,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      description: 'Understanding complex drug interactions and their clinical implications.',
      difficulty: 'Advanced',
      instructor: 'Prof. Robert Martinez'
    },
    {
      id: 'curated3',
      title: 'Dispensing Techniques: Best Practices',
      duration: '39 min',
      views: '29.7k',
      rating: 4.7,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      description: 'Professional dispensing practices and patient counseling techniques.',
      difficulty: 'Intermediate',
      instructor: 'Pharm. Maria Rodriguez'
    },
    {
      id: 'curated4',
      title: 'Pharmacy Ethics and Professional Practice',
      duration: '33 min',
      views: '25.9k',
      rating: 4.6,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      description: 'Understanding professional ethics and responsibilities in pharmacy practice.',
      difficulty: 'Beginner',
      instructor: 'Dr. Ahmed Hassan'
    }
  ]

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        
        // Fetch course details
        const courseResponse = await apiClient.get(`/courses/${id}`)
        if (courseResponse.success) {
          setCourse(courseResponse.data)
        }

        // Fetch all past questions for this course
        const questionsResponse = await apiClient.get(`/past-questions?courseId=${id}`)
        if (questionsResponse.success) {
          const questionsData = questionsResponse.data || []
          setQuestions(questionsData)
          
          // Group questions by academic year and semester
          const grouped = {}
          questionsData.forEach(question => {
            const year = question.academicYear
            const semester = question.semester
            
            if (!grouped[year]) {
              grouped[year] = {}
            }
            if (!grouped[year][semester]) {
              grouped[year][semester] = []
            }
            grouped[year][semester].push(question)
          })
          
          setGroupedQuestions(grouped)
        }

      } catch (err) {
        console.error('Error fetching course data:', err)
        addToast('Failed to load course information', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourseData()
    }
  }, [id])

  const getFilteredQuestions = () => {
    let filtered = questions

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(q => q.academicYear === selectedYear)
    }

    // Filter by semester
    if (selectedSemester) {
      filtered = filtered.filter(q => q.semester === selectedSemester)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(q => 
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'downloads':
          return (b.downloadCount || 0) - (a.downloadCount || 0)
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0)
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return filtered
  }

  const handleDownload = (question) => {
    if (question.fileUrl) {
      const link = document.createElement('a')
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'
      const cleanFileUrl = question.fileUrl.replace(/^\/*/, '').replace(/\\/g, '/')
      link.href = `${baseUrl}/${cleanFileUrl}`
      link.download = `${question.title || 'past_question'}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      addToast(`Downloaded "${question.title}" successfully!`, 'success')
    }
  }
  const handleView = (question) => {
    window.location.href = `/preview/${question._id || question.id}`
  }

  const getAvailableYears = () => {
    const years = new Set()
    questions.forEach(q => {
      if (q.academicYear) years.add(q.academicYear)
    })
    return Array.from(years).sort().reverse()
  }

  const getAvailableSemesters = () => {
    const semesters = new Set()
    questions.forEach(q => {
      if (q.semester) semesters.add(q.semester)
    })
    return Array.from(semesters).sort()
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading course details...</p>
          </div>
        </div>
        <ToastContainer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Course not found</h2>
            <p>The requested course could not be found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/courses')}>
              <FaArrowLeft /> Back to Courses
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    )
  }

  return (
    <div className="course-detail-page">
      <div className="container">
        {/* Back Navigation */}
        <div className="breadcrumb">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/courses')}>
            <FaArrowLeft /> Back to Courses
          </button>
        </div>

        {/* Course Header */}
        <div className="course-header">
          <div className="course-info">
            <div className="course-code">{course.courseCode}</div>
            <h1>{course.courseName}</h1>
            <div className="course-meta">
              <div className="meta-item">
                <FaGraduationCap />
                Level {course.level}
              </div>
              <div className="meta-item">
                <FaClock />
                Semester {course.semester}
              </div>
              <div className="meta-item">
                <FaCalendar />
                {course.credits} Credits
              </div>
            </div>
          </div>
          
          <div className="course-stats">
            <div className="stat-card">
              <div className="stat-number">{questions.length}</div>
              <div className="stat-label">Past Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{getAvailableYears().length}</div>
              <div className="stat-label">Academic Years</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {curatedVideoCourses[course.courseCode]?.length || 0}
              </div>
              <div className="stat-label">Video Tutorials</div>
            </div>
          </div>
        </div>

        {/* Top Videos Section */}
        {curatedVideoCourses[course.courseCode] && (
          <div className="section">
            <div className="section-header">
              <h2>
                <FaBook />
                Recommended Videos for {course.courseCode}
              </h2>
              <p>Expert-curated video content to enhance your understanding</p>
            </div>
            <div className="videos-grid">
              {curatedVideoCourses[course.courseCode].map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="video-overlay">
                      <FaEye className="play-icon" />
                    </div>
                    <div className="video-duration">{video.duration}</div>
                  </div>
                  <div className="video-content">
                    <h4>{video.title}</h4>
                    <p>{video.description}</p>
                    <div className="video-meta">
                      <span className="instructor">{video.instructor}</span>
                      <div className="rating">
                        <FaStar className="star-filled" />
                        <span>{video.rating}</span>
                        <span className="views">{video.views} views</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Questions Section */}
        <div className="section">
          <div className="section-header">
            <h2>
              <FaLayerGroup />
              Past Questions Organized by Academic Year
            </h2>
            <p>Browse past examination questions organized by year and semester</p>
          </div>

          {/* Filters */}
          <div className="questions-filters">
            <div className="filter-group">
              <label>Academic Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">All Years</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Semester</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                <option value="">All Semesters</option>
                {getAvailableSemesters().map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Questions Display */}
          {Object.keys(groupedQuestions).length === 0 ? (
            <div className="no-questions">
              <FaBook className="icon" />
              <h3>No Past Questions Available</h3>
              <p>Past questions for this course will be uploaded soon. Check back later!</p>
            </div>
          ) : (
            <div className="questions-by-year">
              {Object.entries(groupedQuestions).map(([year, semesters]) => (
                <div key={year} className="year-section">
                  <h3 className="year-header">
                    <FaCalendar />
                    Academic Year {year}
                  </h3>
                  
                  {Object.entries(semesters).map(([semester, questions]) => (
                    <div key={`${year}-${semester}`} className="semester-section">
                      <h4 className="semester-header">
                        <FaGraduationCap />
                        Semester {semester} ({questions.length} questions)
                      </h4>
                      
                      <div className="questions-grid">
                        {questions.map(question => (
                          <div key={question._id} className="question-card">
                            <div className="question-header">
                              <h5>{question.title}</h5>
                              {question.description && (
                                <p className="question-description">{question.description}</p>
                              )}
                            </div>
                            
                            <div className="question-meta">
                              <span className="meta-item">
                                <FaDownload /> {question.downloadCount || 0} downloads
                              </span>
                              <span className="meta-item">
                                <FaEye /> {question.viewCount || 0} views
                              </span>
                              {question.fileSize && (
                                <span className="meta-item">
                                  {formatFileSize(question.fileSize)}
                                </span>
                              )}
                            </div>
                            
                            <div className="question-actions">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleView(question)}
                              >
                                <FaEye /> View
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleDownload(question)}
                              >
                                <FaDownload /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Top 10 Videos */}
        <div className="section">
          <div className="section-header">
            <h2>
              <FaStar />
              Top 10 Best Video Tutorials
            </h2>
            <p>Most popular and highly-rated video content across all courses</p>
          </div>
          
          <div className="top-videos-grid">
            {topRatedVideos.map((video, index) => (
              <div key={video.id} className="top-video-card">
                <div className="rank-badge">{index + 1}</div>
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-overlay">
                    <FaEye className="play-icon" />
                  </div>
                  <div className="video-duration">{video.duration}</div>
                </div>
                <div className="video-content">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  <div className="video-meta">
                    <span className="instructor">{video.instructor}</span>
                    <div className="rating">
                      <FaStar className="star-filled" />
                      <span>{video.rating}</span>
                      <span className="views">{video.views} views</span>
                    </div>
                    <span className="difficulty">{video.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default CourseDetail
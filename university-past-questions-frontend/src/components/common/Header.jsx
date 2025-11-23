import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaGraduationCap, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa'
import styles from './Header.module.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/')
    }
  }

  const isActiveRoute = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/past-questions', label: 'Past Questions' },
    { path: '/videos', label: 'Videos' }
  ]

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img
              src="/src/assets/logo.jpeg"
              alt="University Past Questions"
              className={styles.logoImage}
              onError={(e) => {
                // Fallback to icon if logo doesn't exist
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <FaGraduationCap className={styles.logoFallback} style={{ display: 'none' }} />
            <div className={styles.logoText}>
              <span className={styles.logoPrimary}>Pharmssag</span>
              <span className={styles.logoSecondary}>Past Question</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${isActiveRoute(link.path) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`${styles.navLink} ${isActiveRoute('/admin') ? styles.active : ''}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className={styles.headerActions}>
            {/* <button
              className={styles.searchBtn}
              onClick={() => navigate('/search')}
              aria-label="Search"
            >
              <FaSearch />
            </button> */}

            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <button className={styles.userButton}>
                  <FaUser className="user-icon" />
                  <span className="user-name">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                </button>
                <div className={styles.userDropdown}>
                  <Link to="/profile" className={styles.dropdownItem}>Profile</Link>
                  {isAdmin && <Link to="/admin" className={styles.dropdownItem}>Admin Panel</Link>}
                  <button onClick={handleLogout} className={styles.dropdownItem}>Sign Out</button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={`${styles.btn} ${styles.btnOutline}`}>Sign In</Link>
                <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Join Now</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={styles.mobileMenuToggle}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.mobileNavLink} ${isActiveRoute(link.path) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`${styles.mobileNavLink} ${isActiveRoute('/admin') ? styles.active : ''}`}
              >
                Admin Panel
              </Link>
            )}
            {isAuthenticated ? (
              <div className={styles.mobileAuth}>
                <div className={styles.mobileUserInfo}>
                  <FaUser className={styles.mobileUserIcon} />
                  <span className={styles.mobileUserName}>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Link to="/profile" className={`${styles.btn} ${styles.btnOutline}`}>Profile</Link>
                {isAdmin && <Link to="/admin" className={`${styles.btn} ${styles.btnOutline}`}>Admin Panel</Link>}
                <button onClick={handleLogout} className={`${styles.btn} ${styles.btnPrimary} ${styles.logoutButton}`}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuth}>
                <Link to="/login" className={`${styles.btn} ${styles.btnOutline}`}>Sign In</Link>
                <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Join Now</Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
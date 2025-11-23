import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'
import './App.css'

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'))
const Courses = React.lazy(() => import('./pages/Courses'))
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'))
const PastQuestions = React.lazy(() => import('./pages/PastQuestions'))
const Preview = React.lazy(() => import('./pages/Preview'))
const Videos = React.lazy(() => import('./pages/Videos'))
const Search = React.lazy(() => import('./pages/Search'))
const Admin = React.lazy(() => import('./pages/Admin'))
const Login = React.lazy(() => import('./components/auth/Login'))
const Register = React.lazy(() => import('./components/auth/Register'))
const Profile = React.lazy(() => import('./pages/Profile'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="loading-container">
    <LoadingSpinner text="Loading..." fullScreen />
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <br />
          <br />
          <main className="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/past-questions" element={<PastQuestions />} />
                <Route path="/preview/:id" element={<Preview />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes - Regular Users */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Admin Only */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
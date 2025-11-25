import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/common/GlobalToast'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'
import PerformanceMonitor from './components/common/PerformanceMonitor'
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
    <PerformanceMonitor>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
            <Header />
            <br />
            <br />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Public Routes - Only Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes - ALL application features require authentication */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <Courses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:id"
                  element={
                    <ProtectedRoute>
                      <CourseDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/past-questions"
                  element={
                    <ProtectedRoute>
                      <PastQuestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/preview/:id"
                  element={
                    <ProtectedRoute>
                      <Preview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/videos"
                  element={
                    <ProtectedRoute>
                      <Videos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
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
  </ToastProvider>
</PerformanceMonitor>
  )
}

export default App
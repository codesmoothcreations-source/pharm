import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const authService = {
  login: async (credentials) => {
    console.log('authService.login called with:', { email: credentials.email, password: '***' })
    console.log('API_URL:', API_URL)
    console.log('Full login URL:', `${API_URL}/auth/login`)
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      console.log('authService.login response:', response)
      console.log('authService.login response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('authService.login error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  register: async (userData) => {
    console.log('authService.register called with:', { ...userData, password: '***' })
    console.log('API_URL:', API_URL)
    console.log('Full register URL:', `${API_URL}/auth/register`)
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      console.log('authService.register response:', response)
      console.log('authService.register response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('authService.register error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  getProfile: async () => {
    console.log('authService.getProfile called')
    console.log('API_URL:', API_URL)
    console.log('Full profile URL:', `${API_URL}/auth/me`)
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      console.log('authService.getProfile response:', response)
      console.log('authService.getProfile response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('authService.getProfile error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  // Optional: Add if your backend supports it
  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`)
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/auth/profile`, userData)
    return response.data
  }
}

export default authService
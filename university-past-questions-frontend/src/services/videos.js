import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const videosService = {
  search: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/videos/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Video search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search videos');
    }
  }
};

export default videosService;
import { apiClient } from "./apiClient";

// Enhanced video search with comprehensive filtering
export const searchVideosEnhanced = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('query', params.query);
  if (params.courseCode) queryParams.append('courseCode', params.courseCode);
  if (params.category) queryParams.append('category', params.category);
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.duration) queryParams.append('duration', params.duration);
  if (params.dateRange) queryParams.append('dateRange', params.dateRange);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.maxResults) queryParams.append('maxResults', params.maxResults);

  const url = `/videos/search/enhanced?${queryParams.toString()}`;
  return apiClient.get(url);
};

// Pin a video
export const pinVideo = async (videoData, token) => {
  return apiClient.post('/videos/pin', videoData, token);
};

// Get user's pinned videos
export const getPinnedVideos = async (params = {}, token) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);

  const url = `/videos/pinned?${queryParams.toString()}`;
  return apiClient.get(url, token);
};

// Toggle video visibility
export const toggleVideoVisibility = async (videoId, token) => {
  return apiClient.put(`/videos/${videoId}/toggle-visibility`, {}, token);
};

// Toggle favorite status
export const toggleFavorite = async (videoId, token) => {
  return apiClient.post(`/videos/${videoId}/favorite`, {}, token);
};

// Get popular videos
export const getPopularVideos = async (limit = 12) => {
  return apiClient.get(`/videos/popular?limit=${limit}`);
};

// Get user video preferences
export const getVideoPreferences = async (token) => {
  return apiClient.get('/videos/preferences', token);
};

// Update user video preferences
export const updateVideoPreferences = async (preferences, token) => {
  return apiClient.put('/videos/preferences', preferences, token);
};

// Bulk pin/unpin videos
export const bulkPinVideos = async (videos, action, token) => {
  return apiClient.post('/videos/bulk-pin', { videos, action }, token);
};

// Health check
export const checkVideoAPIHealth = async (token) => {
  return apiClient.get('/videos/health', token);
};

// Legacy exports for backward compatibility
export const searchVideos = async (params) => {
  return searchVideosEnhanced(params);
};

export const getVideoById = async (id) => {
  return apiClient.get(`/videos/${id}`);
};

export const addVideoToPastQuestion = async (pastQuestionId, videoData, token) => {
  return apiClient.post(`/videos/past-question/${pastQuestionId}`, videoData, token);
};
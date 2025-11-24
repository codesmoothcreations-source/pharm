import apiClient from './apiClient';

/**
 * Image API Service
 * Handles all image-related API calls with authentication
 */

/**
 * Upload a new image
 * @param {FormData} formData - Form data containing image file and metadata
 * @returns {Promise} Response with uploaded image data
 */
export const uploadImage = async (formData) => {
    try {
        const response = await apiClient.post('/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Upload image error:', error);
        throw error;
    }
};

/**
 * Get all images with optional filters
 * @param {Object} params - Query parameters (myImages, tags, search, page, limit)
 * @returns {Promise} Response with images array
 */
export const getImages = async (params = {}) => {
    try {
        const response = await apiClient.get('/images', { params });
        return response.data;
    } catch (error) {
        console.error('Get images error:', error);
        throw error;
    }
};

/**
 * Get single image by ID
 * @param {string} id - Image ID
 * @returns {Promise} Response with image data
 */
export const getImage = async (id) => {
    try {
        const response = await apiClient.get(`/images/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get image error:', error);
        throw error;
    }
};

/**
 * Update image metadata
 * @param {string} id - Image ID
 * @param {Object} data - Updated image data (title, description, tags, isPublic)
 * @returns {Promise} Response with updated image data
 */
export const updateImage = async (id, data) => {
    try {
        const response = await apiClient.put(`/images/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update image error:', error);
        throw error;
    }
};

/**
 * Delete image
 * @param {string} id - Image ID
 * @returns {Promise} Response confirming deletion
 */
export const deleteImage = async (id) => {
    try {
        const response = await apiClient.delete(`/images/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete image error:', error);
        throw error;
    }
};

/**
 * Get user's image statistics
 * @returns {Promise} Response with image statistics
 */
export const getMyImageStats = async () => {
    try {
        const response = await apiClient.get('/images/stats/me');
        return response.data;
    } catch (error) {
        console.error('Get image stats error:', error);
        throw error;
    }
};

export default {
    uploadImage,
    getImages,
    getImage,
    updateImage,
    deleteImage,
    getMyImageStats
};

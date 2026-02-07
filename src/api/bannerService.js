import { instance } from './axios.config.js';

const BANNER_API = '/banners';

export const bannerService = {
    getAll: async (params = {}) => {
        try {
            const response = await instance.get(BANNER_API, { params });

            // Handle different response formats and ensure we always return an array
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else if (response.data?.banners && Array.isArray(response.data.banners)) {
                return response.data.banners;
            } else {
                console.warn('Unexpected response format, using empty array:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getById: async (id) => {
        try {
            const response = await instance.get(`${BANNER_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    create: async (data) => {
        try {
            // If there's an image file, use FormData
            if (data.image && data.image instanceof File) {
                const formData = new FormData();

                // Append all form fields
                Object.keys(data).forEach(key => {
                    if (key === 'image') {
                        formData.append('image', data.image);
                    } else if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                });

                const response = await instance.post(BANNER_API, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                // Regular JSON data for URL-based images
                const response = await instance.post(BANNER_API, data);
                return response.data;
            }
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create banner';
            throw new Error(errorMessage);
        }
    },

    update: async (id, data) => {
        try {
            const response = await instance.put(`${BANNER_API}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    toggleStatus: async (id) => {
        try {
            const response = await instance.put(`${BANNER_API}/${id}/status`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getByPlacement: async (placement, targetAudience = 'All Users') => {
        try {
            const response = await instance.get(`${BANNER_API}/placement/${placement}`, {
                params: { targetAudience }
            });
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    recordImpression: async (id) => {
        try {
            const response = await instance.post(`${BANNER_API}/${id}/impression`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    recordClick: async (id) => {
        try {
            const response = await instance.post(`${BANNER_API}/${id}/click`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getStats: async () => {
        try {
            const response = await instance.get(`${BANNER_API}/stats`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    duplicate: async (id) => {
        try {
            const response = await instance.post(`${BANNER_API}/${id}/duplicate`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    delete: async (id) => {
        try {
            const response = await instance.delete(`${BANNER_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Banner service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    }
};

export default bannerService;

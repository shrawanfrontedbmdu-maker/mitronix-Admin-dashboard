import { instance } from './axios.config.js';

const ROLE_API = '/roles';

export const roleService = {
    getAll: async (params = {}) => {
        try {
            const response = await instance.get(ROLE_API, { params });
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getById: async (id) => {
        try {
            const response = await instance.get(`${ROLE_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    create: async (data) => {
        try {
            const response = await instance.post(ROLE_API, data);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    update: async (id, data) => {
        try {
            const response = await instance.put(`${ROLE_API}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    toggleStatus: async (id) => {
        try {
            const response = await instance.put(`${ROLE_API}/${id}/status`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    addPermission: async (id, module, action) => {
        try {
            const response = await instance.post(`${ROLE_API}/${id}/permissions`, { module, action });
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    removePermission: async (id, module, action) => {
        try {
            const response = await instance.delete(`${ROLE_API}/${id}/permissions`, {
                data: { module, action }
            });
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getStats: async () => {
        try {
            const response = await instance.get(`${ROLE_API}/stats`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getPermissionOptions: async () => {
        try {
            const response = await instance.get(`${ROLE_API}/permissions`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    duplicate: async (id) => {
        try {
            const response = await instance.post(`${ROLE_API}/${id}/duplicate`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    delete: async (id) => {
        try {
            const response = await instance.delete(`${ROLE_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Role service error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    }
};

export default roleService;

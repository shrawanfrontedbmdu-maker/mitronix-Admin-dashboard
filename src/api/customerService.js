import { instance } from './axios.config.js';

export const customerService = {
    getAllCustomers: async () => {
        try {
            const response = await instance.get('/customer');

            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else {
                console.warn('Unexpected response format, returning empty array:', response.data);
                return [];
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    getCustomerById: async (id) => {
        try {
            const response = await instance.get(`/customer/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    createCustomer: async (data) => {
        try {
            const response = await instance.post('/customer', data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    updateCustomer: async (id, data) => {
        try {
            const response = await instance.put(`/customer/${id}`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    },

    deleteCustomer: async (id) => {
        try {
            const response = await instance.delete(`/customer/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            throw new Error(errorMessage);
        }
    }
};

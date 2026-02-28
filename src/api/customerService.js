import { instance } from './axios.config.js';

export const customerService = {

    // ─────────────────────────────────────────────
    // GET all customers (with optional pagination)
    // GET /customer?page=1&limit=20
    // ─────────────────────────────────────────────
    getAllCustomers: async (page = 1, limit = 20) => {
        try {
            const response = await instance.get('/customer', {
                params: { page, limit }
            });

            if (response.data?.data && Array.isArray(response.data.data)) {
                return response.data; // { success, total, page, totalPages, count, data }
            } else if (Array.isArray(response.data)) {
                return { data: response.data };
            } else {
                console.warn('Unexpected response format:', response.data);
                return { data: [] };
            }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // GET single customer by ID
    // GET /customer/:id
    // ─────────────────────────────────────────────
    getCustomerById: async (id) => {
        try {
            const response = await instance.get(`/customer/${id}`);
            return response.data; // { success, data }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // POST register new customer (with optional image)
    // POST /customer/register
    // ─────────────────────────────────────────────
    createCustomer: async (data) => {
        try {
            // data can be FormData (if image included) or plain object
            const isFormData = data instanceof FormData;
            const response = await instance.post('/customer/register', data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
            });
            return response.data; // { success, message, data }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // POST login customer
    // POST /customer/login
    // ─────────────────────────────────────────────
    loginCustomer: async ({ email, password }) => {
        try {
            const response = await instance.post('/customer/login', { email, password });
            return response.data; // { success, message, data }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // PUT update customer (with optional image)
    // PUT /customer/:id
    // ─────────────────────────────────────────────
    updateCustomer: async (id, data) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await instance.put(`/customer/${id}`, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
            });
            return response.data; // { success, message, data }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // DELETE soft delete customer
    // DELETE /customer/:id
    // ─────────────────────────────────────────────
    deleteCustomer: async (id) => {
        try {
            const response = await instance.delete(`/customer/${id}`);
            return response.data; // { success, message }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // PATCH toggle customer status (active <-> blocked)
    // PATCH /customer/:id/toggle-status
    // ─────────────────────────────────────────────
    toggleCustomerStatus: async (id) => {
        try {
            const response = await instance.patch(`/customer/${id}/toggle-status`);
            return response.data; // { success, message, data: { _id, status } }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // PATCH add reward points
    // PATCH /customer/:id/reward/add
    // ─────────────────────────────────────────────
    addRewardPoints: async (id, { points, remark = '', expiryDate = null }) => {
        try {
            const response = await instance.patch(`/customer/${id}/reward/add`, {
                points,
                remark,
                expiryDate,
            });
            return response.data; // { success, message, totalPoints, history }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },

    // ─────────────────────────────────────────────
    // PATCH deduct reward points
    // PATCH /customer/:id/reward/deduct
    // ─────────────────────────────────────────────
    deductRewardPoints: async (id, { points, remark = '' }) => {
        try {
            const response = await instance.patch(`/customer/${id}/reward/deduct`, {
                points,
                remark,
            });
            return response.data; // { success, message, totalPoints, history }
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'An error occurred');
        }
    },
};
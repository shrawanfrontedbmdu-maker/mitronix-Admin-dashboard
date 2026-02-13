import { instance } from './axios.config.js';

export const couponsService = {
  getAllCoupons: async () => {
    try {
      const response = await instance.get('/coupons');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  createCoupon: async (couponData) => {
    try {
      const response = await instance.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateCoupon: async (id, couponData) => {
    try {
      const response = await instance.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const response = await instance.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getCouponById: async (id) => {
    try {
      const response = await instance.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  toggleCouponStatus: async (id) => {
    try {
      const response = await instance.patch(`/coupons/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  getOrderbyCoupon: async (code) => {
    try {
      const response = await instance.get(`/coupons/${code}/order`)
      return response.data
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default couponsService;

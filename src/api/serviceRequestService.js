import { instance } from './axios.config.js'

const serviceRequestService = {


  // params: { page, limit, status, type, priority }
  getAll: async (params = {}) => {
    try {
      const response = await instance.get('/service-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error while fetching service requests:', error);
      throw error;
    }
  },

  // GET BY ID
  getById: async (id) => {
    try {
      const response = await instance.get(`/service-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error while fetching service request by ID:', error);
      throw error;
    }
  },

  // GET LOGGED-IN USER'S REQUESTS
  // params: { page, limit }
  getMyRequests: async (params = {}) => {
    try {
      const response = await instance.get('/service-requests/user/my-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error while fetching user service requests:', error);
      throw error;
    }
  },

  // FILTER BY status / type / priority (any combination)
  // params: { status, type, priority, page, limit }
  filter: async (params = {}) => {
    try {
      const response = await instance.get('/service-requests/filter', { params });
      return response.data;
    } catch (error) {
      console.error('Error while filtering service requests:', error);
      throw error;
    }
  },

  // CREATE
  // data: { productname, description, type, paymentdetails, phone, address, ... }
  create: async (data) => {
    try {
      const response = await instance.post('/service-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error while creating service request:', error);
      throw error;
    }
  },

  // data: any subset of service request fields
  update: async (id, data) => {
    try {
      const response = await instance.put(`/service-requests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error while updating service request:', error);
      throw error;
    }
  },


  // status: "open" | "in progress" | "completed" | "cancelled"
  updateStatus: async (id, status) => {
    try {
      const response = await instance.put(`/service-requests/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error while updating service request status:', error);
      throw error;
    }
  },

  
  // assignedTo: User ObjectId string
  assign: async (id, assignedTo) => {
    try {
      const response = await instance.put(`/service-requests/${id}`, { assignedTo });
      return response.data;
    } catch (error) {
      console.error('Error while assigning service request:', error);
      throw error;
    }
  },

  // ADD ADMIN REMARK — convenience wrapper
  addRemark: async (id, adminRemarks) => {
    try {
      const response = await instance.put(`/service-requests/${id}`, { adminRemarks });
      return response.data;
    } catch (error) {
      console.error('Error while adding remark to service request:', error);
      throw error;
    }
  },

  // DELETE
  delete: async (id) => {
    try {
      const response = await instance.delete(`/service-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error while deleting service request:', error);
      throw error;
    }
  },
};

export default serviceRequestService;
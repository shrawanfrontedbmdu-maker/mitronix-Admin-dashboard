import { instance } from './axios.config.js'
import { mockServiceRequests, mockUsers } from "./mockData.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const serviceRequestService = {
  getAll: async (params = {}) => {
    try {
      const response = await instance.get('/service-requests', { params });
      return response.data;
    } catch (apiError) {
      console.log('Error while fetching service requests:', apiError);
      throw apiError;
    }
  },
  getById: async (id) => {
    try {
      const response = await instance.get(`/service-requests/${id}`);
      return response.data;
    } catch (apiError) {
      console.log('Error while fetching service request by ID:', apiError);
      throw apiError;
    }
  },
  create: async (data) => {
    try {
      const response = await instance.post('/service-requests', data);
      return response.data;
    } catch (apiError) {
      console.log('Error while creating service request:', apiError);
      throw apiError;
    }
  },

  update: async (id, data) => {
    try {
      const response = await instance.put(`/service-requests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  },

  addComment: async (id, commentData) => {
    try {
      await delay(400);
      const requestIndex = mockServiceRequests.findIndex(req => req.id === id);
      if (requestIndex === -1) {
        throw new Error('Service request not found');
      }

      if (!mockServiceRequests[requestIndex].comments) {
        mockServiceRequests[requestIndex].comments = [];
      }

      const newComment = {
        id: Date.now().toString(),
        ...commentData,
        createdAt: new Date().toISOString()
      };

      mockServiceRequests[requestIndex].comments.push(newComment);
      mockServiceRequests[requestIndex].updatedAt = new Date().toISOString();

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  assign: async (id, assignedTo) => {
    try {
      await delay(400);
      const requestIndex = mockServiceRequests.findIndex(req => req.id === id);
      if (requestIndex === -1) {
        throw new Error('Service request not found');
      }

      mockServiceRequests[requestIndex].assignedTo = assignedTo;
      mockServiceRequests[requestIndex].updatedAt = new Date().toISOString();

      return mockServiceRequests[requestIndex];
    } catch (error) {
      console.error('Error assigning service request:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await instance.get('/service-requests/stats');
      return response.data;
    } catch (apiError) {
      console.log('Error while fetching service request stats:', apiError);
      throw apiError;
    }
  },

  delete: async (id) => {
    try {
      const response = await instance.delete(`/service-requests/${id}`);
      return response.data;
    } catch (apiError) {
      console.log('Error while deleting service request:', apiError);
      throw apiError;
    }
  },
};

export default serviceRequestService;

import { instance, requestWithRetry } from './axios.config.js'

export const orderService = {
  getOrders: async () => {
    try {
      const response = await requestWithRetry({ url: '/orders', method: 'get' })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching orders:', error.response?.status, error.message)
      // Return empty array as fallback
      return []
    }
  },

  getOrdersThisMonth: async () => {
    try {
      const response = await requestWithRetry({ url: '/orders/this-month', method: 'get',})
      return response.data || { count: 0, data: [] }
    } catch (error) {
      console.error('Error fetching orders this month:', error.response?.status, error.message)
      return { count: 0, data: [] }
    }
  },

  getOrdersLastMonth: async () => {
    try {
      const response = await requestWithRetry({ url: '/orders/last-month', method: 'get' })
      return response.data || { count: 0, data: [] }
    } catch (error) {
      console.error('Error fetching orders last month:', error.response?.status, error.message)
      return { count: 0, data: [] }
    }
  },

  getOrdersThisYear: async () => {
    try {
      const response = await requestWithRetry({ url: '/orders/this-year', method: 'get' })
      return response.data || { count: 0, data: [] }
    } catch (error) {
      console.error('Error fetching orders this year:', error.response?.status, error.message)
      return { count: 0, data: [] }
    }
  },

  getOrdersByMonth: async (year, month) => {
    try {
      const response = await requestWithRetry({ url: '/orders/by-month', method: 'get', params: { year, month } })
      return response.data || { count: 0, data: [] }
    } catch (error) {
      console.error('Error fetching orders by month:', error.response?.status, error.message)
      return { count: 0, data: [] }
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await requestWithRetry({ url: '/orders', method: 'post', data: orderData })
      return response.data
    } catch (error) {
      console.error('Error creating order:', error.response?.status, error.message)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order'
      throw new Error(errorMessage)
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await requestWithRetry({ url: `/orders/${id}`, method: 'put', data: orderData })
      return response.data
    } catch (error) {
      console.error('Error updating order:', error.response?.status, error.message)
      throw error
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await requestWithRetry({ url: `/orders/${id}`, method: 'delete' })
      return response.data
    } catch (error) {
      console.error('Error deleting order:', error.response?.status, error.message)
      throw error
    }
  }
}

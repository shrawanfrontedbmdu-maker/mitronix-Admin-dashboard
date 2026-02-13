import { instance } from './axios.config.js'

export const invoiceService = {
  getInvoices: async () => {
    try {
      const response = await instance.get('/invoices')
      return response.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  },
  getInvoiceById: async (id) => {
    try {
      const response = await instance.get(`/invoices/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw error
    }
  },

  createInvoice: async (invoiceData) => {
    try {
      const response = await instance.post('/invoices', invoiceData)
      return response.data
    } catch (error) {
      console.error('Error creating invoice:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create invoice'
      throw new Error(errorMessage)
    }
  },

  updateInvoice: async (id, invoiceData) => {
    try {
      const response = await instance.put(`/invoices/${id}`, invoiceData)
      return response.data
    } catch (error) {
      console.error('Error updating invoice:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update invoice'
      throw new Error(errorMessage)
    }
  },

  deleteInvoice: async (id) => {
    try {
      const response = await instance.delete(`/invoices/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  },

  getInvoicesThisMonth: async () => {
    try {
      const response = await instance.get('/invoices/this-month')
      return response.data
    } catch (error) {
      console.error('Error fetching invoices this month:', error)
      throw error
    }
  },

  getInvoicesLastMonth: async () => {
    try {
      const response = await instance.get('/invoices/last-month')
      return response.data
    } catch (error) {
      console.error('Error fetching invoices last month:', error)
      throw error
    }
  },

  getInvoicesThisYear: async () => {
    try {
      const response = await instance.get('/invoices/this-year')
      return response.data
    } catch (error) {
      console.error('Error fetching invoices this year:', error)
      throw error
    }
  },
  generateInvoicepdf: async (orderId) => {
    const response = await instance.get(
      `/invoices/generateinvoice/${orderId}`,
      {
        responseType: "blob", // 👈 VERY IMPORTANT for PDF
      }
    );
    return response;
  },
};


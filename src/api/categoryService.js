// categoryService.js
import axios from "axios";
import { mockCategories } from "./mockData.js";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://miltronix-backend-1.onrender.com/api",
  timeout: 60000,
});

export const categoryService = {
  // ================= GET ALL CATEGORIES =================
  getCategories: async () => {
    try {
      const response = await api.get("/category");
      return response.data || [];
    } catch (error) {
      console.warn(
        "API unavailable, returning mock categories:",
        error.message
      );
      return mockCategories.map((cat) => ({
        ...cat,
        status: cat.status || "active", // ensure status exists
      }));
    }
  },

  // ================= GET CATEGORY BY ID =================
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/category/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= CREATE CATEGORY =================
  createCategory: async (categoryData) => {
    try {
      const isFormData = categoryData instanceof FormData;

      const response = await api.post("/category", categoryData, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= UPDATE CATEGORY =================
  updateCategory: async (id, categoryData) => {
    try {
      const isFormData = categoryData instanceof FormData;

      const response = await api.put(`/category/${id}`, categoryData, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= DELETE CATEGORY =================
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/category/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};

export default categoryService;

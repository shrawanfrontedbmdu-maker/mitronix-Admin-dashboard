// infoSectionService.js
import axios from "axios";

// ===== Axios instance =====
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://miltronix-backend-1.onrender.com/api",
  timeout: 60000, // 60 seconds
});

// ===== InfoSection Service =====
export const infoSectionService = {
  // ================= GET ALL INFOSECTIONS =================
  getInfoSections: async () => {
    try {
      const response = await api.get("/infosections"); // plural
      return response.data || [];
    } catch (error) {
      console.warn(
        "API unavailable, returning empty InfoSections:",
        error.message
      );
      return []; // fallback empty array
    }
  },

  // ================= GET INFOSECTION BY ID =================
  getInfoSectionById: async (id) => {
    try {
      const response = await api.get(`/infosections/${id}`); // plural
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= CREATE INFOSECTION =================
  createInfoSection: async (sectionData) => {
    try {
      const isFormData = sectionData instanceof FormData;

      const response = await api.post("/infosections", sectionData, { // plural
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= UPDATE INFOSECTION =================
  updateInfoSection: async (id, sectionData) => {
    try {
      const isFormData = sectionData instanceof FormData;

      const response = await api.put(`/infosections/${id}`, sectionData, { // plural
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // ================= DELETE INFOSECTION =================
  deleteInfoSection: async (id) => {
    try {
      const response = await api.delete(`/infosections/${id}`); // plural
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};

export default infoSectionService;

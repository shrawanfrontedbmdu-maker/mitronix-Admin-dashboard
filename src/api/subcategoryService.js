import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

export const subcategoryService = {

  async getSubcategoriesByCategory(categoryId) {
    const res = await axios.get(
      `${API_BASE}/subcategory?category=${categoryId}`
    );
    console.log(res.data.subcategories)
    return res.data.subcategories;
  },
  async createSubcategory(data) {
    const response = await axiosInstance.post(
      `/subcategory`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async updateSubcategory(id, data) {
    const response = await axiosInstance.put(
      `/subcategory/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
};

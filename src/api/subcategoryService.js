import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const subcategoryService = {

  async getSubcategoriesByCategory(categoryId) {
    const res = await axios.get(
      `${API_BASE}/subcategory?category=${categoryId}`
    );
    return res.data.subcategories;
  },

  async createSubcategory(data) {
    let payload = data;

    // Send as JSON (no image upload)
    const res = await axios.post(
      `${API_BASE}/subcategory`,
      payload
    );
    return res.data;
  },

  async updateSubcategory(id, data) {
    let payload;

    if (data.image) {
      payload = new FormData();

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          payload.append(key, data[key]);
        }
      });

      const res = await axios.put(
        `${API_BASE}/subcategory/${id}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data;
    }

    const res = await axios.put(
      `${API_BASE}/subcategory/${id}`,
      data
    );

    return res.data;
  },

  async deleteSubcategory(id) {
    const res = await axios.delete(
      `${API_BASE}/subcategory/${id}`
    );
    return res.data;
  },
};

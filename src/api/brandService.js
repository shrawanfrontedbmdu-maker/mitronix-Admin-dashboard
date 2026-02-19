import instance from "./axios.config.js";

export const brandService = {
  getBrands: async () => {
    try {
      const response = await instance.get("/brand/");
      return response.data.brand;
    } catch (error) {
      return [];
    }
  },

  createBrand: async (brandData) => {
    try {
      const response = await instance.post("/brand/", brandData);
      console.log(response)
      return response.data.brand;
    } catch (error) {
      return null;
    }
  },

  updateBrand: async (id, brandData) => {
    try {
      const response = await instance.put(`/brand/edit/${id}`, brandData);
      return response.data;
    } catch (error) {
      return { _id: id, ...brandData };
    }
  },

  deleteBrand: async (id) => {
    try {
      const response = await instance.delete(`/brand/delete/${id}`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },
};

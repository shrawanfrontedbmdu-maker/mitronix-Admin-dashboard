// productService.js
import { instance } from "./axios.config.js";

export const productService = {

  /* ================= CREATE PRODUCT ================= */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      /* ===== REQUIRED FIELDS ===== */
      const requiredFields = [
        "name", "productKey", "description",
        "category", "warranty", "returnPolicy",
      ];
      requiredFields.forEach((field) => {
        if (!productData[field]) throw { message: `${field} is required` };
        formData.append(field, productData[field]);
      });

      /* ===== VARIANTS (MANDATORY) ===== */
      if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
        throw { message: "At least one variant is required" };
      }
      formData.append("variants", JSON.stringify(productData.variants));

      /* ===== OPTIONAL SIMPLE FIELDS ===== */
      const optionalSimpleFields = [
        "slug", "brand", "metaTitle", "metaDescription",
        "status", "isFeatured", "isRecommended", "isDigital",
      ];
      optionalSimpleFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null) {
          formData.append(field, productData[field]);
        }
      });

      /* ===== JSON / ARRAY FIELDS ===== */
      const jsonFields = ["specifications", "keyFeatures", "tags", "keywords"];
      jsonFields.forEach((field) => {
        if (productData[field]) {
          formData.append(field, JSON.stringify(productData[field]));
        }
      });

      /* ===== IMAGES (FILES ONLY) ===== */
      if (!productData.images || productData.images.length === 0) {
        throw { message: "At least one product image is required" };
      }
      productData.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await instance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("❌ Create product error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= GET ALL PRODUCTS ================= */
  getProducts: async (filters = {}) => {
    try {
      const response = await instance.get("/products", { params: filters });
      return response.data.products;
    } catch (error) {
      console.error("Get products error:", error);
      throw error.response?.data || error;
    }
  },

  /* ================= GET PRODUCT BY ID ================= */
  getProductById: async (id) => {
    try {
      const res = await instance.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("Get product by id error:", error);
      throw error.response?.data || error;
    }
  },

  /* ================= UPDATE PRODUCT ================= */
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();

      /* ===== SIMPLE STRING / BOOLEAN FIELDS ===== */
      const simpleFields = [
        "name", "slug", "productKey", "description", "category",
        "brand", "modelNumber", "warranty", "returnPolicy",
        "status", "metaTitle", "metaDescription",
        "isRecommended", "isFeatured", "isDigital",
      ];
      simpleFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null) {
          formData.append(field, productData[field]);
        }
      });

      /* ===== JSON FIELDS (arrays / objects) ===== */
      // NOTE: variants aur imagesToDelete bhi yahan handle hote hain
      // Double append nahi hoga kyunki ye loop aur alag block dono nahi hain
      const jsonFields = [
        "specifications", "keyFeatures", "tags", "keywords",
        "variants", "imagesToDelete",
      ];
      jsonFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null) {
          formData.append(field, JSON.stringify(productData[field]));
        }
      });

      /* ===== NEW IMAGE FILES ===== */
      // productData.newImageFiles mein File objects aate hain frontend se
      if (productData.newImageFiles && productData.newImageFiles.length > 0) {
        productData.newImageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      const res = await instance.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (error) {
      console.error("❌ Update product error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= DELETE PRODUCT ================= */
  deleteProduct: async (id) => {
    try {
      const res = await instance.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("Delete product error:", error);
      throw error.response?.data || error;
    }
  },
};
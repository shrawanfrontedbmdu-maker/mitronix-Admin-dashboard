// productService.js
import { instance } from "./axios.config.js";
import { mockProducts } from "./mockData.js";

export const productService = {
  // ================= CREATE PRODUCT =================
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      // Required fields
      const requiredFields = [
        "name",
        "description",
        "category",
        "sellingPrice",
        "warranty",
        "returnPolicy",
        "hsnCode",
        "productKey",
      ];

      requiredFields.forEach((field) => {
        if (productData[field] !== undefined) {
          formData.append(field, productData[field]);
        }
      });

      // Optional fields
      const optionalFields = [
        "slug",
        "sku",
        "brand",
        "colour",
        "size",
        "specification",
        "mrp",
        "discountPrice",
        "stockQuantity",
        "stockStatus",
        "weight",
        "dimensions",
        "barcode",
        "resolution",
        "screenSize",
      ];

      optionalFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null) {
          formData.append(field, productData[field]);
        }
      });

      // Boolean / Status fields
      formData.append("isActive", productData.isActive ?? true);
      formData.append("status", productData.status ?? "active");
      formData.append("isRecommended", productData.isRecommended ?? false);

      // Arrays
      if (productData.variants && productData.variants.length > 0) {
        formData.append("variants", productData.variants.join(","));
      }
      if (productData.tags && productData.tags.length > 0) {
        formData.append("tags", productData.tags.join(","));
      }

      // Supplier
      if (productData.supplier) {
        const supplier = productData.supplier;
        if (supplier.name) formData.append("supplier[name]", supplier.name);
        if (supplier.contact) formData.append("supplier[contact]", supplier.contact);
        if (supplier.email) formData.append("supplier[email]", supplier.email);
      }

      // Shipping
      if (productData.shipping) {
        const shipping = productData.shipping;
        if (shipping.charges) formData.append("shipping[charges]", shipping.charges);
        if (shipping.deliveryTime)
          formData.append("shipping[deliveryTime]", shipping.deliveryTime);
        if (shipping.restrictions)
          formData.append("shipping[restrictions]", shipping.restrictions);
      }

      // Images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      // Send POST request
      const response = await instance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("Product creation error:", error);
      throw error.response?.data || error;
    }
  },

  // ================= GET ALL PRODUCTS =================
  getProducts: async (filters = {}) => {
    try {
      const response = await instance.get("/products", { params: filters });
      return response.data;
    } catch (error) {
      console.warn("API not available, returning mock products", error.message);
      return mockProducts;
    }
  },

  // ================= GET PRODUCT BY ID =================
  getProductById: async (id) => {
    try {
      const response = await instance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ================= UPDATE PRODUCT =================
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();

      // Append all fields (same logic as create)
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(","));
          } else if (typeof value === "object" && !(value instanceof File)) {
            Object.entries(value).forEach(([subKey, subVal]) => {
              formData.append(`${key}[${subKey}]`, subVal);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await instance.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ================= DELETE PRODUCT =================
  deleteProduct: async (id) => {
    try {
      const response = await instance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// productService.js
import { instance } from "./axios.config.js";
import { mockProducts } from "./mockData.js";

export const productService = {

  /* ================= CREATE PRODUCT ================= */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      // Determine if this is a variant product
      const variants = productData.variants?.length > 0 ? productData.variants : [];
      const isVariantProduct = variants.length > 0;

      // Required fields
      const requiredFields = [
        "name",
        "description",
        "category",
        "warranty",
        "returnPolicy",
        "hsnCode",
        "productKey",
      ];

      requiredFields.forEach(field => {
        if (productData[field] !== undefined && productData[field] !== null && productData[field] !== "") {
          formData.append(field, productData[field]);
        } else {
          throw { message: `${field} is required` };
        }
      });

      // Non-variant products require SKU and sellingPrice
      if (!isVariantProduct) {
        if (!productData.sku) throw { message: "SKU is required for non-variant products" };
        if (!productData.sellingPrice) throw { message: "sellingPrice is required for non-variant products" };
        formData.append("sku", productData.sku);
        formData.append("sellingPrice", productData.sellingPrice);
        if (productData.mrp) formData.append("mrp", productData.mrp);
        if (productData.stockQuantity !== undefined) formData.append("stockQuantity", productData.stockQuantity);
        formData.append("stockStatus", productData.stockStatus ?? "in-stock");
      } else {
        // Variant product: append variants array
        formData.append("variants", JSON.stringify(variants));
      }

      // Optional fields
      const optionalFields = [
        "slug",
        "brand",
        "specification",
        "weight",
        "dimensions",
        "barcode",
        "tags",
        "supplier",
        "shipping",
        "isRecommended",
        "status",
      ];

      optionalFields.forEach(field => {
        if (productData[field] !== undefined && productData[field] !== null) {
          // Arrays or objects need to be stringified
          if (Array.isArray(productData[field]) || typeof productData[field] === "object") {
            formData.append(field, JSON.stringify(productData[field]));
          } else {
            formData.append(field, productData[field]);
          }
        }
      });

      // Images
      if (!productData.images || productData.images.length === 0) {
        throw { message: "At least one product image is required" };
      }
      productData.images.forEach(image => formData.append("images", image));

      // Send request
      const response = await instance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Product created successfully:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ Product creation error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= GET ALL PRODUCTS ================= */
  getProducts: async (filters = {}) => {
    try {
      const response = await instance.get("/products", { params: filters });
      return response.data.products;
    } catch (error) {
      console.warn("API not available, returning mock products");
      return mockProducts;
    }
  },

  /* ================= GET PRODUCT BY ID ================= */
  getProductById: async (id) => {
    try {
      const response = await instance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /* ================= UPDATE PRODUCT ================= */
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();

      // Determine if this is a variant product
      const variants = productData.variants?.length > 0 ? productData.variants : [];
      const isVariantProduct = variants.length > 0;

      // Handle SKU and sellingPrice for non-variant products
      if (!isVariantProduct) {
        if (!productData.sku) throw { message: "SKU is required for non-variant products" };
        if (!productData.sellingPrice) throw { message: "sellingPrice is required for non-variant products" };
      }

      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) || (typeof value === "object" && !(value instanceof File))) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Images
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach(image => formData.append("images", image));
      }

      const response = await instance.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Product updated:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ Product update error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= DELETE PRODUCT ================= */
  deleteProduct: async (id) => {
    try {
      const response = await instance.delete(`/products/${id}`);
      console.log("✅ Product deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Product delete error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },
};

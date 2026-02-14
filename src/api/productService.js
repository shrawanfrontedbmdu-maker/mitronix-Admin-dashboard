// productService.js
import { instance } from "./axios.config.js";

export const productService = {

  /* ================= CREATE PRODUCT ================= */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      const variants = productData.variants?.length ? productData.variants : [];
      const isVariantProduct = variants.length > 0;

      /* ===== REQUIRED FIELDS ===== */
      const requiredFields = [
        "name",
        "productKey",
        "description",
        "category",
        "warranty",
        "returnPolicy"
      ];

      requiredFields.forEach(field => {
        if (!productData[field]) {
          throw { message: `${field} is required` };
        }
        formData.append(field, productData[field]);
      });

      /* ===== VARIANT / NON VARIANT RULE ===== */
      if (isVariantProduct) {
        formData.append("variants", JSON.stringify(variants));
      } else {
        if (!productData.sku) throw { message: "sku is required for non-variant product" };
        if (!productData.sellingPrice) throw { message: "sellingPrice is required for non-variant product" };

        formData.append("sku", productData.sku);
        formData.append("sellingPrice", productData.sellingPrice);

        if (productData.mrp) formData.append("mrp", productData.mrp);
        if (productData.stockQuantity !== undefined)
          formData.append("stockQuantity", productData.stockQuantity);
      }

      /* ===== OPTIONAL FIELDS ===== */
      const optionalFields = [
        "slug",
        "brand",
        "modelNumber",
        "metaTitle",
        "metaDescription",
        "status",
        "isFeatured",
        "isRecommended",
        "isDigital"
      ];

      optionalFields.forEach(field => {
        if (productData[field] !== undefined) {
          formData.append(field, productData[field]);
        }
      });

      /* ===== ARRAY / OBJECT FIELDS ===== */
      const jsonFields = [
        "specifications",
        "keyFeatures",
        "dimensions",
        "tags",
        "keywords"
      ];

      jsonFields.forEach(field => {
        if (productData[field]) {
          formData.append(field, JSON.stringify(productData[field]));
        }
      });

      /* ===== IMAGES ===== */
      if (!productData.images || productData.images.length === 0) {
        throw { message: "At least one image is required" };
      }

      productData.images.forEach(file => {
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
  getProducts: async () => {
    const res = await instance.get("/products");
    return res.data;
  },


  /* ================= GET PRODUCT BY ID ================= */
  getProductById: async (id) => {
    const res = await instance.get(`/products/${id}`);
    return res.data;
  },


  /* ================= UPDATE PRODUCT ================= */
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();

      const variants = productData.variants?.length ? productData.variants : [];
      const isVariantProduct = variants.length > 0;

      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "images") {
          if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      if (isVariantProduct) {
        formData.append("variants", JSON.stringify(variants));
        formData.delete("sku");
        formData.delete("sellingPrice");
        formData.delete("mrp");
      }

      if (productData.images?.length) {
        productData.images.forEach(file => {
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
    const res = await instance.delete(`/products/${id}`);
    return res.data;
  }

};

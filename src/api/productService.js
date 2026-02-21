// productService.js
import { instance } from "./axios.config.js";

export const productService = {

  /* ================= CREATE PRODUCT ================= */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      const variants = productData.variants || [];
      // extract files belonging to variant images so we can append later
      const variantImageFiles = [];
      const sanitizedVariants = variants.map((v, vidx) => {
        const copy = { ...v };
        if (copy.images) {
          copy.images = copy.images.filter((img) => {
            if (img && img.file) {
              variantImageFiles.push({ variantIndex: vidx, file: img.file });
              return false;
            }
            return true;
          });
        }
        return copy;
      });

      /* ===== REQUIRED FIELDS ===== */
      const requiredFields = [
        "name",
        "productKey",
        "description",
        "category",
        "warranty",
        "returnPolicy",
      ];

      requiredFields.forEach((field) => {
        if (!productData[field]) {
          throw { message: `${field} is required` };
        }
        formData.append(field, productData[field]);
      });

      /* ===== VARIANTS ===== */
      if (sanitizedVariants.length === 0) {
        throw { message: "At least one variant is required" };
      }
      formData.append("variants", JSON.stringify(sanitizedVariants));

      /* ===== OPTIONAL FIELDS ===== */
      const optionalFields = [
        "slug",
        "subcategory",
        "brand",
        "metaTitle",
        "metaDescription",
        "status",
        "isFeatured",
        "isRecommended",
        "isDigital",
      ];

      optionalFields.forEach(field => {
        if (productData[field] !== undefined && productData[field] !== null && productData[field] !== "") {
          formData.append(field, productData[field]);
        }
      });

      /* ===== ARRAY / OBJECT FIELDS ===== */
      const jsonFields = [
        "specifications",
        "keyFeatures",
        "tags",
        "keywords",
        "filterOptions",
      ];
      jsonFields.forEach(field => {
        if (productData[field] && productData[field].length > 0) {
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

      // append variant image files after main images
      variantImageFiles.forEach((vf) => {
        formData.append(`variantImage_${vf.variantIndex}`, vf.file);
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
      console.warn("API not available, returning mock products");
      return mockProducts;
    }
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

      // handle variant image files similar to create
      const variantImageFiles = [];
      const sanitizedVariants = variants.map((v, vidx) => {
        const copy = { ...v };
        if (copy.images) {
          copy.images = copy.images.filter((img) => {
            if (img && img.file) {
              variantImageFiles.push({ variantIndex: vidx, file: img.file });
              return false;
            }
            return true;
          });
        }
        return copy;
      });

      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "images") {
          if (key === "variants" && isVariantProduct) {
            formData.append("variants", JSON.stringify(sanitizedVariants));
          } else if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      if (isVariantProduct) {
        formData.delete("sku");
        formData.delete("sellingPrice");
        formData.delete("mrp");
      }

      if (productData.images?.length) {
        productData.images.forEach(file => {
          formData.append("images", file);
        });
      }

      // append any variant image files
      variantImageFiles.forEach((vf) => {
        formData.append(`variantImage_${vf.variantIndex}`, vf.file);
      });

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

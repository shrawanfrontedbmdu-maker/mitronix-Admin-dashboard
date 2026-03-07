import { instance } from "./axios.config.js";

export const productService = {

  /* ================= CREATE PRODUCT ================= */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();

      const variants = productData.variants || [];
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

      /* ── Required fields ── */
      const requiredFields = ["name", "productKey", "description", "category", "warranty", "returnPolicy"];
      requiredFields.forEach((field) => {
        if (!productData[field]) throw { message: `${field} is required` };
        formData.append(field, productData[field]);
      });

      /* ── Variants ── */
      if (sanitizedVariants.length === 0) throw { message: "At least one variant is required" };
      formData.append("variants", JSON.stringify(sanitizedVariants));

      /* ── Optional scalar fields ── */
      const optionalFields = ["slug", "subcategory", "brand", "metaTitle", "metaDescription", "status", "isFeatured", "isRecommended", "isDigital"];
      optionalFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null && productData[field] !== "") {
          formData.append(field, productData[field]);
        }
      });

      /* ── Array / JSON fields ── */
      const jsonFields = ["specifications", "keyFeatures", "tags", "keywords", "filterOptions"];
      jsonFields.forEach((field) => {
        if (productData[field]?.length > 0) {
          formData.append(field, JSON.stringify(productData[field]));
        }
      });

      /* ── Main images ── */
      if (!productData.images?.length) throw { message: "At least one image is required" };
      productData.images.forEach((file) => formData.append("images", file));

      /* ── Variant images ── */
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
      console.error("❌ Get products error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= GET PRODUCT BY ID ================= */
  getProductById: async (id) => {
    try {
      const res = await instance.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Get product error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /* ================= UPDATE PRODUCT ================= */
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();

      const variants = productData.variants || [];
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

      /* ── Scalar fields ── */
      const scalarFields = [
        "name", "slug", "productKey", "description", "category",
        "subcategory", "brand", "warranty", "returnPolicy",
        "status", "isFeatured", "isRecommended", "isDigital",
        "allowBackorder", "metaTitle", "metaDescription",
      ];
      scalarFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null) {
          formData.append(field, productData[field]);
        }
      });

      /* ── JSON / Array fields ── */
      const jsonFields = ["specifications", "keyFeatures", "tags", "keywords", "filterOptions"];
      jsonFields.forEach((field) => {
        if (productData[field] !== undefined) {
          formData.append(field, JSON.stringify(productData[field]));
        }
      });

      /* ── Variants ── */
      if (sanitizedVariants.length > 0) {
        formData.append("variants", JSON.stringify(sanitizedVariants));
      }

      /* ── existingImages — backend ko batao kaunsi purani images rakhni hain ── */
      if (productData.existingImages !== undefined) {
        formData.append(
          "existingImages",
          JSON.stringify(
            productData.existingImages.map((img) =>
              typeof img === "string" ? img : img.public_id
            )
          )
        );
      }

      /* ── imagesToDelete — kaunsi delete karni hain ── */
      if (productData.imagesToDelete?.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(productData.imagesToDelete));
      }

      /* ── Nayi main images (File objects) ── */
      if (productData.newImageFiles?.length > 0) {
        productData.newImageFiles.forEach((file) => formData.append("images", file));
      }

      /* ── Variant images ── */
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
    try {
      const res = await instance.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Delete product error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },
};
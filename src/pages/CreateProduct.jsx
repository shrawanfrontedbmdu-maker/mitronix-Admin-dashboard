import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdCloudUpload, MdClose, MdSave, MdArrowBack } from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";
import { subcategoryService } from "../api/subcategoryService.js";
import { filterService } from "../api/filterService.js";

const BACKEND_URL = "https://miltronix-backend-1.onrender.com";

function CreateProduct() {
  const navigate = useNavigate();

  const initialFormState = {
    name: "",
    slug: "",
    productKey: "",
    description: "",
    category: "",
    subcategory: "",
    filterOptions: [],
    brand: "",
    modelNumber: "",
    mrp: "",
    sellingPrice: "",
    costPrice: "",
    currency: "INR",
    sku: "",
    stockQuantity: 0,
    stockStatus: "in-stock",
    lowStockThreshold: 5,
    allowBackorder: false,
    reservedQuantity: 0,
    specifications: [],
    keyFeatures: [],
    variants: [],
    dimensions: {
      weight: "",
      length: "",
      width: "",
      height: "",
      unit: "cm",
    },
    warranty: "",
    returnPolicy: "",
    isRecommended: false,
    isFeatured: false,
    isDigital: false,
    status: "active",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    tags: [],
    relatedProducts: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [priceValidationMessage, setPriceValidationMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        const categoryList = res.data || res;
        setCategories(categoryList);
        if (categoryList.length > 0) {
          const firstId = categoryList[0]._id;
          setFormData((prev) => ({ ...prev, category: firstId }));
          // load related subcategories and filters
          loadSubcategories(firstId);
          loadFilterGroups(firstId);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please create categories first.");
      }
    };
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setError("");
    setSuccess("");
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const validatePricing = (sellingPrice, mrp) => {
    if (sellingPrice && mrp && parseFloat(sellingPrice) > parseFloat(mrp)) {
      setPriceValidationMessage("⚠️ Selling price cannot be higher than MRP");
    } else {
      setPriceValidationMessage("");
    }
  };

  // fetch subcategories for chosen category
  const loadSubcategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      const data = await subcategoryService.getSubcategoriesByCategory(categoryId);
      setSubcategories(data || []);
    } catch (err) {
      console.error("Failed to load subcategories", err);
      setSubcategories([]);
    }
  };

  const loadFilterGroups = async (categoryId) => {
    if (!categoryId) return;
    try {
      const groups = await filterService.getFilterGroupsByCategory(categoryId);
      console.log(groups)
      setFilterGroups(groups || []);
    } catch (err) {
      console.error("Failed to load filter groups", err);
      setFilterGroups([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return { ...prev, [parent]: { ...prev[parent], [child]: val } };
      }

      const newData = { ...prev, [name]: val };
      if (name === "name") newData.slug = generateSlug(val);
      if (name === "sellingPrice" || name === "mrp") {
        const currentPrice =
          name === "sellingPrice" ? val : newData.sellingPrice;
        const currentMrp = name === "mrp" ? val : newData.mrp;
        validatePricing(currentPrice, currentMrp);
      }

      // when category changes, reset dependent values and reload lists
      if (name === "category") {
        newData.subcategory = "";
        newData.filterOptions = [];
        // clear previous lists while loading new ones
        setSubcategories([]);
        setFilterGroups([]);
        loadSubcategories(val);
        loadFilterGroups(val);
      }

      return newData;
    });
  };

  const handleSpecificationChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: updated }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpecification = (index) => {
    const updated = formData.specifications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, specifications: updated }));
  };

  const handleKeyFeatureChange = (index, field, value) => {
    const updated = [...formData.keyFeatures];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, keyFeatures: updated }));
  };

  const addKeyFeature = () => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, { key: "", value: "" }],
    }));
  };

  const removeKeyFeature = (index) => {
    const updated = formData.keyFeatures.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, keyFeatures: updated }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: "",
          price: 0,
          stockQuantity: 0,
          attributes: { color: "", size: "", model: "" },
          images: [],
          specifications: [],
          isActive: true,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleImageUpload = (files) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxImages = 5;
    const remaining = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    const validFiles = filesToProcess.filter((file) => {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid type: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // variant-specific image helpers
  const handleVariantImageUpload = (variantIndex, files) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const updated = [...formData.variants];
    const existing = updated[variantIndex]?.images || [];
    const max = 3; // allow up to 3 images per variant
    const remaining = max - existing.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    const validFiles = filesToProcess.filter((file) => {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid type: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    updated[variantIndex].images = [...existing, ...newImages];
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariantImage = (variantIndex, imageId) => {
    const updated = [...formData.variants];
    const imagesArr = updated[variantIndex]?.images || [];
    const removed = imagesArr.find((img) => img.id === imageId);
    if (removed && removed.preview) {
      URL.revokeObjectURL(removed.preview);
    }
    updated[variantIndex].images = imagesArr.filter((img) => img.id !== imageId);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };
  const handleFileSelect = (e) => handleImageUpload(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (
        !formData.name ||
        !formData.productKey ||
        !formData.description ||
        !formData.category ||
        !formData.warranty ||
        !formData.returnPolicy
      ) {
        setError("Please fill all required fields");
        return;
      }

      if (
        formData.mrp &&
        formData.sellingPrice &&
        parseFloat(formData.sellingPrice) > parseFloat(formData.mrp)
      ) {
        setError("Selling price cannot be higher than MRP");
        return;
      }

      if (images.length === 0) {
        setError("Upload at least one product image");
        return;
      }

      setLoading(true);
      const slug = generateSlug(formData.name);
      const productKey = formData.productKey || slug + "-" + Date.now();

      const cleanedVariants = formData.variants.filter(
        (v) =>
          v.sku ||
          v.attributes.color ||
          v.attributes.size ||
          v.price ||
          v.stockQuantity,
      );

      const mainProductSKU =
        cleanedVariants.length === 0
          ? formData.sku || `${productKey}-main-${Date.now()}`
          : undefined;

      const productData = {
        name: formData.name,
        slug,
        productKey,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        filterOptions: formData.filterOptions || [],
        brand: formData.brand || undefined,
        modelNumber: formData.modelNumber || undefined,
        mrp:
          cleanedVariants.length === 0 && formData.mrp
            ? parseFloat(formData.mrp)
            : undefined,
        sellingPrice:
          cleanedVariants.length === 0 && formData.sellingPrice
            ? parseFloat(formData.sellingPrice)
            : undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        currency: formData.currency,
        sku: mainProductSKU,
        stockQuantity: formData.stockQuantity
          ? parseInt(formData.stockQuantity)
          : 0,
        stockStatus: formData.stockStatus,
        lowStockThreshold: formData.lowStockThreshold
          ? parseInt(formData.lowStockThreshold)
          : 5,
        allowBackorder: formData.allowBackorder,
        reservedQuantity: formData.reservedQuantity
          ? parseInt(formData.reservedQuantity)
          : 0,
        specifications: formData.specifications.filter((s) => s.key || s.value),
        keyFeatures: formData.keyFeatures.filter((kf) => kf.key || kf.value),
        variants: cleanedVariants.map((v) => ({
          sku:
            v.sku ||
            `${productKey}-${v.attributes.color || "NA"}-${v.attributes.size || "NA"}-${Date.now()}`,
          price: v.price ? parseFloat(v.price) : 0,
          stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity) : 0,
          attributes: {
            color: v.attributes.color || undefined,
            size: v.attributes.size || undefined,
            model: v.attributes.model || undefined,
          },
          images: v.images || [],
          specifications: v.specifications || [],
          isActive: v.isActive !== undefined ? v.isActive : true,
        })),
        dimensions: {
          weight: formData.dimensions.weight
            ? parseFloat(formData.dimensions.weight)
            : undefined,
          length: formData.dimensions.length
            ? parseFloat(formData.dimensions.length)
            : undefined,
          width: formData.dimensions.width
            ? parseFloat(formData.dimensions.width)
            : undefined,
          height: formData.dimensions.height
            ? parseFloat(formData.dimensions.height)
            : undefined,
          unit: formData.dimensions.unit || "cm",
        },
        warranty: formData.warranty,
        returnPolicy: formData.returnPolicy,
        isRecommended: !!formData.isRecommended,
        isFeatured: !!formData.isFeatured,
        isDigital: !!formData.isDigital,
        status: formData.status,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        keywords: formData.keywords.length > 0 ? formData.keywords : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        relatedProducts:
          formData.relatedProducts.length > 0
            ? formData.relatedProducts
            : undefined,
        images: images.map((img) => img.file),
      };

      console.log("Submitting product data:", productData);
      const result = await productService.createProduct(productData);
      setSuccess("Product created successfully!");
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      resetForm();
      setTimeout(() => navigate("/admin/products/grid"), 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "#111827",
              }}
            >
              Create Product
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Add a new product to your inventory
            </p>
          </div>
          <Link
            to="/admin/products/list"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #e5e7eb",
            }}
          >
            <MdArrowBack size={16} />
            Back to List
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              margin: "24px 32px 0",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              margin: "24px 32px 0",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{success}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/products/list")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#166534",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                View Products
              </button>
              <button
                type="button"
                onClick={() => setSuccess("")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  padding: "32px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f4f6",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px",
                  }}
                ></div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#111827",
                  }}
                >
                  Creating product...
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "32px" }}>
            {/* Product Media */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#111827",
                }}
              >
                Product Media (Images & Video)
              </h3>

              <div
                onClick={() => document.getElementById("file-input").click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: dragOver
                    ? "2px dashed #3b82f6"
                    : "2px dashed #d1d5db",
                  borderRadius: "12px",
                  padding: "48px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#eff6ff" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <MdCloudUpload
                  size={48}
                  style={{ color: "#9ca3af", marginBottom: "16px" }}
                />
                <div
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Drag & drop images and video files here, or click to browse
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  {images.length > 0
                    ? `${images.length}/5 images selected`
                    : "PNG, JPG, GIF and WebP (Max 5 images, 5MB each)"}
                </div>
              </div>

              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: "16px",
                    marginTop: "24px",
                  }}
                >
                  {images.map((image) => (
                    <div
                      key={image.id}
                      style={{
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <img
                        src={image.preview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        <MdClose />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* URL Slug/SKU */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  URL Slug/SEO*
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  SKU*
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Leave empty if using variants"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* Brand/Category */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.pageTitle || cat.title || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory dropdown - dependent on selected category */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  disabled={subcategories.length === 0 || loading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter groups/options section */}
            {filterGroups.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                  Filter Options
                </h4>
                {filterGroups.map((group) => (
                  <div key={group._id} style={{ marginBottom: "12px" }}>
                    <div style={{ fontWeight: 500, marginBottom: "4px" }}>{group.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {group.options.map((opt) => (
                        <label key={opt._id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="checkbox"
                            checked={formData.filterOptions.includes(opt._id)}
                            onChange={(e) => {
                              const selected = formData.filterOptions || [];
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  filterOptions: [...selected, opt._id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  filterOptions: selected.filter((id) => id !== opt._id),
                                }));
                              }
                            }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Model/Material */}

            {/* Model/Material */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Model Number (Optional)
                </label>
                <input
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Product Key*
                </label>
                <input
                  type="text"
                  name="productKey"
                  value={formData.productKey}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* Status/Select Material */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Stock Status
                </label>
                <select
                  name="stockStatus"
                  value={formData.stockStatus}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="preorder">Low Stock</option>
                </select>
              </div>
            </div>

            {/* Product Categories */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Product Categories
              </label>
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                Search...
              </div>
              <div
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                  minHeight: "100px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Selected categories will appear here
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Enter detailed product description..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Shipping & Return Policy */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Warranty*
              </label>
              <textarea
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="e.g., 1 year manufacturer warranty"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  marginBottom: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />

              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#374151",
                }}
              >
                Return Policy*
              </label>
              <textarea
                name="returnPolicy"
                value={formData.returnPolicy}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="e.g., 30 days return policy"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Specifications */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >

                </label>
                <button
                  type="button"
                  onClick={addSpecification}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  + Add Specification
                </button>
              </div>
              {formData.specifications.map((spec, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecificationChange(index, "key", e.target.value)
                    }
                    placeholder="Key (e.g., Processor)"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                    placeholder="Value (e.g., Intel i7)"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Key Features */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Key Features (Optional)
                </label>
                <button
                  type="button"
                  onClick={addKeyFeature}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  + Add Feature
                </button>
              </div>
              {formData.keyFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  <input
                    type="text"
                    value={feature.key}
                    onChange={(e) =>
                      handleKeyFeatureChange(index, "key", e.target.value)
                    }
                    placeholder="Feature name"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <input
                    type="text"
                    value={feature.value}
                    onChange={(e) =>
                      handleKeyFeatureChange(index, "value", e.target.value)
                    }
                    placeholder="Feature description"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyFeature(index)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Additional fields - Tags, SEO etc */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="electronics, smartphone, 5G"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  SEO Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      keywords: e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="keyword1, keyword2"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* Variants */}
            {formData.variants.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#111827",
                  }}
                >
                  Variants
                </h3>
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        Variant {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Color
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.color}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "attributes.color",
                              e.target.value,
                            )
                          }
                          placeholder="Red, Blue"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Size
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.size}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "attributes.size",
                              e.target.value,
                            )
                          }
                          placeholder="S, M, L"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Model
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.model}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "attributes.model",
                              e.target.value,
                            )
                          }
                          placeholder="Pro, Basic"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                        marginTop: "12px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          SKU
                        </label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(index, "sku", e.target.value)
                          }
                          placeholder="Variant SKU"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          placeholder="0.00"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Stock
                        </label>
                        <input
                          type="number"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stockQuantity",
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Variant images upload */}
                    <div style={{ marginTop: "12px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Variant Images (max 3)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {(variant.images || []).map((img) => (
                          <div
                            key={img.id || img.url}
                            style={{ position: "relative" }}
                          >
                            <img
                              src={img.preview || img.url}
                              alt="variant"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(index, img.id)}
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                backgroundColor: "#ef4444",
                                border: "none",
                                borderRadius: "50%",
                                color: "white",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                fontSize: "12px",
                                lineHeight: "20px",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {variant.images?.length < 3 && (
                          <label
                            style={{
                              display: "inline-block",
                              width: "60px",
                              height: "60px",
                              border: "1px dashed #d1d5db",
                              borderRadius: "4px",
                              textAlign: "center",
                              lineHeight: "60px",
                              cursor: "pointer",
                              color: "#6b7280",
                            }}
                          >
                            +
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleVariantImageUpload(index, e.target.files)
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addVariant}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
                marginBottom: "32px",
              }}
            >
              + Add Variant
            </button>

            {/* Pricing (if no variants) */}
            {formData.variants.length === 0 && (
              <div style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#111827",
                  }}
                >
                  Pricing Details
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                      }}
                    >
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                      }}
                    >
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: priceValidationMessage
                          ? "1px solid #ef4444"
                          : "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) =>
                        (e.target.style.borderColor = priceValidationMessage
                          ? "#ef4444"
                          : "#d1d5db")
                      }
                    />
                    {priceValidationMessage && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#ef4444",
                          marginTop: "4px",
                        }}
                      >
                        {priceValidationMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                      }}
                    >
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stock & Dimensions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="dimensions.weight"
                  value={formData.dimensions.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Length (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Width (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleInputChange}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                Recommended Product
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                Featured Product
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isDigital"
                  checked={formData.isDigital}
                  onChange={handleInputChange}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                Digital Product
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleInputChange}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                Allow Backorder
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "20px 32px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <Link
              to="/admin/products/list"
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !categories || categories.length === 0}
              style={{
                padding: "10px 24px",
                backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MdSave size={16} />
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default CreateProduct;
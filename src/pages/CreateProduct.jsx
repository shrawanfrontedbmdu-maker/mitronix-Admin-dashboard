import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdCloudUpload, MdClose, MdSave, MdArrowBack, MdAdd } from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function CreateProduct() {
  const navigate = useNavigate();

  const initialFormState = {
    name: "",
    slug: "",
    productKey: "",
    description: "",
    category: "",
    brand: "",
    modelNumber: "",
    specifications: [],
    keyFeatures: [],
    variants: [],
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
    sku: "",
    sellingPrice: "",
    mrp: "",
    stockQuantity: 0,
    dimensions: {
      weight: "",
      length: "",
      width: "",
      height: "",
      unit: "cm",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
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
          setFormData((prev) => ({ ...prev, category: categoryList[0]._id }));
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return { ...prev, [parent]: { ...prev[parent], [child]: val } };
      }

      const newData = { ...prev, [name]: val };
      if (name === "name") {
        newData.slug = generateSlug(val);
        if (!prev.metaTitle) newData.metaTitle = val;
      }
      if (name === "sellingPrice" || name === "mrp") {
        const currentPrice = name === "sellingPrice" ? val : newData.sellingPrice;
        const currentMrp = name === "mrp" ? val : newData.mrp;
        validatePricing(currentPrice, currentMrp);
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
      if (!updatedVariants[index][parent]) {
        updatedVariants[index][parent] = {};
      }
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleVariantSpecChange = (variantIndex, specIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    if (!updatedVariants[variantIndex].specifications) {
      updatedVariants[variantIndex].specifications = [];
    }
    updatedVariants[variantIndex].specifications[specIndex][field] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariantSpecification = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    if (!updatedVariants[variantIndex].specifications) {
      updatedVariants[variantIndex].specifications = [];
    }
    updatedVariants[variantIndex].specifications.push({ key: "", value: "" });
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const removeVariantSpecification = (variantIndex, specIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].specifications = updatedVariants[
      variantIndex
    ].specifications.filter((_, i) => i !== specIndex);
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: "",
          price: "",
          mrp: "",
          stockQuantity: 0,
          dimensions: {
            weight: "",
            length: "",
            width: "",
            height: "",
            unit: "cm",
          },
          attributes: {
            color: "",
            size: "",
            model: "",
          },
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
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
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
          v.attributes?.color ||
          v.attributes?.size ||
          v.price ||
          v.stockQuantity
      );

      const isVariantProduct = cleanedVariants.length > 0;

      const dimensionsData = {
        weight: formData.dimensions.weight ? parseFloat(formData.dimensions.weight) : undefined,
        length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
        width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
        height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
        unit: formData.dimensions.unit || "cm",
      };

      const productData = {
        name: formData.name,
        slug,
        productKey,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || undefined,
        modelNumber: formData.modelNumber || undefined,
        specifications: formData.specifications.filter((s) => s.key || s.value),
        keyFeatures: formData.keyFeatures.filter((kf) => kf.key || kf.value),
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
        images: images.map((img) => img.file),
      };

      if (isVariantProduct) {
        productData.variants = cleanedVariants.map((v) => ({
          sku: v.sku || `${productKey}-${v.attributes?.color || "NA"}-${v.attributes?.size || "NA"}-${Date.now()}`,
          price: v.price ? parseFloat(v.price) : 0,
          mrp: v.mrp ? parseFloat(v.mrp) : undefined,
          stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity) : 0,
          currency: "INR",
          dimensions: {
            weight: v.dimensions?.weight ? parseFloat(v.dimensions.weight) : undefined,
            length: v.dimensions?.length ? parseFloat(v.dimensions.length) : undefined,
            width: v.dimensions?.width ? parseFloat(v.dimensions.width) : undefined,
            height: v.dimensions?.height ? parseFloat(v.dimensions.height) : undefined,
            unit: v.dimensions?.unit || "cm",
          },
          attributes: {
            color: v.attributes?.color || undefined,
            size: v.attributes?.size || undefined,
            model: v.attributes?.model || undefined,
          },
          images: v.images?.filter(img => img.file).map(img => ({
            url: img.url || "",
            public_id: img.public_id || "",
            alt: img.alt || v.attributes?.color || "",
          })) || [],
          specifications: v.specifications?.filter(s => s.key || s.value) || [],
          isActive: v.isActive !== undefined ? v.isActive : true,
        }));
      } else {
        const mainProductSKU = formData.sku || `${productKey}-main-${Date.now()}`;
        productData.sku = mainProductSKU;
        productData.sellingPrice = formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined;
        productData.mrp = formData.mrp ? parseFloat(formData.mrp) : undefined;
        productData.stockQuantity = formData.stockQuantity ? parseInt(formData.stockQuantity) : 0;
        productData.dimensions = dimensionsData;
      }

      console.log("Submitting product data:", productData);
      const result = await productService.createProduct(productData);
      setSuccess("Product created successfully!");
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      resetForm();
      setTimeout(() => navigate("/admin/products/list"), 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 4px 0", color: "#fff" }}>
              Create New Product
            </h1>
            <p style={{ fontSize: "14px", color: "#e0e7ff", margin: 0 }}>
              Add a new product to your inventory with all details
            </p>
          </div>
          <Link
            to="/admin/products/list"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <MdArrowBack size={18} />
            Back to Products
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
              padding: "14px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚠️</span>
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
              padding: "14px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>✓</span>
              <span>{success}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/admin/products/list")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#166534",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                View Products
              </button>
              <button
                type="button"
                onClick={() => setSuccess("")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
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
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  padding: "40px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "5px solid #f3f4f6",
                    borderTop: "5px solid #667eea",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                  }}
                ></div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                  Creating product...
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
                  Please wait while we save your product
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "32px" }}>
            {/* Product Images Section */}
            <div style={{ marginBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "16px",
                }}
              >
                Product Images *
              </h3>

              <div
                onClick={() => document.getElementById("file-input").click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: dragOver ? "2px dashed #667eea" : "2px dashed #d1d5db",
                  borderRadius: "12px",
                  padding: "48px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#f5f3ff" : "#fafafa",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <MdCloudUpload
                    size={56}
                    style={{
                      color: dragOver ? "#667eea" : "#9ca3af",
                      marginBottom: "16px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    {dragOver ? "Drop images here" : "Drag & drop images here"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                    or click to browse from your computer
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      backgroundColor: "#667eea",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {images.length > 0 ? `${images.length}/5 selected` : "Select Images"}
                  </div>
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "16px",
                    marginTop: "24px",
                  }}
                >
                  {images.map((image) => (
                    <div
                      key={image.id}
                      style={{
                        position: "relative",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "2px solid #e5e7eb",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <img
                        src={image.preview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "140px",
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
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "18px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        <MdClose />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "20px",
                }}
              >
                Basic Information
              </h3>

              <div style={{ display: "grid", gap: "20px" }}>
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
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Samsung Galaxy S24"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                      Product Key *
                    </label>
                    <input
                      type="text"
                      name="productKey"
                      value={formData.productKey}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., SGS-2026"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
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
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="samsung-galaxy-s24"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#f9fafb",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
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
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Samsung"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
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
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.pageTitle || cat.title || cat.name}
                        </option>
                      ))}
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
                      Model Number
                    </label>
                    <input
                      type="text"
                      name="modelNumber"
                      value={formData.modelNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., S24-128GB"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
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
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Enter detailed product description..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
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
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Technical Specifications
                </h3>
                <button
                  type="button"
                  onClick={addSpecification}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MdAdd size={18} />
                  Add Specification
                </button>
              </div>

              {formData.specifications.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    No specifications added yet. Click "Add Specification" to start.
                  </p>
                </div>
              ) : (
                formData.specifications.map((spec, index) => (
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
                      placeholder="Key (e.g., Display)"
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecificationChange(index, "value", e.target.value)
                      }
                      placeholder="Value (e.g., 6.2 inch AMOLED)"
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      style={{
                        padding: "12px 18px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Key Features */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Key Features
                </h3>
                <button
                  type="button"
                  onClick={addKeyFeature}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MdAdd size={18} />
                  Add Feature
                </button>
              </div>

              {formData.keyFeatures.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    No key features added yet. Click "Add Feature" to start.
                  </p>
                </div>
              ) : (
                formData.keyFeatures.map((feature, index) => (
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
                      placeholder="Feature name (e.g., Camera)"
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                    <input
                      type="text"
                      value={feature.value}
                      onChange={(e) =>
                        handleKeyFeatureChange(index, "value", e.target.value)
                      }
                      placeholder="Feature description (e.g., 50MP Triple Camera)"
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeKeyFeature(index)}
                      style={{
                        padding: "12px 18px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Product Variants */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Product Variants
                  {formData.variants.length > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "14px",
                        color: "#667eea",
                        fontWeight: "500",
                      }}
                    >
                      ({formData.variants.length})
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={addVariant}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MdAdd size={18} />
                  Add Variant
                </button>
              </div>

              {formData.variants.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    No variants added. Click "Add Variant" to create product variations, or leave empty for a single-variant product.
                  </p>
                </div>
              ) : (
                formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    style={{
                      padding: "24px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      backgroundColor: "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        paddingBottom: "12px",
                        borderBottom: "2px solid #f3f4f6",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Variant #{variantIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Remove Variant
                      </button>
                    </div>

                    {/* Variant Attributes */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
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
                          value={variant.attributes?.color || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "attributes.color",
                              e.target.value
                            )
                          }
                          placeholder="Black, Blue, Red"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Size/Storage
                        </label>
                        <input
                          type="text"
                          value={variant.attributes?.size || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "attributes.size",
                              e.target.value
                            )
                          }
                          placeholder="128GB, 256GB, S, M, L"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          value={variant.attributes?.model || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "attributes.model",
                              e.target.value
                            )
                          }
                          placeholder="S24, Pro, Basic"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* SKU, Pricing & Stock */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
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
                            handleVariantChange(variantIndex, "sku", e.target.value)
                          }
                          placeholder="SGS24-230-BLACK"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={variant.mrp}
                          onChange={(e) =>
                            handleVariantChange(variantIndex, "mrp", e.target.value)
                          }
                          placeholder="79999"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(variantIndex, "price", e.target.value)
                          }
                          placeholder="74999"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Stock Qty
                        </label>
                        <input
                          type="number"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "stockQuantity",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
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
                          Weight (g)
                        </label>
                        <input
                          type="number"
                          value={variant.dimensions?.weight || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "dimensions.weight",
                              e.target.value
                            )
                          }
                          placeholder="168"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Length (cm)
                        </label>
                        <input
                          type="number"
                          value={variant.dimensions?.length || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "dimensions.length",
                              e.target.value
                            )
                          }
                          placeholder="14.7"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          value={variant.dimensions?.width || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "dimensions.width",
                              e.target.value
                            )
                          }
                          placeholder="7.0"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
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
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={variant.dimensions?.height || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "dimensions.height",
                              e.target.value
                            )
                          }
                          placeholder="0.76"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Variant Specifications */}
                    <div style={{ marginTop: "16px" }}>
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
                          Variant-Specific Specifications
                        </label>
                        <button
                          type="button"
                          onClick={() => addVariantSpecification(variantIndex)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          + Add Spec
                        </button>
                      </div>

                      {variant.specifications?.map((spec, specIndex) => (
                        <div
                          key={specIndex}
                          style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                        >
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) =>
                              handleVariantSpecChange(
                                variantIndex,
                                specIndex,
                                "key",
                                e.target.value
                              )
                            }
                            placeholder="Key (e.g., RAM)"
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "13px",
                              outline: "none",
                            }}
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) =>
                              handleVariantSpecChange(
                                variantIndex,
                                specIndex,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Value (e.g., 8GB)"
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "13px",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantSpecification(variantIndex, specIndex)
                            }
                            style={{
                              padding: "8px 14px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Non-Variant Product Pricing */}
            {formData.variants.length === 0 && (
              <>
                <div
                  style={{
                    marginBottom: "40px",
                    padding: "24px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "20px",
                    }}
                  >
                    Pricing & Inventory
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
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
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="PROD-SKU-001"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
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
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
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
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: priceValidationMessage
                            ? "1px solid #ef4444"
                            : "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
                      />
                      {priceValidationMessage && (
                        <div
                          style={{
                            fontSize: "12px",
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
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div
                  style={{
                    marginBottom: "40px",
                    padding: "24px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "20px",
                    }}
                  >
                    Dimensions & Weight
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
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
                        Weight (g)
                      </label>
                      <input
                        type="number"
                        name="dimensions.weight"
                        value={formData.dimensions.weight}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
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
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
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
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
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
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Warranty & Return Policy */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "20px",
                }}
              >
                Warranty & Return Policy
              </h3>
              <div style={{ display: "grid", gap: "16px" }}>
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
                    Warranty *
                  </label>
                  <textarea
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="e.g., 1 Year Manufacturer Warranty"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                    }}
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
                    Return Policy *
                  </label>
                  <textarea
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="e.g., 7 Days Replacement Policy"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SEO & Marketing */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "20px",
                }}
              >
                SEO & Marketing
              </h3>
              <div style={{ display: "grid", gap: "16px" }}>
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
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Samsung Galaxy S24 - Buy Online"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
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
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g., Shop Samsung Galaxy S24 at best price in India"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "white",
                    }}
                  />
                </div>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
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
                      placeholder="mobile, android, 5g"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
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
                      placeholder="samsung, galaxy, s24, smartphone"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Flags */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "20px",
                }}
              >
                Product Settings
              </h3>
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <input
                    type="checkbox"
                    name="isRecommended"
                    checked={formData.isRecommended}
                    onChange={handleInputChange}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#667eea",
                    }}
                  />
                  <span>⭐ Recommended Product</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#667eea",
                    }}
                  />
                  <span>🔥 Featured Product</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <input
                    type="checkbox"
                    name="isDigital"
                    checked={formData.isDigital}
                    onChange={handleInputChange}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "#667eea",
                    }}
                  />
                  <span>💾 Digital Product</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "24px 32px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              * Required fields must be filled
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                to="/admin/products/list"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
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
                  padding: "12px 32px",
                  background: loading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: loading ? "none" : "0 4px 6px rgba(102, 126, 234, 0.3)",
                }}
              >
                <MdSave size={18} />
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
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
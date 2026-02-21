import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdSave,
  MdDelete,
  MdClose,
  MdCloudUpload,
} from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    productKey: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
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
    existingImages: [],
    imagesToDelete: [],
    newImageFiles: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productResponse, categoriesData] = await Promise.all([
          productService.getProductById(id),
          categoryService.getCategories(),
        ]);

        const product = productResponse.product || productResponse;

        if (product) {
          setFormData({
            name: product.name || "",
            slug: product.slug || "",
            productKey: product.productKey || "",
            description: product.description || "",
            category: product.category?._id || product.category || "",
            subcategory: product.subcategory?._id || product.subcategory || "",
            brand: product.brand || "",
            specifications: product.specifications || [],
            keyFeatures: product.keyFeatures || [],
            variants: product.variants || [],
            warranty: product.warranty || "",
            returnPolicy: product.returnPolicy || "",
            isRecommended: product.isRecommended || false,
            isFeatured: product.isFeatured || false,
            isDigital: product.isDigital || false,
            status: product.status || "active",
            metaTitle: product.metaTitle || "",
            metaDescription: product.metaDescription || "",
            keywords: product.keywords || [],
            tags: product.tags || [],
            existingImages: product.images || [],
            imagesToDelete: [],
            newImageFiles: [],
          });
        } else {
          setError("Product not found");
        }

        setCategories(categoriesData.categories || categoriesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load product data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
          mrp:0,
          attributes: { color: "", size: "", model: "" },
          images: [],
          specifications: [],
          keyFeatures: [],
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
    const remaining =
      maxImages -
      (formData.existingImages.length + formData.newImageFiles.length);
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

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      newImageFiles: [...prev.newImageFiles, ...validFiles],
    }));
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

  const handleDeleteExistingImage = (image) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(
        (img) => img.public_id !== image.public_id,
      ),
      imagesToDelete: [...prev.imagesToDelete, image.public_id],
    }));
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData((prev) => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

      setSaving(true);

      const cleanedVariants = formData.variants.filter(
        (v) => v.sku || v.price
      );
      if (cleanedVariants.length === 0) {
        setError("At least one variant is required");
        return;
      }

      const updateData = {
        name: formData.name,
        slug: formData.slug,
        productKey: formData.productKey,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        specifications: formData.specifications.filter((s) => s.key || s.value),
        keyFeatures: formData.keyFeatures.filter((kf) => kf.key || kf.value),
        variants: cleanedVariants.map((v) => ({
          sku: v.sku,
          price: v.price ? parseFloat(v.price) : 0,
          mrp: v.mrp ? parseFloat(v.mrp) : undefined,
          currency: v.currency || "INR",
          attributes: {
            color: v.attributes?.color || undefined,
            size: v.attributes?.size || undefined,
            model: v.attributes?.model || undefined,
          },
          images: v.images || [],
          specifications: v.specifications || [],
          keyFeatures: v.keyFeatures || [],
          isActive: v.isActive !== undefined ? v.isActive : true,
        })),
        warranty: formData.warranty,
        returnPolicy: formData.returnPolicy,
        isRecommended: !!formData.isRecommended,
        isFeatured: !!formData.isFeatured,
        isDigital: !!formData.isDigital,
        status: formData.status,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        keywords:
          formData.keywords.length > 0 ? formData.keywords : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      if (
        formData.newImageFiles.length > 0 ||
        formData.imagesToDelete.length > 0
      ) {
        updateData.imagesToDelete = formData.imagesToDelete;
        updateData.images = formData.newImageFiles;
      }

      await productService.updateProduct(id, updateData);

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        navigate(`/admin/products/details/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product?",
      )
    ) {
      try {
        await productService.deleteProduct(id);
        navigate("/admin/products/list");
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            padding: "32px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
            style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}
          >
            Loading product...
          </div>
        </div>
      </div>
    );
  }

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
              Edit Product
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Update product information and images
            </p>
          </div>
          <Link
            to={`/admin/products/details/${id}`}
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
            Back to Details
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
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          {saving && (
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
                  Updating product...
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "32px" }}>
            {/* Product Images */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#111827",
                }}
              >
                Product Images
              </h3>

              {/* Existing Images */}
              {formData.existingImages.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "12px",
                      color: "#374151",
                    }}
                  >
                    Current Images
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {formData.existingImages.map((image) => (
                      <div
                        key={image.public_id}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(image)}
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
                </div>
              )}

              {/* New Images Preview */}
              {imagePreviews.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "12px",
                      color: "#374151",
                    }}
                  >
                    New Images to Upload
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
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
                </div>
              )}

              {/* Upload Area */}
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
                  padding: "32px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#eff6ff" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <MdCloudUpload
                  size={36}
                  style={{ color: "#9ca3af", marginBottom: "12px" }}
                />
                <div
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Add more images
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  {formData.existingImages.length +
                    formData.newImageFiles.length}
                  /5 images
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
            </div>

            {/* Name & Basic Info - Same as Create */}
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
                disabled={saving}
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
                  URL Slug*
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
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
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  disabled={saving}
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
            </div>

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
    }}
    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
  >
    Label Text
  </label>
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
                  disabled={saving}
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
                  <option value="preorder">Pre-order</option>
                </select>
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

            {/* Warranty & Return Policy */}
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
                  Specifications
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
                  + Add
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
                    placeholder="Key"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
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
                  Key Features
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
                  + Add
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


            {/* Tags & Keywords */}
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

            {/* Danger Zone */}
            <div
              style={{
                padding: "24px",
                border: "2px solid #fecaca",
                borderRadius: "12px",
                backgroundColor: "#fef2f2",
                marginBottom: "32px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#dc2626",
                }}
              >
                Danger Zone
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#991b1b",
                  marginBottom: "16px",
                }}
              >
                Once you delete a product, this action cannot be undone. Please
                be certain.
              </p>
              <button
                type="button"
                onClick={handleDeleteProduct}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MdDelete size={16} />
                Delete Product
              </button>
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
              to={`/admin/products/details/${id}`}
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
              disabled={saving}
              style={{
                padding: "10px 24px",
                backgroundColor: saving ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MdSave size={16} />
              {saving ? "Saving..." : "Save Changes"}
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

export default ProductEdit;

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdSave,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdAdd,
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
    brand: "",
    modelNumber: "",
    mrp: "",
    sellingPrice: "",
    currency: "INR",
    sku: "",
    stockQuantity: 0,
    specifications: [],
    keyFeatures: [],
    variants: [],
    dimensions: { weight: "", length: "", width: "", height: "", unit: "cm" },
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
    existingImages: [], // Cloudinary se aayi hain
    imagesToDelete: [], // public_ids jo delete karni hain
    newImageFiles: [], // Naye File objects
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [priceValidationMessage, setPriceValidationMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  /* ===== FETCH PRODUCT + CATEGORIES ===== */
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
            brand: product.brand || "",
            modelNumber: product.modelNumber || "",
            mrp: product.mrp || "",
            sellingPrice: product.sellingPrice || "",
            currency: product.currency || "INR",
            sku: product.sku || "",
            stockQuantity: product.stockQuantity || 0,
            specifications: product.specifications || [],
            keyFeatures: product.keyFeatures || [],
            variants: product.variants || [],
            dimensions: product.dimensions || {
              weight: "",
              length: "",
              width: "",
              height: "",
              unit: "cm",
            },
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

    if (id) fetchData();
  }, [id]);

  /* ===== CLEANUP BLOB URLs ON UNMOUNT ===== */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  /* ===== HELPERS ===== */
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const validatePricing = (sellingPrice, mrp) => {
    if (sellingPrice && mrp && parseFloat(sellingPrice) > parseFloat(mrp)) {
      setPriceValidationMessage("⚠️ Selling price cannot be higher than MRP");
    } else {
      setPriceValidationMessage("");
    }
  };

  /* ===== INPUT HANDLERS ===== */
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
        const sp = name === "sellingPrice" ? val : newData.sellingPrice;
        const mrp = name === "mrp" ? val : newData.mrp;
        validatePricing(sp, mrp);
      }
      return newData;
    });
  };

  /* ===== SPECIFICATIONS ===== */
  const handleSpecificationChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: updated }));
  };
  const addSpecification = () =>
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  const removeSpecification = (index) =>
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));

  /* ===== KEY FEATURES ===== */
  const handleKeyFeatureChange = (index, field, value) => {
    const updated = [...formData.keyFeatures];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, keyFeatures: updated }));
  };
  const addKeyFeature = () =>
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, { key: "", value: "" }],
    }));
  const removeKeyFeature = (index) =>
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));

  /* ===== VARIANTS ===== */
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (!updatedVariants[index][parent]) updatedVariants[index][parent] = {};
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleVariantSpecChange = (variantIndex, specIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    if (!updatedVariants[variantIndex].specifications)
      updatedVariants[variantIndex].specifications = [];
    updatedVariants[variantIndex].specifications[specIndex][field] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariantSpecification = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    if (!updatedVariants[variantIndex].specifications)
      updatedVariants[variantIndex].specifications = [];
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

  const addVariant = () =>
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
          attributes: { color: "", size: "", model: "" },
          images: [],
          specifications: [],
          isActive: true,
        },
      ],
    }));

  const removeVariant = (index) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

  /* ===== IMAGE HANDLERS ===== */
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

  // Existing image remove — public_id ko imagesToDelete mein daalo
  const handleDeleteExistingImage = (image) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(
        (img) => img.public_id !== image.public_id,
      ),
      imagesToDelete: [...prev.imagesToDelete, image.public_id],
    }));
  };

  // New image preview remove
  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData((prev) => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    /* ===== CLIENT SIDE VALIDATION ===== */
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

    setSaving(true);

    try {
      /* ===== VARIANTS CLEAN + VALIDATE ===== */
      const cleanedVariants = formData.variants.filter(
        (v) =>
          (v.sku && v.sku.trim() !== "") ||
          (v.price && parseFloat(v.price) > 0) ||
          (v.attributes?.color && v.attributes.color.trim() !== "") ||
          (v.attributes?.size && v.attributes.size.trim() !== "") ||
          (v.attributes?.model && v.attributes.model.trim() !== "") ||
          (v.stockQuantity && parseInt(v.stockQuantity) > 0),
      );

      const isVariantProduct = cleanedVariants.length > 0;

      /* ===== BUILD updateData ===== */
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        productKey: formData.productKey,
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

        // Images — backend ke liye teen alag fields
        imagesToDelete: formData.imagesToDelete, // public_ids (JSON array)
        newImageFiles: formData.newImageFiles, // File objects (FormData mein jayenge)
      };

      if (isVariantProduct) {
        updateData.variants = cleanedVariants.map((v) => {
          const base = formData.productKey || formData.slug;
          const colorPart = v.attributes?.color || "NA";
          const sizePart = v.attributes?.size || "NA";

          const variantSku =
            v.sku && v.sku.trim() !== ""
              ? v.sku
              : `${base}-${colorPart}-${sizePart}-${Date.now()}`;

          const variantPrice =
            v.price && parseFloat(v.price) > 0 ? parseFloat(v.price) : 0;

          return {
            sku: variantSku,
            price: variantPrice,
            mrp: v.mrp && parseFloat(v.mrp) > 0 ? parseFloat(v.mrp) : undefined,
            stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity) : 0,
            currency: "INR",
            dimensions: {
              weight: v.dimensions?.weight
                ? parseFloat(v.dimensions.weight)
                : undefined,
              length: v.dimensions?.length
                ? parseFloat(v.dimensions.length)
                : undefined,
              width: v.dimensions?.width
                ? parseFloat(v.dimensions.width)
                : undefined,
              height: v.dimensions?.height
                ? parseFloat(v.dimensions.height)
                : undefined,
              unit: v.dimensions?.unit || "cm",
            },
            attributes: {
              color: v.attributes?.color || undefined,
              size: v.attributes?.size || undefined,
              model: v.attributes?.model || undefined,
            },
            images: v.images || [],
            specifications:
              v.specifications?.filter((s) => s.key || s.value) || [],
            isActive: v.isActive !== undefined ? v.isActive : true,
          };
        });
      } else {
        // Non-variant product fields
        updateData.sku =
          formData.sku || `${formData.productKey}-main-${Date.now()}`;
        updateData.sellingPrice = formData.sellingPrice
          ? parseFloat(formData.sellingPrice)
          : undefined;
        updateData.mrp = formData.mrp ? parseFloat(formData.mrp) : undefined;
        updateData.stockQuantity = formData.stockQuantity
          ? parseInt(formData.stockQuantity)
          : 0;
        updateData.dimensions = {
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
        };
      }

      /* ===== API CALL ===== */
      // productService.updateProduct internally banayega FormData:
      //   - simpleFields   → formData.append(key, value)
      //   - jsonFields     → formData.append(key, JSON.stringify(value))
      //   - newImageFiles  → formData.append("images", file) for each
      await productService.updateProduct(id, updateData);

      setSuccess("Product updated successfully!");
      setTimeout(() => navigate(`/admin/products/details/${id}`), 1500);
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

  /* ===== DELETE ===== */
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

  /* ===== LOADING STATE ===== */
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
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div
            style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}
          >
            Loading product...
          </div>
        </div>
      </div>
    );
  }

  /* ===== RENDER ===== */
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 4px 0",
                color: "#fff",
              }}
            >
              Edit Product
            </h1>
            <p style={{ fontSize: "14px", color: "#e0e7ff", margin: 0 }}>
              Update product information and images
            </p>
          </div>
          <Link
            to={`/admin/products/details/${id}`}
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
            }}
          >
            <MdArrowBack size={18} /> Back to Details
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
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "18px" }}>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          {/* Saving Overlay */}
          {saving && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
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
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
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
                />
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Updating product...
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "8px",
                  }}
                >
                  Please wait while we save your changes
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: "32px" }}>
            {/* ===== PRODUCT IMAGES ===== */}
            <div style={{ marginBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "18px",
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
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {formData.existingImages.map((image) => (
                      <div
                        key={image.public_id}
                        style={{
                          position: "relative",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "2px solid #e5e7eb",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          style={{
                            width: "100%",
                            height: "140px",
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
                </div>
              )}

              {/* New Image Previews */}
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
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "2px solid #e5e7eb",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "140px",
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
                    ? "2px dashed #667eea"
                    : "2px dashed #d1d5db",
                  borderRadius: "12px",
                  padding: "48px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#f5f3ff" : "#fafafa",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
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
                    {dragOver ? "Drop images here" : "Add more images"}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      marginBottom: "12px",
                    }}
                  >
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
                    {formData.existingImages.length +
                      formData.newImageFiles.length}
                    /5 images
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
            </div>

            {/* ===== BASIC INFORMATION ===== */}
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
                    disabled={saving}
                    placeholder="e.g., Samsung Galaxy S24"
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
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(102,126,234,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Product Key *
                    </label>
                    <input
                      type="text"
                      name="productKey"
                      value={formData.productKey}
                      onChange={handleInputChange}
                      required
                      disabled={saving}
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
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
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
                      disabled={saving}
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
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

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
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      disabled={saving}
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
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
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
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
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
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
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
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(102,126,234,0.1)";
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

            {/* ===== SPECIFICATIONS ===== */}
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
                  <MdAdd size={18} /> Add Specification
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
                    No specifications added yet. Click "Add Specification" to
                    start.
                  </p>
                </div>
              ) : (
                formData.specifications.map((spec, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
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
                        handleSpecificationChange(
                          index,
                          "value",
                          e.target.value,
                        )
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

            {/* ===== KEY FEATURES ===== */}
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
                  <MdAdd size={18} /> Add Feature
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
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
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

            {/* ===== PRODUCT VARIANTS ===== */}
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
                  <MdAdd size={18} /> Add Variant
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
                    No variants added. Click "Add Variant" to create product
                    variations.
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

                    {/* Attributes */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      {[
                        ["Color", "attributes.color", "Black, Blue, Red"],
                        [
                          "Size/Storage",
                          "attributes.size",
                          "128GB, 256GB, S, M, L",
                        ],
                        ["Model", "attributes.model", "S24, Pro, Basic"],
                      ].map(([label, field, placeholder]) => (
                        <div key={field}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "13px",
                              fontWeight: "500",
                              marginBottom: "6px",
                              color: "#374151",
                            }}
                          >
                            {label}
                          </label>
                          <input
                            type="text"
                            value={
                              field === "attributes.color"
                                ? variant.attributes?.color || ""
                                : field === "attributes.size"
                                  ? variant.attributes?.size || ""
                                  : variant.attributes?.model || ""
                            }
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                field,
                                e.target.value,
                              )
                            }
                            placeholder={placeholder}
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
                      ))}
                    </div>

                    {/* SKU, Pricing, Stock */}
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
                            handleVariantChange(
                              variantIndex,
                              "sku",
                              e.target.value,
                            )
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
                            handleVariantChange(
                              variantIndex,
                              "mrp",
                              e.target.value,
                            )
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
                            handleVariantChange(
                              variantIndex,
                              "price",
                              e.target.value,
                            )
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
                              e.target.value,
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
                      {[
                        ["Weight (g)", "dimensions.weight", "168"],
                        ["Length (cm)", "dimensions.length", "14.7"],
                        ["Width (cm)", "dimensions.width", "7.0"],
                        ["Height (cm)", "dimensions.height", "0.76"],
                      ].map(([label, field, placeholder]) => (
                        <div key={field}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "13px",
                              fontWeight: "500",
                              marginBottom: "6px",
                              color: "#374151",
                            }}
                          >
                            {label}
                          </label>
                          <input
                            type="number"
                            value={
                              field === "dimensions.weight"
                                ? variant.dimensions?.weight || ""
                                : field === "dimensions.length"
                                  ? variant.dimensions?.length || ""
                                  : field === "dimensions.width"
                                    ? variant.dimensions?.width || ""
                                    : variant.dimensions?.height || ""
                            }
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                field,
                                e.target.value,
                              )
                            }
                            placeholder={placeholder}
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
                      ))}
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
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) =>
                              handleVariantSpecChange(
                                variantIndex,
                                specIndex,
                                "key",
                                e.target.value,
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
                                e.target.value,
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
                              removeVariantSpecification(
                                variantIndex,
                                specIndex,
                              )
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

            {/* ===== NON-VARIANT PRICING (only if no variants) ===== */}
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
                    {[
                      ["SKU", "sku", "text", "PROD-SKU-001"],
                      ["MRP (₹)", "mrp", "number", "0.00"],
                      ["Selling Price (₹) *", "sellingPrice", "number", "0.00"],
                      ["Stock Quantity", "stockQuantity", "number", "0"],
                    ].map(([label, name, type, placeholder]) => (
                      <div key={name}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleInputChange}
                          placeholder={placeholder}
                          step={type === "number" ? "0.01" : undefined}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            border:
                              name === "sellingPrice" && priceValidationMessage
                                ? "1px solid #ef4444"
                                : "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            backgroundColor: "white",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#667eea";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(102,126,234,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d1d5db";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        {name === "sellingPrice" && priceValidationMessage && (
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
                    ))}
                  </div>
                </div>

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
                    {[
                      ["Weight (g)", "dimensions.weight"],
                      ["Length (cm)", "dimensions.length"],
                      ["Width (cm)", "dimensions.width"],
                      ["Height (cm)", "dimensions.height"],
                    ].map(([label, name]) => (
                      <div key={name}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type="number"
                          name={name}
                          value={
                            name === "dimensions.weight"
                              ? formData.dimensions.weight
                              : name === "dimensions.length"
                                ? formData.dimensions.length
                                : name === "dimensions.width"
                                  ? formData.dimensions.width
                                  : formData.dimensions.height
                          }
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
                          onFocus={(e) => {
                            e.target.style.borderColor = "#667eea";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(102,126,234,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d1d5db";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== WARRANTY & RETURN ===== */}
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
                {[
                  [
                    "warranty",
                    "Warranty *",
                    "e.g., 1 Year Manufacturer Warranty",
                  ],
                  [
                    "returnPolicy",
                    "Return Policy *",
                    "e.g., 7 Days Replacement Policy",
                  ],
                ].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#374151",
                      }}
                    >
                      {label}
                    </label>
                    <textarea
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder={placeholder}
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
                      onFocus={(e) => {
                        e.target.style.borderColor = "#667eea";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(102,126,234,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SEO & MARKETING ===== */}
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
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
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

            {/* ===== PRODUCT SETTINGS ===== */}
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
                {[
                  ["isRecommended", "⭐ Recommended Product"],
                  ["isFeatured", "🔥 Featured Product"],
                  ["isDigital", "💾 Digital Product"],
                ].map(([name, label]) => (
                  <label
                    key={name}
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
                      name={name}
                      checked={formData[name]}
                      onChange={handleInputChange}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "#667eea",
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ===== DANGER ZONE ===== */}
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
                <MdDelete size={16} /> Delete Product
              </button>
            </div>
          </div>

          {/* ===== FOOTER ACTIONS ===== */}
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
                to={`/admin/products/details/${id}`}
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
                disabled={saving}
                style={{
                  padding: "12px 32px",
                  background: saving
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: saving
                    ? "none"
                    : "0 4px 6px rgba(102,126,234,0.3)",
                }}
              >
                <MdSave size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default ProductEdit;

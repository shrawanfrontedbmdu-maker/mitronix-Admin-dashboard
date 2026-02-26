import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdSave,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdLocalOffer,
  MdEdit,
  MdCheck,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";
import { instance } from "../api/axios.config.js";

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
    allowBackorder: false,
    status: "active",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    tags: [],
    existingImages: [],
    imagesToDelete: [],
    newImageFiles: [],
  });

  // Top Deal state
  const [selectedTopDeal, setSelectedTopDeal] = useState("");
  const [originalTopDeal, setOriginalTopDeal] = useState("");
  const [topDeals, setTopDeals] = useState([]);
  const [topDealsLoading, setTopDealsLoading] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  // Create deal form
  const [newDeal, setNewDeal] = useState({ title: "", description: "" });
  const [newDealImages, setNewDealImages] = useState([]);
  const [newDealPreviews, setNewDealPreviews] = useState([]);
  const [creating, setCreating] = useState(false);

  // Edit deal state
  const [editingDeal, setEditingDeal] = useState(null); // deal object being edited
  const [editDealData, setEditDealData] = useState({
    title: "",
    description: "",
  });
  const [editDealImages, setEditDealImages] = useState([]);
  const [editDealPreviews, setEditDealPreviews] = useState([]);
  const [editDealExisting, setEditDealExisting] = useState([]);
  const [editDealToDelete, setEditDealToDelete] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState(null);

  const newDealImgRef = useRef();
  const editDealImgRef = useRef();

  // Other state
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Fetch product + categories
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
            allowBackorder: product.allowBackorder || false,
            status: product.status || "active",
            metaTitle: product.metaTitle || "",
            metaDescription: product.metaDescription || "",
            keywords: product.keywords || [],
            tags: product.tags || [],
            existingImages: product.images || [],
            imagesToDelete: [],
            newImageFiles: [],
          });
          const dealId = product.topDeal?._id || product.topDeal || "";
          setSelectedTopDeal(dealId.toString());
          setOriginalTopDeal(dealId.toString());
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

  // Fetch top deals
  const fetchTopDeals = async () => {
    try {
      setTopDealsLoading(true);
      const { data } = await instance.get("/top-deals");
      if (data.success) setTopDeals(data.topDeals || []);
    } catch (err) {
      console.error(
        "Top deals fetch error:",
        err.response?.data || err.message,
      );
    } finally {
      setTopDealsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTopDeals();
  }, [id]);
  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  // Helpers
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
  const addVariant = () =>
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sku: "",
          price: 0,
          mrp: 0,
          attributes: { color: "", size: "", model: "" },
          images: [],
          specifications: [],
          keyFeatures: [],
          isActive: true,
        },
      ],
    }));
  const removeVariant = (index) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

  const handleImageUpload = (files) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const remaining =
      5 - (formData.existingImages.length + formData.newImageFiles.length);
    const validFiles = Array.from(files)
      .slice(0, remaining)
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          setError(`Invalid file type: ${file.name}`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`File too large: ${file.name}`);
          return false;
        }
        return true;
      });
    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
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
  const handleDeleteExistingImage = (image) =>
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(
        (img) => img.public_id !== image.public_id,
      ),
      imagesToDelete: [...prev.imagesToDelete, image.public_id],
    }));
  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData((prev) => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Top Deal: Create ──────────────────────────────────────────────
  const handleCreateDeal = async () => {
    if (!newDeal.title.trim()) return;
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("title", newDeal.title.trim());
      fd.append("description", newDeal.description.trim());
      newDealImages.forEach((file, idx) =>
        fd.append(idx === 0 ? "image" : "images", file),
      );
      const { data } = await instance.post("/top-deals", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        await fetchTopDeals();
        setSelectedTopDeal(data.topDeal._id);
        setShowCreateDeal(false);
        setNewDeal({ title: "", description: "" });
        setNewDealImages([]);
        newDealPreviews.forEach((p) => URL.revokeObjectURL(p));
        setNewDealPreviews([]);
      }
    } catch (err) {
      console.error("Create deal error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create deal");
    } finally {
      setCreating(false);
    }
  };

  // ── Top Deal: Open Edit Modal ──────────────────────────────────────
  const openEditDeal = (deal) => {
    setEditingDeal(deal);
    setEditDealData({ title: deal.title, description: deal.description || "" });
    setEditDealExisting([
      ...(deal.image ? [deal.image] : []),
      ...(deal.images || []),
    ]);
    setEditDealToDelete([]);
    setEditDealImages([]);
    setEditDealPreviews([]);
  };

  const closeEditDeal = () => {
    setEditingDeal(null);
    editDealPreviews.forEach((p) => URL.revokeObjectURL(p));
    setEditDealPreviews([]);
    setEditDealImages([]);
  };

  // ── Top Deal: Update ──────────────────────────────────────────────
  const handleUpdateDeal = async () => {
    if (!editDealData.title.trim()) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append("title", editDealData.title.trim());
      fd.append("description", editDealData.description.trim());
      if (editDealToDelete.length)
        fd.append("imagesToDelete", JSON.stringify(editDealToDelete));
      editDealImages.forEach((file, idx) =>
        fd.append(idx === 0 ? "image" : "images", file),
      );
      const { data } = await instance.put(`/top-deals/${editingDeal._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        await fetchTopDeals();
        closeEditDeal();
      }
    } catch (err) {
      console.error("Update deal error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update deal");
    } finally {
      setUpdating(false);
    }
  };

  // ── Top Deal: Delete ──────────────────────────────────────────────
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;
    setDeletingDealId(dealId);
    try {
      const { data } = await instance.delete(`/top-deals/${dealId}`);
      if (data.success) {
        if (selectedTopDeal === dealId) setSelectedTopDeal("");
        if (originalTopDeal === dealId) setOriginalTopDeal("");
        await fetchTopDeals();
      }
    } catch (err) {
      console.error("Delete deal error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to delete deal");
    } finally {
      setDeletingDealId(null);
    }
  };

  // ── Top Deal: Toggle Status ───────────────────────────────────────
  const handleToggleDealStatus = async (dealId) => {
    try {
      const { data } = await instance.patch(
        `/top-deals/${dealId}/toggle-status`,
      );
      if (data.success) await fetchTopDeals();
    } catch (err) {
      console.error("Toggle deal error:", err.response?.data || err.message);
      setError("Failed to toggle deal status");
    }
  };

  // ── Top Deal: Sync on product save ────────────────────────────────
  const syncTopDeal = async () => {
    if (selectedTopDeal === originalTopDeal) return;
    try {
      if (originalTopDeal) {
        await instance.patch(`/top-deals/${originalTopDeal}/remove-product`, {
          productId: id,
        });
      }
      if (selectedTopDeal) {
        await instance.patch(`/top-deals/${selectedTopDeal}/add-product`, {
          productId: id,
        });
      }
      setOriginalTopDeal(selectedTopDeal);
    } catch (err) {
      console.error("Sync top deal error:", err.response?.data || err.message);
      throw err;
    }
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    const cleanedVariants = formData.variants.filter((v) => v.sku || v.price);
    if (cleanedVariants.length === 0) {
      setError("At least one variant is required");
      return;
    }
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        productKey: formData.productKey,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        warranty: formData.warranty,
        returnPolicy: formData.returnPolicy,
        isRecommended: !!formData.isRecommended,
        isFeatured: !!formData.isFeatured,
        isDigital: !!formData.isDigital,
        allowBackorder: !!formData.allowBackorder,
        status: formData.status,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        specifications: formData.specifications.filter((s) => s.key || s.value),
        keyFeatures: formData.keyFeatures.filter((kf) => kf.key || kf.value),
        keywords: formData.keywords.length > 0 ? formData.keywords : [],
        tags: formData.tags.length > 0 ? formData.tags : [],
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
        existingImages: formData.existingImages,
        imagesToDelete: formData.imagesToDelete,
        newImageFiles: formData.newImageFiles,
      };
      await productService.updateProduct(id, updateData);
      await syncTopDeal();
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
        setError("Failed to delete product");
      }
    }
  };

  const inp = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  if (loading)
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
          />
          <div
            style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}
          >
            Loading product...
          </div>
        </div>
      </div>
    );

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
            <MdArrowBack size={16} /> Back to Details
          </Link>
        </div>

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
                backgroundColor: "rgba(0,0,0,0.3)",
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
                />
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
            {/* Images */}
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
                          }}
                        >
                          <MdClose />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                          }}
                        >
                          <MdClose />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  {formData.existingImages.length +
                    formData.newImageFiles.length >=
                  5
                    ? "Maximum images reached"
                    : "Click or drag to add images"}
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
                disabled={
                  formData.existingImages.length +
                    formData.newImageFiles.length >=
                  5
                }
              />
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
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={saving}
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Slug + Product Key */}
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
                  style={inp}
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
                  disabled={saving}
                  style={inp}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* Brand + Category */}
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
                  style={inp}
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
                  style={{ ...inp, backgroundColor: "white" }}
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

            {/* Status */}
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
                  style={{ ...inp, backgroundColor: "white" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                style={{ ...inp, resize: "vertical", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Warranty + Return Policy */}
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
                  ...inp,
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
                style={{ ...inp, resize: "vertical", fontFamily: "inherit" }}
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
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Variants */}
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
                        margin: 0,
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
                    {["color", "size", "model"].map((attr) => (
                      <div key={attr}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginBottom: "6px",
                            color: "#374151",
                            textTransform: "capitalize",
                          }}
                        >
                          {attr}
                        </label>
                        <input
                          type="text"
                          value={variant.attributes?.[attr] || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              `attributes.${attr}`,
                              e.target.value,
                            )
                          }
                          placeholder={
                            attr === "color"
                              ? "e.g. Red"
                              : attr === "size"
                                ? "e.g. M"
                                : "e.g. Pro"
                          }
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    ))}
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
                        SKU*
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
                          boxSizing: "border-box",
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
                        Price*
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
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
                        MRP
                      </label>
                      <input
                        type="number"
                        value={variant.mrp || ""}
                        onChange={(e) =>
                          handleVariantChange(index, "mrp", e.target.value)
                        }
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                }}
              >
                + Add Variant
              </button>
            </div>

            {/* Tags + Keywords */}
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
                  placeholder="electronics, smartphone"
                  style={inp}
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
                  style={inp}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
            </div>

            {/* ══════════════ TOP DEAL SECTION ══════════════ */}
            <div
              style={{
                marginBottom: "32px",
                padding: "20px",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                backgroundColor: "#fffbeb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <MdLocalOffer size={18} color="#f59e0b" />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#92400e",
                    }}
                  >
                    Top Deal
                  </span>
                  {selectedTopDeal !== originalTopDeal && (
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "1px 8px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "99px",
                        fontWeight: "600",
                      }}
                    >
                      ● Unsaved
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateDeal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    backgroundColor: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  + New Deal
                </button>
              </div>

              {/* Deals list with edit/delete/toggle */}
              {topDealsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  Loading deals...
                </div>
              ) : topDeals.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No deals yet — create one above
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* None option */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      border: `2px solid ${!selectedTopDeal ? "#f59e0b" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: !selectedTopDeal ? "#fffbeb" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="topDeal"
                      value=""
                      checked={!selectedTopDeal}
                      onChange={() => setSelectedTopDeal("")}
                      style={{
                        width: "15px",
                        height: "15px",
                        accentColor: "#f59e0b",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      None — no deal linked
                    </span>
                  </label>

                  {topDeals.map((deal) => (
                    <div
                      key={deal._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        border: `2px solid ${selectedTopDeal === deal._id ? "#f59e0b" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        backgroundColor:
                          selectedTopDeal === deal._id ? "#fffbeb" : "white",
                      }}
                    >
                      {/* Radio */}
                      <input
                        type="radio"
                        name="topDeal"
                        value={deal._id}
                        checked={selectedTopDeal === deal._id}
                        onChange={() => setSelectedTopDeal(deal._id)}
                        style={{
                          width: "15px",
                          height: "15px",
                          accentColor: "#f59e0b",
                          flexShrink: 0,
                          cursor: "pointer",
                        }}
                      />

                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {deal.image?.url ? (
                          <img
                            src={deal.image.url}
                            alt={deal.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#f9fafb",
                            }}
                          >
                            <MdLocalOffer size={14} color="#d1d5db" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {deal.title}
                        </div>
                        {deal.description && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {deal.description}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          {deal.products?.length || 0} product(s)
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "99px",
                          backgroundColor: deal.isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: deal.isActive ? "#166534" : "#991b1b",
                          fontWeight: "600",
                          flexShrink: 0,
                        }}
                      >
                        {deal.isActive ? "Active" : "Inactive"}
                      </span>

                      {/* Actions */}
                      <div
                        style={{ display: "flex", gap: "4px", flexShrink: 0 }}
                      >
                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleDealStatus(deal._id)}
                          title={deal.isActive ? "Deactivate" : "Activate"}
                          style={{
                            padding: "5px",
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: deal.isActive ? "#10b981" : "#9ca3af",
                          }}
                        >
                          {deal.isActive ? (
                            <MdToggleOn size={18} />
                          ) : (
                            <MdToggleOff size={18} />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditDeal(deal)}
                          title="Edit deal"
                          style={{
                            padding: "5px",
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: "#3b82f6",
                          }}
                        >
                          <MdEdit size={16} />
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDeal(deal._id)}
                          disabled={deletingDealId === deal._id}
                          title="Delete deal"
                          style={{
                            padding: "5px",
                            backgroundColor: "white",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: "#ef4444",
                          }}
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════════ CREATE DEAL MODAL ══════════════ */}
            {showCreateDeal && (
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
                  zIndex: 9998,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Create New Deal
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateDeal(false)}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#f3f4f6",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MdClose size={18} />
                    </button>
                  </div>
                  <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "5px",
                        }}
                      >
                        Title*
                      </label>
                      <input
                        type="text"
                        value={newDeal.title}
                        onChange={(e) =>
                          setNewDeal((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="e.g., Summer Sale"
                        style={{ ...inp, fontSize: "13px" }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#f59e0b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "5px",
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={newDeal.description}
                        onChange={(e) =>
                          setNewDeal((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Deal description..."
                        rows="3"
                        style={{
                          ...inp,
                          fontSize: "13px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#f59e0b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "8px",
                        }}
                      >
                        Images{" "}
                        <span style={{ color: "#9ca3af" }}>
                          (multiple allowed)
                        </span>
                      </label>
                      {newDealPreviews.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(80px, 1fr))",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          {newDealPreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                aspectRatio: "1",
                              }}
                            >
                              <img
                                src={preview}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(preview);
                                  setNewDealPreviews((p) =>
                                    p.filter((_, i) => i !== idx),
                                  );
                                  setNewDealImages((p) =>
                                    p.filter((_, i) => i !== idx),
                                  );
                                }}
                                style={{
                                  position: "absolute",
                                  top: "3px",
                                  right: "3px",
                                  width: "18px",
                                  height: "18px",
                                  backgroundColor: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MdClose size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        onClick={() => newDealImgRef.current.click()}
                        style={{
                          border: "2px dashed #f59e0b",
                          borderRadius: "10px",
                          padding: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: "#fffbeb",
                        }}
                      >
                        <MdCloudUpload size={24} color="#f59e0b" />
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#92400e",
                            marginTop: "4px",
                          }}
                        >
                          Click to upload
                        </div>
                      </div>
                      <input
                        ref={newDealImgRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setNewDealImages((p) => [...p, ...files]);
                          setNewDealPreviews((p) => [
                            ...p,
                            ...files.map((f) => URL.createObjectURL(f)),
                          ]);
                          e.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px 24px",
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowCreateDeal(false)}
                      style={{
                        padding: "9px 18px",
                        backgroundColor: "white",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateDeal}
                      disabled={creating || !newDeal.title.trim()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "9px 20px",
                        backgroundColor:
                          creating || !newDeal.title.trim()
                            ? "#9ca3af"
                            : "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: creating ? "not-allowed" : "pointer",
                      }}
                    >
                      <MdCheck size={15} />{" "}
                      {creating ? "Creating..." : "Create & Link"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ EDIT DEAL MODAL ══════════════ */}
            {editingDeal && (
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
                  zIndex: 9998,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      Edit Deal: {editingDeal.title}
                    </div>
                    <button
                      type="button"
                      onClick={closeEditDeal}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#f3f4f6",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MdClose size={18} />
                    </button>
                  </div>
                  <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "5px",
                        }}
                      >
                        Title*
                      </label>
                      <input
                        type="text"
                        value={editDealData.title}
                        onChange={(e) =>
                          setEditDealData((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Deal title"
                        style={{ ...inp, fontSize: "13px" }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "5px",
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={editDealData.description}
                        onChange={(e) =>
                          setEditDealData((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        rows="3"
                        style={{
                          ...inp,
                          fontSize: "13px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </div>
                    {/* Existing images */}
                    {editDealExisting.length > 0 && (
                      <div style={{ marginBottom: "14px" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "#374151",
                            marginBottom: "8px",
                          }}
                        >
                          Current Images
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(80px, 1fr))",
                            gap: "8px",
                          }}
                        >
                          {editDealExisting.map((img, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                aspectRatio: "1",
                              }}
                            >
                              <img
                                src={img.url}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditDealExisting((p) =>
                                    p.filter((_, i) => i !== idx),
                                  );
                                  setEditDealToDelete((p) => [
                                    ...p,
                                    img.public_id,
                                  ]);
                                }}
                                style={{
                                  position: "absolute",
                                  top: "3px",
                                  right: "3px",
                                  width: "18px",
                                  height: "18px",
                                  backgroundColor: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MdClose size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* New images */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "8px",
                        }}
                      >
                        Add More Images
                      </label>
                      {editDealPreviews.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(80px, 1fr))",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          {editDealPreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                aspectRatio: "1",
                              }}
                            >
                              <img
                                src={preview}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(preview);
                                  setEditDealPreviews((p) =>
                                    p.filter((_, i) => i !== idx),
                                  );
                                  setEditDealImages((p) =>
                                    p.filter((_, i) => i !== idx),
                                  );
                                }}
                                style={{
                                  position: "absolute",
                                  top: "3px",
                                  right: "3px",
                                  width: "18px",
                                  height: "18px",
                                  backgroundColor: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MdClose size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        onClick={() => editDealImgRef.current.click()}
                        style={{
                          border: "2px dashed #3b82f6",
                          borderRadius: "10px",
                          padding: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: "#eff6ff",
                        }}
                      >
                        <MdCloudUpload size={24} color="#3b82f6" />
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#1d4ed8",
                            marginTop: "4px",
                          }}
                        >
                          Click to upload
                        </div>
                      </div>
                      <input
                        ref={editDealImgRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setEditDealImages((p) => [...p, ...files]);
                          setEditDealPreviews((p) => [
                            ...p,
                            ...files.map((f) => URL.createObjectURL(f)),
                          ]);
                          e.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px 24px",
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeEditDeal}
                      style={{
                        padding: "9px 18px",
                        backgroundColor: "white",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateDeal}
                      disabled={updating || !editDealData.title.trim()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "9px 20px",
                        backgroundColor:
                          updating || !editDealData.title.trim()
                            ? "#9ca3af"
                            : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: updating ? "not-allowed" : "pointer",
                      }}
                    >
                      <MdCheck size={15} />{" "}
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              {[
                { name: "isRecommended", label: "Recommended Product" },
                { name: "isFeatured", label: "Featured Product" },
                { name: "isDigital", label: "Digital Product" },
                { name: "allowBackorder", label: "Allow Backorder" },
              ].map(({ name, label }) => (
                <label
                  key={name}
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
                    name={name}
                    checked={!!formData[name]}
                    onChange={handleInputChange}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  {label}
                </label>
              ))}
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
                Once you delete this product, the action cannot be undone.
                Please be certain before proceeding.
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

          {/* Footer */}
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
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProductEdit;

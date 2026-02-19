import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdSave, MdArrowBack, MdCloudUpload } from "react-icons/md";
import { categoryService } from "../../api/categoryService.js";
import { subcategoryService } from "../../api/subcategoryService.js";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

function EditCategory() {
  // Subcategory state
  const [subcategories, setSubcategories] = useState([]);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [subcatLoading, setSubcatLoading] = useState(false);
  const [subcatError, setSubcatError] = useState("");
  const [editSubcat, setEditSubcat] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const mainInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainDragOver, setMainDragOver] = useState(false);

  const [formData, setFormData] = useState({
    categoryKey: "",
    pageTitle: "",
    pageSubtitle: "",
    description: "",
    status: "active",
    mainImageFile: null,
    mainImagePreview: null,
  });

  const [errors, setErrors] = useState({});

  // ===== Get full image URL =====
  const getImageUrl = (img) => {
    if (!img) return "/images/placeholder.png";
    if (img.startsWith("http")) return img;
    return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  // ===== Fetch category and subcategories =====
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryService.getCategoryById(id);
        console.log(data);
        setFormData({
          categoryKey: data.categoryKey,
          pageTitle: data.pageTitle,
          pageSubtitle: data.pageSubtitle || "",
          description: data.description || "",
          status: data.status || "active",
          mainImageFile: null,
          mainImagePreview: getImageUrl(data.image),
        });
      } catch (err) {
        console.error("Failed to fetch category:", err);
        alert("Failed to load category");
        navigate("/categories");
      } finally {
        setLoading(false);
      }
    };
    const fetchSubcategories = async () => {
      setSubcatLoading(true);
      try {
        const subs = await subcategoryService.getSubcategoriesByCategory(id);
        // Only keep valid subcategory objects
        console.log("subs", subs);
        const filtered = Array.isArray(subs)
          ? subs.filter((sc) => sc && sc._id && sc.name)
          : [];
        setSubcategories(filtered);
      } catch (err) {
        setSubcatError("Failed to load subcategories");
        setSubcategories([]);
      } finally {
        setSubcatLoading(false);
      }
    };
    fetchCategory();
    fetchSubcategories();
  }, [id, navigate]);

  // ===== Subcategory Handlers =====
  const handleAddSubcategory = async () => {
    if (!newSubcatName.trim()) return;
    setSubcatLoading(true);
    try {
      // Slug: backend requires slug, so generate from name
      const slug = newSubcatName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
      const payload = { name: newSubcatName.trim(), slug, category: id };
      const res = await subcategoryService.createSubcategory(payload);
      // Backend returns { success, subcategory }
      if (res && res.subcategory) {
        setSubcategories((prev) => [...prev, res.subcategory]);
        setNewSubcatName("");
        setSubcatError("");
      } else {
        setSubcatError("Failed to add subcategory");
      }
    } catch (err) {
      setSubcatError("Failed to add subcategory");
    } finally {
      setSubcatLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcatId) => {
    if (!window.confirm("Delete this subcategory?")) return;
    setSubcatLoading(true);
    try {
      const res = await subcategoryService.deleteSubcategory(subcatId);
      // Backend returns { success, message }
      if (res && res.success) {
        setSubcategories((prev) => prev.filter((sc) => sc._id !== subcatId));
        setSubcatError("");
      } else {
        setSubcatError("Failed to delete subcategory");
      }
    } catch (err) {
      setSubcatError("Failed to delete subcategory");
    } finally {
      setSubcatLoading(false);
    }
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryKey.trim()) {
      newErrors.categoryKey = "Category Key is required";
    } else if (!/^[a-z0-9-_]+$/.test(formData.categoryKey.toLowerCase())) {
      newErrors.categoryKey =
        "Only lowercase letters, numbers, hyphens, and underscores allowed";
    }

    if (!formData.pageTitle.trim()) {
      newErrors.pageTitle = "Page Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Input Change =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ===== Image Handler =====
  const handleMainImageSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      mainImageFile: file,
      mainImagePreview: URL.createObjectURL(file),
    }));
  };

  // ===== REMOVE IMAGE =====
  const handleRemoveImage = () => {
    if (formData.mainImagePreview) {
      URL.revokeObjectURL(formData.mainImagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      mainImageFile: null,
      mainImagePreview: null,
    }));
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append("categoryKey", formData.categoryKey.toLowerCase().trim());
      data.append("pageTitle", formData.pageTitle.trim());
      data.append("status", formData.status);

      if (formData.pageSubtitle.trim()) {
        data.append("pageSubtitle", formData.pageSubtitle.trim());
      }

      if (formData.description.trim()) {
        data.append("description", formData.description.trim());
      }

      if (formData.mainImageFile) {
        data.append("image", formData.mainImageFile);
      }

      await categoryService.updateCategory(id, data);

      alert("Category updated successfully!");
      navigate("/admin/categories");
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update category",
      );
    } finally {
      setSaving(false);
    }
  };

  // // ===== Loading State =====
  // if (loading) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       minHeight: '100vh',
  //       backgroundColor: '#f9fafb'
  //     }}>
  //       <div style={{
  //         padding: '32px',
  //         backgroundColor: 'white',
  //         borderRadius: '12px',
  //         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  //         textAlign: 'center'
  //       }}>
  //         <div style={{
  //           width: '40px',
  //           height: '40px',
  //           border: '4px solid #f3f4f6',
  //           borderTop: '4px solid #3b82f6',
  //           borderRadius: '50%',
  //           animation: 'spin 1s linear infinite',
  //           margin: '0 auto 16px'
  //         }}></div>
  //         <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Loading category...</div>
  //       </div>

  //       {/* SUBCATEGORY MANAGEMENT */}
  //       <div style={{ margin: '32px 0' }}>
  //         <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>Subcategories</h3>
  //         {subcatError && <div style={{ color: '#ef4444', marginBottom: 8 }}>{subcatError}</div>}
  //         {subcatLoading ? (
  //           <div style={{ color: '#6b7280' }}>Loading subcategories...</div>
  //         ) : (
  //           <>
  //             <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
  //               {subcategories.length === 0 && (
  //                 <li style={{ color: '#6b7280', fontSize: 14 }}>No subcategories found.</li>
  //               )}
  //               {subcategories.map((sc) => (
  //                 <SubcategoryItem
  //                   key={sc._id}
  //                   subcategory={sc}
  //                   onUpdate={async (updated) => {
  //                     setSubcatLoading(true);
  //                     try {
  //                       const res = await subcategoryService.updateSubcategory(sc._id, updated);
  //                       if (res && res.success && res.subcategory) {
  //                         setSubcategories((prev) => prev.map((item) => item._id === sc._id ? res.subcategory : item));
  //                         setSubcatError("");
  //                       } else {
  //                         setSubcatError("Failed to update subcategory");
  //                       }
  //                     } catch {
  //                       setSubcatError("Failed to update subcategory");
  //                     } finally {
  //                       setSubcatLoading(false);
  //                     }
  //                   }}
  //                   onDelete={() => handleDeleteSubcategory(sc._id)}
  //                   loading={subcatLoading}
  //                 />
  //               ))}
  //             </ul>
  //             <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
  //               <input
  //                 type="text"
  //                 value={newSubcatName}
  //                 onChange={e => setNewSubcatName(e.target.value)}
  //                 placeholder="New subcategory name"
  //                 style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, flex: 1 }}
  //                 disabled={subcatLoading}
  //               />
  //               <button
  //                 type="button"
  //                 onClick={handleAddSubcategory}
  //                 style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
  //                 disabled={subcatLoading || !newSubcatName.trim()}
  //               >Add</button>
  //             </div>
  //           </>
  //         )}
  //       </div>
  //       <style>
  //         {`
  //           @keyframes spin {
  //             0% { transform: rotate(0deg); }
  //             100% { transform: rotate(360deg); }
  //           }
  //         `}
  //       </style>
  //     </div>
  //   );
  // }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* HEADER */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "#111827",
              }}
            >
              Edit Category
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Update category information
            </p>
          </div>

          <button
            onClick={() => navigate("/categories")}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            <MdArrowBack size={18} />
            Back to List
          </button>
        </div>

        {/* FORM CARD */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
            {/* BASIC INFO */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 16px 0",
                  color: "#111827",
                }}
              >
                Basic Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                {/* Category Key */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#374151",
                    }}
                  >
                    Category Key <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="categoryKey"
                    value={formData.categoryKey}
                    onChange={handleChange}
                    placeholder="e.g., electronics"
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${errors.categoryKey ? "#ef4444" : "#d1d5db"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: saving ? "#f9fafb" : "white",
                    }}
                    onFocus={(e) =>
                      !errors.categoryKey &&
                      (e.target.style.borderColor = "#3b82f6")
                    }
                    onBlur={(e) =>
                      !errors.categoryKey &&
                      (e.target.style.borderColor = "#d1d5db")
                    }
                  />
                  {errors.categoryKey && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "4px",
                      }}
                    >
                      {errors.categoryKey}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    Lowercase letters, numbers, hyphens only
                  </p>
                </div>

                {/* Page Title */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#374151",
                    }}
                  >
                    Page Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="pageTitle"
                    value={formData.pageTitle}
                    onChange={handleChange}
                    placeholder="e.g., Electronics"
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${errors.pageTitle ? "#ef4444" : "#d1d5db"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: saving ? "#f9fafb" : "white",
                    }}
                    onFocus={(e) =>
                      !errors.pageTitle &&
                      (e.target.style.borderColor = "#3b82f6")
                    }
                    onBlur={(e) =>
                      !errors.pageTitle &&
                      (e.target.style.borderColor = "#d1d5db")
                    }
                  />
                  {errors.pageTitle && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "4px",
                      }}
                    >
                      {errors.pageTitle}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#374151",
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: saving ? "#f9fafb" : "white",
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 16px 0",
                  color: "#111827",
                }}
              >
                Additional Information
              </h3>

              <div style={{ display: "grid", gap: "16px" }}>
                {/* Page Subtitle */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#374151",
                    }}
                  >
                    Page Subtitle
                  </label>
                  <input
                    type="text"
                    name="pageSubtitle"
                    value={formData.pageSubtitle}
                    onChange={handleChange}
                    placeholder="Optional subtitle for the category"
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: saving ? "#f9fafb" : "white",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#374151",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a detailed description of the category..."
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: saving ? "#f9fafb" : "white",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 16px 0",
                  color: "#111827",
                }}
              >
                Category Image
              </h3>

              {!formData.mainImagePreview ? (
                <div
                  onClick={() => !saving && mainInputRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    !saving && setMainDragOver(true);
                  }}
                  onDragLeave={() => setMainDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMainDragOver(false);
                    !saving && handleMainImageSelect(e.dataTransfer.files[0]);
                  }}
                  style={{
                    border: `2px dashed ${mainDragOver ? "#3b82f6" : "#d1d5db"}`,
                    borderRadius: "8px",
                    padding: "32px",
                    textAlign: "center",
                    cursor: saving ? "not-allowed" : "pointer",
                    backgroundColor: mainDragOver ? "#eff6ff" : "#f9fafb",
                    transition: "all 0.2s",
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  <MdCloudUpload
                    size={48}
                    style={{
                      color: mainDragOver ? "#3b82f6" : "#9ca3af",
                      margin: "0 auto 12px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Click to upload or drag and drop
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    PNG, JPG, WEBP up to 2MB
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <img
                    src={formData.mainImagePreview}
                    alt="Preview"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.5 : 1,
                    }}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => !saving && mainInputRef.current.click()}
                    disabled={saving}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.5 : 1,
                    }}
                  >
                    Change Image
                  </button>
                </div>
              )}

              <input
                ref={mainInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleMainImageSelect(e.target.files[0])}
                disabled={saving}
              />
            </div>
            {/* SUBCATEGORY MANAGEMENT */}
            <div style={{ margin: "32px 0" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#111827",
                }}
              >
                Subcategories
              </h3>
              {subcatError && (
                <div style={{ color: "#ef4444", marginBottom: 8 }}>
                  {subcatError}
                </div>
              )}
              <SubcategoryForm
                key={editSubcat ? editSubcat._id : "new"}
                mode={editSubcat ? "edit" : "create"}
                initial={
                  editSubcat || {
                    name: "",
                    slug: "",
                    description: "",
                    image: null,
                  }
                }
                onSubmit={async (fields) => {
                  setSubcatLoading(true);
                  try {
                    if (editSubcat) {
                      // Update
                      const res = await subcategoryService.updateSubcategory(
                        editSubcat._id,
                        fields,
                      );
                      if (res && res.success && res.subcategory) {
                        setSubcategories((prev) =>
                          prev.map((item) =>
                            item._id === editSubcat._id
                              ? res.subcategory
                              : item,
                          ),
                        );
                        setEditSubcat(null);
                        setSubcatError("");
                      } else {
                        setSubcatError("Failed to update subcategory");
                      }
                    } else {
                      // Create
                      const res = await subcategoryService.createSubcategory({
                        name: fields.name,
                        slug: fields.name.toLowerCase().replace(/\s+/g, "-"),
                        description: fields.description,
                        category: id,
                        image: selectedFile, // optional
                      });

                      if (res && res.subcategory) {
                        setSubcategories((prev) => [...prev, res.subcategory]);
                        setSubcatError("");
                      } else {
                        setSubcatError("Failed to add subcategory");
                      }
                    }
                  } catch {
                    setSubcatError("Failed to save subcategory");
                  } finally {
                    setSubcatLoading(false);
                  }
                }}
                onCancel={() => setEditSubcat(null)}
                loading={subcatLoading}
              />
              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                  marginTop: 16,
                }}
              >
                {subcategories.length === 0 && (
                  <li style={{ color: "#6b7280", fontSize: 14 }}>
                    No subcategories found.
                  </li>
                )}
                {subcategories.map((sc) => (
                  <li
                    key={sc._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                      background: "#f9fafb",
                      borderRadius: 4,
                      padding: 8,
                    }}
                  >
                    <img
                      src={sc.image || "/images/placeholder.png"}
                      alt="img"
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <span style={{ fontSize: 15, minWidth: 100 }}>
                      {sc.name}
                    </span>
                    <span
                      style={{ fontSize: 13, color: "#6b7280", minWidth: 80 }}
                    >
                      {sc.slug}
                    </span>
                    <span style={{ fontSize: 13, color: "#6b7280", flex: 1 }}>
                      {sc.description}
                    </span>
                    <button
                      onClick={() => setEditSubcat(sc)}
                      disabled={subcatLoading}
                      style={{
                        background: "#fbbf24",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 10px",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(sc._id)}
                      disabled={subcatLoading}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 10px",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/categories")}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  backgroundColor: saving ? "#93c5fd" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <MdSave size={18} />
                    Update Category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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

export default EditCategory;

// SubcategoryItem component for inline edit
function SubcategoryItem({ subcategory, onUpdate, onDelete, loading }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(subcategory.name);
  const [description, setDescription] = useState(subcategory.description || "");
  const [slug, setSlug] = useState(subcategory.slug);

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) return;
    onUpdate({ name: name.trim(), slug: slug.trim(), description });
    setEditMode(false);
  };

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        background: editMode ? "#f3f4f6" : "transparent",
        borderRadius: 4,
        padding: 4,
      }}
    >
      {editMode ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              fontSize: 15,
              padding: "2px 6px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
            }}
            disabled={loading}
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{
              fontSize: 13,
              padding: "2px 6px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              width: 100,
            }}
            disabled={loading}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              fontSize: 13,
              padding: "2px 6px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              flex: 1,
            }}
            placeholder="Description"
            disabled={loading}
          />
          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || !slug.trim()}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "2px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => setEditMode(false)}
            disabled={loading}
            style={{
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 4,
              padding: "2px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span style={{ fontSize: 15, minWidth: 100 }}>
            {subcategory.name}
          </span>
          <span style={{ fontSize: 13, color: "#6b7280", minWidth: 80 }}>
            {subcategory.slug}
          </span>
          <span style={{ fontSize: 13, color: "#6b7280", flex: 1 }}>
            {subcategory.description}
          </span>
          <button
            onClick={() => setEditMode(true)}
            disabled={loading}
            style={{
              background: "#fbbf24",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "2px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "2px 10px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}

// SubcategoryForm component for create/edit
function SubcategoryForm({ mode, initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial.name || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [description, setDescription] = useState(initial.description || "");
  const [image, setImage] = useState(initial.image || null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setName(initial.name || "");
    setSlug(initial.slug || "");
    setDescription(initial.description || "");
    setImage(initial.image || null);
    setImageFile(null);
  }, [initial]);

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("Please select a valid image file");
    if (file.size > 2 * 1024 * 1024)
      return alert("Image size must be less than 2MB");
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    let payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
    };
    if (imageFile) {
      // Upload image to backend or cloud, here just send as base64 for demo
      const reader = new FileReader();
      reader.onloadend = () => {
        payload.image = reader.result;
        onSubmit(payload);
      };
      reader.readAsDataURL(imageFile);
      return;
    }
    if (image && !imageFile) payload.image = image;
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 16,
        background: "#fff",
        borderRadius: 4,
        padding: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(
            e.target.value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-_]/g, ""),
          );
        }}
        placeholder="Name"
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          fontSize: 14,
          width: 120,
        }}
        disabled={loading}
        required
      />
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Slug"
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          fontSize: 14,
          width: 100,
        }}
        disabled={loading}
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          fontSize: 14,
          flex: 1,
        }}
        disabled={loading}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e.target.files[0])}
        disabled={loading}
        style={{ width: 120 }}
      />
      {image && (
        <img
          src={image}
          alt="img"
          style={{
            width: 32,
            height: 32,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #e5e7eb",
          }}
        />
      )}
      <button
        type="submit"
        disabled={loading || !name.trim() || !slug.trim()}
        style={{
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 4,
          padding: "6px 16px",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {mode === "edit" ? "Update" : "Add"}
      </button>
      {mode === "edit" && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            background: "#f3f4f6",
            color: "#374151",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

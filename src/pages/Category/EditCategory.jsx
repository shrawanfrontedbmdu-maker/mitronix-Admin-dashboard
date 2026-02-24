// EditCategory.jsx — Complete Fixed Version
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdSave, MdArrowBack, MdCloudUpload, MdAdd } from "react-icons/md";
import { categoryService } from "../../api/categoryService.js";
import { subcategoryService } from "../../api/subcategoryService.js";

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");

// ─── helpers ────────────────────────────────────────────────────────────────
const getImageUrl = (img) => {
  if (!img) return "/images/placeholder.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/images")) return img;
  return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

const slug = (str) => str.toLowerCase().replace(/\s+/g, "-").trim();

// ─── styles (inline theme) ──────────────────────────────────────────────────
const S = {
  page: {
    padding: "32px 24px",
    background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
  },
  wrap: { maxWidth: 960, margin: "0 auto" },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  cardHeader: {
    background: "linear-gradient(90deg,#1e40af,#3b82f6)",
    padding: "20px 28px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cardBody: { padding: "28px" },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#3b82f6",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "2px solid #eff6ff",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    width: "100%",
    background: "#fff",
    cursor: "pointer",
  },
  error: { fontSize: 12, color: "#ef4444", marginTop: 2 },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s,transform 0.1s",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1.5px solid #e5e7eb",
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnEdit: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  dropzone: (active) => ({
    border: `2px dashed ${active ? "#3b82f6" : "#d1d5db"}`,
    borderRadius: 12,
    padding: "36px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: active ? "#eff6ff" : "#f9fafb",
    transition: "all 0.2s",
  }),
  imgPreviewWrap: { display: "inline-block", position: "relative" },
  imgPreview: {
    width: 180,
    height: 180,
    objectFit: "cover",
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    display: "block",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  featureGrid: { display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16 },
  featureThumb: (isNew) => ({
    position: "relative",
    flexShrink: 0,
  }),
  featureImg: (isNew) => ({
    width: 96,
    height: 96,
    objectFit: "cover",
    borderRadius: "50%",
    border: `3px solid ${isNew ? "#3b82f6" : "#e5e7eb"}`,
    display: "block",
  }),
  featureRemoveBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 22,
    height: 22,
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    lineHeight: 1,
  },
  newBadge: {
    position: "absolute",
    bottom: -18,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    color: "#3b82f6",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  addCircle: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    border: "2px dashed #d1d5db",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "#f9fafb",
    transition: "border-color 0.2s,background 0.2s",
    flexShrink: 0,
  },
  subcatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
    gap: 12,
  },
  subcatCard: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: 14,
    background: "#fafafa",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2.5px solid rgba(255,255,255,0.4)",
    borderTop: "2.5px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// ─── component ───────────────────────────────────────────────────────────────
export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  // refs
  const mainInputRef     = useRef(null);
  const featureInputRef  = useRef(null);
  const previewUrlsRef   = useRef([]); // track for revokeObjectURL

  // page state
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [mainDrag, setMainDrag] = useState(false);
  const [errors,   setErrors]   = useState({});

  // form
  const [formData, setFormData] = useState({
    categoryKey:      "",
    pageTitle:        "",
    pageSubtitle:     "",
    description:      "",
    status:           "active",
    mainImageFile:    null,
    mainImagePreview: null,
  });

  // features
  const [features, setFeatures] = useState({
    title:           "",
    description:     "",
    images:          [],   // existing cloudinary URLs
    newImageFiles:   [],   // File objects (new)
    newImagePreviews:[],   // blob URLs for preview
  });

  // subcategories
  const [subcategories, setSubcategories] = useState([]);
  const [subcatLoading, setSubcatLoading] = useState(false);
  const [subcatError,   setSubcatError]   = useState("");
  const [newSubcatName, setNewSubcatName] = useState("");
  const [subcatImageFile,setSubcatImageFile] = useState(null);
  const [editingSub,    setEditingSub]    = useState(null);

  // ── cleanup blob URLs on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // ── fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategory = async () => {
        const data = await categoryService.getCategoryById(id);
  
  // YEH ADD KARO
  console.log("API Response features:", data.features);
  console.log("Feature images array:", data.features?.images);
      try {
        const data = await categoryService.getCategoryById(id);
        setFormData({
          categoryKey:      data.categoryKey   || "",
          pageTitle:        data.pageTitle     || "",
          pageSubtitle:     data.pageSubtitle  || "",
          description:      data.description   || "",
          status:           data.status        || "active",
          mainImageFile:    null,
          mainImagePreview: getImageUrl(data.image),
        });
        if (data.features) {
          setFeatures({
            title:            data.features.title       || "",
            description:      data.features.description || "",
            images:           Array.isArray(data.features.images) ? data.features.images : [],
            newImageFiles:    [],
            newImagePreviews: [],
          });
        }
      } catch {
        alert("Failed to load category");
        navigate("/admin/categories");
      } finally {
        setLoading(false);
      }
    };

    const fetchSubcategories = async () => {
      setSubcatLoading(true);
      try {
        const subs = await subcategoryService.getSubcategoriesByCategory(id);
        setSubcategories(
          Array.isArray(subs) ? subs.filter((s) => s?._id && s?.name) : []
        );
      } catch {
        setSubcatError("Failed to load subcategories");
      } finally {
        setSubcatLoading(false);
      }
    };

    fetchCategory();
    fetchSubcategories();
  }, [id, navigate]);

  // ── field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── main image ────────────────────────────────────────────────────────────
  const handleMainImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { alert("Image must be under 5MB");      return; }
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.push(url);
    setFormData((p) => ({ ...p, mainImageFile: file, mainImagePreview: url }));
  };

  const handleRemoveMainImage = () =>
    setFormData((p) => ({ ...p, mainImageFile: null, mainImagePreview: null }));

  // ── feature images — FIX: Array.from FIRST, then reset ───────────────────
  const handleFeatureImagesSelect = useCallback((e) => {
    // ✅ Step 1: immediately copy FileList to a plain array
    const filesArray = Array.from(e.target.files || []);

    // ✅ Step 2: reset input so the same file can be picked again
    e.target.value = "";

    if (filesArray.length === 0) return;

    const validFiles = filesArray.filter((f) => {
      if (!f.type.startsWith("image/")) { alert(`${f.name} is not an image`); return false; }
      if (f.size > 5 * 1024 * 1024)    { alert(`${f.name} exceeds 5MB`);      return false; }
      return true;
    });

    if (validFiles.length === 0) return;

    // ✅ Step 3: create blob URLs and track them for cleanup
    const previews = validFiles.map((f) => {
      const url = URL.createObjectURL(f);
      previewUrlsRef.current.push(url);
      return url;
    });

    // ✅ Step 4: update state
    setFeatures((prev) => ({
      ...prev,
      newImageFiles:    [...prev.newImageFiles,    ...validFiles],
      newImagePreviews: [...prev.newImagePreviews, ...previews],
    }));
  }, []);

  const handleRemoveExistingFeatureImage = (index) =>
    setFeatures((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));

  const handleRemoveNewFeatureImage = (index) => {
    setFeatures((p) => ({
      ...p,
      newImageFiles:    p.newImageFiles.filter((_,    i) => i !== index),
      newImagePreviews: p.newImagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ── subcategories ─────────────────────────────────────────────────────────
  const handleSaveSubcategory = async () => {
    if (!newSubcatName.trim()) return;
    setSubcatLoading(true);
    setSubcatError("");
    try {
      const fd = new FormData();
      fd.append("name",        newSubcatName.trim());
      fd.append("slug",        slug(newSubcatName));
      fd.append("category",    id);
      fd.append("description", "");
      if (subcatImageFile) fd.append("image", subcatImageFile);

      if (editingSub) {
        const res = await subcategoryService.updateSubcategory(editingSub._id, fd);
        setSubcategories((p) =>
          p.map((sc) => (sc._id === editingSub._id ? res.subcategory : sc))
        );
        setEditingSub(null);
      } else {
        const res = await subcategoryService.createSubcategory(fd);
        setSubcategories((p) => [...p, res.subcategory]);
      }
      setNewSubcatName("");
      setSubcatImageFile(null);
    } catch (err) {
      setSubcatError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubcatLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await subcategoryService.deleteSubcategory(subId);
      setSubcategories((p) => p.filter((sc) => sc._id !== subId));
    } catch {
      alert("Failed to delete subcategory");
    }
  };

  const handleEditSubcategory = (sub) => {
    setEditingSub(sub);
    setNewSubcatName(sub.name);
    setSubcatImageFile(null);
  };

  const handleCancelSubcatEdit = () => {
    setEditingSub(null);
    setNewSubcatName("");
    setSubcatImageFile(null);
  };

  // ── validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.categoryKey.trim())
      e.categoryKey = "Category Key is required";
    else if (!/^[a-z0-9-_]+$/i.test(formData.categoryKey))
      e.categoryKey = "Only letters, numbers, hyphens, underscores allowed";
    if (!formData.pageTitle.trim())
      e.pageTitle = "Page Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("categoryKey",  formData.categoryKey.toLowerCase().trim());
      fd.append("pageTitle",    formData.pageTitle.trim());
      fd.append("pageSubtitle", formData.pageSubtitle.trim());
      fd.append("description",  formData.description.trim());
      fd.append("status",       formData.status);

      if (formData.mainImageFile) fd.append("image", formData.mainImageFile);

      fd.append("featuresTitle",       features.title);
      fd.append("featuresDescription", features.description);

      // ✅ existing images — send back so backend keeps them
      features.images.forEach((url) => fd.append("existingFeatureImages", url));

      // ✅ new files — append as multipart
      features.newImageFiles.forEach((file) => fd.append("featureImages", file));

      await categoryService.updateCategory(id, fd);
      alert("Category updated successfully!");
      navigate("/admin/categories");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ ...S.spinner, margin: "0 auto 12px", borderColor: "#e5e7eb", borderTopColor: "#3b82f6", width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6" }} />
          Loading category...
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .add-circle:hover { border-color: #3b82f6 !important; background: #eff6ff !important; }
        .btn-primary:hover:not(:disabled) { background: #2563eb !important; }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
      `}</style>

      <div style={S.wrap}>
        {/* ── top bar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" }}>Edit Category</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>Update category details and images</p>
          </div>
          <button style={S.btnSecondary} onClick={() => navigate("/admin/categories")} disabled={saving}>
            <MdArrowBack size={18} /> Back
          </button>
        </div>

        <div style={S.card}>
          {/* card header */}
          <div style={S.cardHeader}>
            <MdSave size={22} />
            <span style={{ fontSize: 17, fontWeight: 600 }}>Category Details</span>
          </div>

          <form onSubmit={handleSubmit} style={S.cardBody}>

            {/* ── Basic Info ── */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Basic Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 16 }}>
                <div style={S.field}>
                  <label style={S.label}>Category Key <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    style={{ ...S.input, borderColor: errors.categoryKey ? "#ef4444" : "#e5e7eb" }}
                    type="text" name="categoryKey" value={formData.categoryKey}
                    onChange={handleChange} disabled={saving} placeholder="e.g. televisions"
                  />
                  {errors.categoryKey && <span style={S.error}>{errors.categoryKey}</span>}
                </div>
                <div style={S.field}>
                  <label style={S.label}>Page Title <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    style={{ ...S.input, borderColor: errors.pageTitle ? "#ef4444" : "#e5e7eb" }}
                    type="text" name="pageTitle" value={formData.pageTitle}
                    onChange={handleChange} disabled={saving} placeholder="e.g. Televisions"
                  />
                  {errors.pageTitle && <span style={S.error}>{errors.pageTitle}</span>}
                </div>
                <div style={S.field}>
                  <label style={S.label}>Status</label>
                  <select style={S.select} name="status" value={formData.status} onChange={handleChange} disabled={saving}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Additional Info ── */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Additional Information</div>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={S.field}>
                  <label style={S.label}>Page Subtitle</label>
                  <input
                    style={S.input} type="text" name="pageSubtitle"
                    value={formData.pageSubtitle} onChange={handleChange}
                    disabled={saving} placeholder="Short subtitle text"
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Description</label>
                  <textarea
                    style={S.textarea} name="description" rows={3}
                    value={formData.description} onChange={handleChange}
                    disabled={saving} placeholder="Category description..."
                  />
                </div>
              </div>
            </div>

            {/* ── Main Image ── */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Category Image</div>
              {!formData.mainImagePreview ? (
                <div
                  style={S.dropzone(mainDrag)}
                  onClick={() => !saving && mainInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setMainDrag(true); }}
                  onDragLeave={() => setMainDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setMainDrag(false); handleMainImageSelect(e.dataTransfer.files[0]); }}
                >
                  <MdCloudUpload size={44} style={{ color: "#9ca3af", marginBottom: 10 }} />
                  <p style={{ margin: 0, fontSize: 14, color: "#374151", fontWeight: 500 }}>Click to upload or drag & drop</p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>PNG, JPG, WEBP — max 5MB</p>
                </div>
              ) : (
                <div style={S.imgPreviewWrap}>
                  <img src={formData.mainImagePreview} alt="Main" style={S.imgPreview} />
                  <button type="button" style={S.removeBtn} onClick={handleRemoveMainImage}>Remove</button>
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      style={{ ...S.btnSecondary, fontSize: 12, padding: "7px 14px" }}
                      onClick={() => !saving && mainInputRef.current.click()}
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}
              <input ref={mainInputRef} type="file" hidden accept="image/*"
                onChange={(e) => handleMainImageSelect(e.target.files[0])} />
            </div>

            {/* ── Features ── */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Features Section</div>
              <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
                <div style={S.field}>
                  <label style={S.label}>Features Title</label>
                  <input
                    style={S.input} type="text" value={features.title}
                    onChange={(e) => setFeatures((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. QLED Features"
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Features Description</label>
                  <textarea
                    style={S.textarea} rows={3} value={features.description}
                    onChange={(e) => setFeatures((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the features..."
                  />
                </div>
              </div>

              <label style={{ ...S.label, marginBottom: 12, display: "block" }}>
                Feature Icons / Images
              </label>

              <div style={S.featureGrid}>
                {/* existing saved images */}
                {features.images.map((url, i) => (
                  <div key={`ex-${i}`} style={S.featureThumb(false)}>
                    <img src={getImageUrl(url)} alt={`feat-${i}`} style={S.featureImg(false)}
                      onError={(e) => { e.target.src = "/images/placeholder.png"; }} />
                    <button type="button" style={S.featureRemoveBtn}
                      onClick={() => handleRemoveExistingFeatureImage(i)}>✕</button>
                  </div>
                ))}

                {/* ✅ newly selected images — show preview immediately */}
                {features.newImagePreviews.map((preview, i) => (
                  <div key={`new-${i}`} style={{ ...S.featureThumb(true), marginBottom: 20 }}>
                    <img src={preview} alt={`new-feat-${i}`} style={S.featureImg(true)} />
                    <button type="button" style={S.featureRemoveBtn}
                      onClick={() => handleRemoveNewFeatureImage(i)}>✕</button>
                    <span style={S.newBadge}>● New</span>
                  </div>
                ))}

                {/* add button */}
                <div
                  className="add-circle"
                  style={S.addCircle}
                  onClick={() => featureInputRef.current.click()}
                  title="Add feature image"
                >
                  <MdAdd size={26} style={{ color: "#9ca3af" }} />
                  <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Add</span>
                </div>
              </div>

              {/* ✅ Hidden file input — multiple, onChange captures files before reset */}
              <input
                ref={featureInputRef}
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleFeatureImagesSelect}
              />

              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                Blue border = new (not yet saved) &nbsp;·&nbsp; Max 5MB per image &nbsp;·&nbsp; Click ✕ to remove
              </p>
            </div>

            {/* ── Subcategories ── */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Subcategories</div>

              {subcatError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
                  {subcatError}
                </div>
              )}

              {subcatLoading && !subcategories.length ? (
                <p style={{ fontSize: 14, color: "#9ca3af" }}>Loading subcategories...</p>
              ) : subcategories.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9ca3af" }}>No subcategories yet.</p>
              ) : (
                <div style={{ ...S.subcatGrid, marginBottom: 20 }}>
                  {subcategories.map((sub) => (
                    <div key={sub._id} style={S.subcatCard}>
                      {sub.image && (
                        <img src={getImageUrl(sub.image)} alt={sub.name}
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginBottom: 8, display: "block" }} />
                      )}
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 10 }}>{sub.name}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" style={S.btnEdit} onClick={() => handleEditSubcategory(sub)}>Edit</button>
                        <button type="button" style={S.btnDanger} onClick={() => handleDeleteSubcategory(sub._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* add/edit subcategory row */}
              <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                  {editingSub ? `Editing: ${editingSub.name}` : "Add Subcategory"}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={{ ...S.label, marginBottom: 6, display: "block" }}>Name</label>
                    <input
                      style={S.input} type="text" value={newSubcatName}
                      onChange={(e) => setNewSubcatName(e.target.value)}
                      placeholder="Subcategory name"
                    />
                  </div>
                  <div style={{ flex: "1 1 180px" }}>
                    <label style={{ ...S.label, marginBottom: 6, display: "block" }}>Image</label>
                    <input
                      style={{ ...S.input, padding: "7px 12px" }}
                      type="file" accept="image/*"
                      onChange={(e) => setSubcatImageFile(e.target.files[0])}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ ...S.btnPrimary, flexShrink: 0 }}
                    onClick={handleSaveSubcategory}
                    disabled={subcatLoading || !newSubcatName.trim()}
                  >
                    {subcatLoading ? <div style={S.spinner} /> : <MdAdd size={18} />}
                    {editingSub ? "Update" : "Add"}
                  </button>
                  {editingSub && (
                    <button type="button" style={S.btnSecondary} onClick={handleCancelSubcatEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 20, borderTop: "1.5px solid #f3f4f6" }}>
              <button
                type="button"
                style={S.btnSecondary}
                onClick={() => navigate("/admin/categories")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ ...S.btnPrimary, background: saving ? "#93c5fd" : "#3b82f6", cursor: saving ? "not-allowed" : "pointer", minWidth: 160 }}
                disabled={saving}
              >
                {saving ? (
                  <><div style={S.spinner} /> Saving...</>
                ) : (
                  <><MdSave size={18} /> Update Category</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdSave, MdArrowBack, MdCloudUpload } from "react-icons/md";
import { categoryService } from "../../api/categoryService.js";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

function EditCategory() {
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

  // ===== Fetch category =====
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryService.getCategoryById(id);

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

    fetchCategory();
  }, [id, navigate]);

  // ===== VALIDATION =====
  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryKey.trim()) {
      newErrors.categoryKey = "Category Key is required";
    } else if (!/^[a-z0-9-_]+$/.test(formData.categoryKey.toLowerCase())) {
      newErrors.categoryKey = "Only lowercase letters, numbers, hyphens, and underscores allowed";
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
    if (!file.type.startsWith('image/')) {
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
      navigate("/categories");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || err.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  // ===== Loading State =====
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Loading category...</div>
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

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>
              Edit Category
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Update category information
            </p>
          </div>

          <button
            onClick={() => navigate("/categories")}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            <MdArrowBack size={18} />
            Back to List
          </button>
        </div>

        {/* FORM CARD */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* BASIC INFO */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 16px 0',
                color: '#111827'
              }}>
                Basic Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {/* Category Key */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
                    Category Key <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="categoryKey"
                    value={formData.categoryKey}
                    onChange={handleChange}
                    placeholder="e.g., electronics"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${errors.categoryKey ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: saving ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => !errors.categoryKey && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.categoryKey && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.categoryKey && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#ef4444', 
                      marginTop: '4px' 
                    }}>
                      {errors.categoryKey}
                    </p>
                  )}
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginTop: '4px' 
                  }}>
                    Lowercase letters, numbers, hyphens only
                  </p>
                </div>

                {/* Page Title */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
                    Page Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="pageTitle"
                    value={formData.pageTitle}
                    onChange={handleChange}
                    placeholder="e.g., Electronics"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${errors.pageTitle ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: saving ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => !errors.pageTitle && (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => !errors.pageTitle && (e.target.style.borderColor = '#d1d5db')}
                  />
                  {errors.pageTitle && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#ef4444', 
                      marginTop: '4px' 
                    }}>
                      {errors.pageTitle}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: saving ? '#f9fafb' : 'white',
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 16px 0',
                color: '#111827'
              }}>
                Additional Information
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Page Subtitle */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
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
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: saving ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
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
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      backgroundColor: saving ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 16px 0',
                color: '#111827'
              }}>
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
                    border: `2px dashed ${mainDragOver ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    backgroundColor: mainDragOver ? '#eff6ff' : '#f9fafb',
                    transition: 'all 0.2s',
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  <MdCloudUpload 
                    size={48} 
                    style={{ 
                      color: mainDragOver ? '#3b82f6' : '#9ca3af',
                      margin: '0 auto 12px'
                    }} 
                  />
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280'
                  }}>
                    PNG, JPG, WEBP up to 2MB
                  </p>
                </div>
              ) : (
                <div style={{
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  <img
                    src={formData.mainImagePreview}
                    alt="Preview"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.5 : 1
                    }}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => !saving && mainInputRef.current.click()}
                    disabled={saving}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.5 : 1
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

            {/* ACTIONS */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={() => navigate("/categories")}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  backgroundColor: saving ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
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
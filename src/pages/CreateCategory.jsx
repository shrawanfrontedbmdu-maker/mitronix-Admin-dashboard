import { useState, useRef } from "react";
import { MdSave, MdClose, MdCloudUpload, MdImage } from "react-icons/md";
import { categoryService } from "../api/categoryService";

function CreateCategoryModal({ onClose, onSuccess }) {
  const mainInputRef = useRef(null);
  const [mainDragOver, setMainDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // ================= VALIDATION =================
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

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ================= IMAGE HANDLER =================
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

  // ================= REMOVE IMAGE =================
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

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate category key
      const existingCategories = await categoryService.getCategories();
      if (
        existingCategories.some(
          (c) =>
            c.categoryKey.toLowerCase() === formData.categoryKey.toLowerCase().trim()
        )
      ) {
        setErrors({ categoryKey: "Category key already exists!" });
        setLoading(false);
        return;
      }

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

      await categoryService.createCategory(data);

      alert("Category created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      alert(err.response?.data?.message || err.message || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* HEADER */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: 0, 
              color: '#111827' 
            }}>
              Create New Category
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: '4px 0 0 0' 
            }}>
              Add a new category to your store
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <MdClose size={18} />
            Close
          </button>
        </div>

        {/* FORM */}
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.categoryKey ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: loading ? '#f9fafb' : 'white'
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.pageTitle ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: loading ? '#f9fafb' : 'white'
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: loading ? '#f9fafb' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer'
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: loading ? '#f9fafb' : 'white'
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
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    backgroundColor: loading ? '#f9fafb' : 'white'
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
                onClick={() => !loading && mainInputRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  !loading && setMainDragOver(true);
                }}
                onDragLeave={() => setMainDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setMainDragOver(false);
                  !loading && handleMainImageSelect(e.dataTransfer.files[0]);
                }}
                style={{
                  border: `2px dashed ${mainDragOver ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backgroundColor: mainDragOver ? '#eff6ff' : '#f9fafb',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.5 : 1
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
                  disabled={loading}
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
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={mainInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleMainImageSelect(e.target.files[0])}
              disabled={loading}
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
              onClick={onClose}
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                backgroundColor: loading ? '#93c5fd' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating...
                </>
              ) : (
                <>
                  <MdSave size={18} />
                  Create Category
                </>
              )}
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

export default CreateCategoryModal;
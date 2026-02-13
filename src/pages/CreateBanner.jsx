import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSave,
  MdCancel,
  MdImage,
  MdSchedule,
  MdLocationOn,
  MdLink,
  MdVisibility,
  MdUpload,
  MdDelete,
  MdPreview,
  MdClose,
} from "react-icons/md";
import bannerService from "../api/bannerService";

function CreateBanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    imageAlt: "",
    link: "",
    linkTarget: "_self",
    placement: "homepage-hero",
    targetAudience: "All Users",
    status: "InActive",
    startDate: "",
    endDate: "",
    priority: "Medium",
    isClickable: true,
    trackingEnabled: true,
    notes: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        setError("Please select a valid image file (JPG, PNG, GIF, WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        imageUrl: "",
      }));

      setError("");
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && selectedImage) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) fileInput.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] },
      };
      handleImageUpload(syntheticEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handlePreview = () => {
    if (!formData.title.trim()) {
      setError("Please enter a banner title to preview");
      return;
    }

    if (!selectedImage && !formData.imageUrl.trim()) {
      setError("Please upload an image or provide an image URL to preview");
      return;
    }

    setError("");
    setShowPreview(true);
  };

  const getPlacementLabel = (placement) => {
    const placements = {
      "homepage-hero": "Homepage Hero",
      "homepage-sidebar": "Homepage Sidebar",
      "product-page-sidebar": "Product Page Sidebar",
      "category-page-header": "Category Page Header",
      "checkout-page": "Checkout Page",
      "cart-page": "Cart Page",
      "search-results": "Search Results",
      footer: "Footer",
      "mobile-app-banner": "Mobile App Banner",
    };
    return placements[placement] || placement;
  };

  // const handleSubmit = async (e, status = "InActive") => {
  //   e.preventDefault();

  //   if (!formData.title.trim()) {
  //     setError("Title is required");
  //     return;
  //   }

  //   if (!selectedImage && !formData.imageUrl.trim()) {
  //     setError("Please upload an image or provide an image URL");
  //     return;
  //   }

  //   if (!formData.startDate || !formData.endDate) {
  //     setError("Start date and end date are required");
  //     return;
  //   }

  //   if (new Date(formData.startDate) >= new Date(formData.endDate)) {
  //     setError("End date must be after start date");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  //     const submitData = {
  //       ...formData,
  //       status,
  //       startDate: new Date(formData.startDate).toISOString(),
  //       endDate: new Date(formData.endDate).toISOString(),
  //       createdBy: "Admin User",
  //     };

  //     if (selectedImage) {
  //       submitData.image = selectedImage;
  //     }

  //     await bannerService.create(submitData);

  //     navigate("/banners");
  //   } catch (error) {
  //     setError(error.message || "Failed to create banner");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e, status = "InActive") => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.set("status", status);
      data.set("startDate", new Date(formData.startDate).toISOString());
      data.set("endDate", new Date(formData.endDate).toISOString());

      if (selectedImage) {
        data.append("image", selectedImage); // field name must match multer
      }

      await bannerService.create(data);
      navigate("/banners");
    } catch (error) {
      setError(error.message || "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  const placementOptions = [
    { value: "homepage-hero", label: "Homepage Hero" },
    { value: "homepage-sidebar", label: "Homepage Sidebar" },
    { value: "product-page-sidebar", label: "Product Page Sidebar" },
    { value: "category-page-header", label: "Category Page Header" },
    { value: "checkout-page", label: "Checkout Page" },
    { value: "cart-page", label: "Cart Page" },
    { value: "search-results", label: "Search Results" },
    { value: "footer", label: "Footer" },
    { value: "mobile-app-banner", label: "Mobile App Banner" },
  ];

  const audienceOptions = [
    { value: "All Users", label: "All Users" },
    { value: "Registered Users", label: "Registered Users" },
    { value: "Guest Users", label: "Guest Users" },
    { value: "VIP Customers", label: "VIP Customers" },
    { value: "New Customers", label: "New Customers" },
    { value: "Cart Users", label: "Users with Cart Items" },
    { value: "Frequent Buyers", label: "Frequent Buyers" },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Create New Banner</h1>
          <p className="page-subtitle">
            Design and configure promotional banners
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => navigate("/banners")}
            className="btn btn-secondary"
          >
            <MdCancel size={20} />
            Cancel
          </button>
        </div>
      </div>

      <div className="content-card">
        {error && <div className="error-message">{error}</div>}

        <form
          onSubmit={(e) => handleSubmit(e, "InActive")}
          className="banner-form"
        >
          {/* Basic Information */}
          <div className="form-section">
            <div className="section-header">
              <MdImage className="section-icon" />
              <h3>Basic Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Banner Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="High">High </option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low </option>
                </select>
              </div>
            </div>

            {/* <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter banner description"
                rows={3}
              />
            </div> */}
          </div>

          {/* Image Configuration */}
          <div className="form-section">
            <div className="section-header">
              <MdImage className="section-icon" />
              <h3>Image Configuration</h3>
            </div>

            <div className="form-group">
              <label htmlFor="imageUpload">Upload Banner Image *</label>
              <div
                className={`image-upload-area ${dragOver ? "dragover" : ""}`}
                onClick={() => document.getElementById("imageUpload").click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="upload-icon">
                  <MdUpload size={32} />
                </div>
                <div className="upload-text">
                  Drop your image here, or click to browse
                </div>
                <div className="upload-hint">
                  PNG, JPG, GIF and WebP files are allowed (Max 5MB)
                </div>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {/* ✅ Preview the uploaded image */}
                {imagePreview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={imagePreview}
                      alt="Uploaded Preview"
                      style={{ maxHeight: "200px", borderRadius: "8px" }}
                    />
                  </div>
                )}

                {/* Optional fallback if editing existing image and no new one is uploaded */}
                {!imagePreview && formData.imageUrl && (
                  <div
                    style={{
                      marginTop: "10px",
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageAlt}
                      style={{ maxHeight: "200px", borderRadius: "8px" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      title="Remove image"
                      className="remove-image-btn"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="form-group">
                    <label htmlFor="imageUrl">Or Image URL</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!selectedImage}
                    />
                    {selectedImage && (
                        <small style={{ color: "#666", fontSize: "12px" }}>
                            Remove uploaded image to use URL instead
                        </small>
                    )}
                </div> */}

            <div className="form-group">
              <label htmlFor="imageAlt">Image Alt Text</label>
              <input
                type="text"
                id="imageAlt"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleInputChange}
                placeholder="Descriptive text for accessibility"
              />
            </div>

            {/* {(imagePreview || formData.imageUrl) && (
              <div className="image-preview">
                <div className="preview-header">
                  <h4>Image Preview:</h4>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
                <img
                  src={imagePreview || formData.imageUrl}
                  alt={formData.imageAlt || "Banner preview"}
                  className="preview-image"
                  onError={(e) => {
                    setError(
                      "Failed to load image. Please check the URL or upload a different file."
                    );
                  }}
                />
                {selectedImage && (
                  <div className="image-info">
                    <span>File: {selectedImage.name}</span>
                    <span>
                      Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span>Type: {selectedImage.type}</span>
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* Link Configuration */}
          <div className="form-section">
            <div className="section-header">
              <MdLink className="section-icon" />
              <h3>Link Configuration</h3>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isClickable"
                    checked={formData.isClickable}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Make banner clickable</span>
                </label>
              </div>
            </div>

            {formData.isClickable && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="link">Destination URL</label>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="https://example.com/destination"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="linkTarget">Link Target</label>
                    <select
                      id="linkTarget"
                      name="linkTarget"
                      value={formData.linkTarget}
                      onChange={handleInputChange}
                    >
                      <option value="_self">Same Window</option>
                      <option value="_blank">New Window</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Placement & Targeting */}
          <div className="form-section">
            <div className="section-header">
              <MdLocationOn className="section-icon" />
              <h3>Placement & Targeting</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="placement">Placement Location *</label>
                <select
                  id="placement"
                  name="placement"
                  value={formData.placement}
                  onChange={handleInputChange}
                  required
                >
                  {placementOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetAudience">Target Audience</label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                >
                  {audienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="form-section">
            <div className="section-header">
              <MdSchedule className="section-icon" />
              <h3>Schedule Configuration</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="form-section">
            <div className="section-header">
              <MdVisibility className="section-icon" />
              <h3>Advanced Settings</h3>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="trackingEnabled"
                    checked={formData.trackingEnabled}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Enable click tracking</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Internal Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Internal notes for team reference"
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {/* <button
              type="button"
              onClick={handlePreview}
              className="btn btn-secondary"
              disabled={loading}
            >
              <MdPreview size={20} />
              Preview Banner
            </button> */}

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
            >
              <MdSave size={20} />
              {loading ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "active")}
              className="btn btn-primary"
              disabled={loading}
            >
              <MdVisibility size={20} />
              {loading ? "Publishing..." : "Save & Activate"}
            </button>
          </div>
        </form>
      </div>

      {/* Banner Preview Modal */}
      {showPreview && (
        <div
          className="preview-modal-overlay"
          onClick={() => setShowPreview(false)}
        >
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>Banner Preview - {getPlacementLabel(formData.placement)}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="modal-close-btn"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="preview-modal-content">
              {/* Different preview styles based on placement */}
              <div className={`banner-preview-container ${formData.placement}`}>
                <div className="banner-preview-item">
                  <img
                    src={imagePreview || formData.imageUrl}
                    alt={formData.imageAlt || formData.title}
                    className="preview-banner-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/800x200?text=Banner+Preview";
                    }}
                  />

                  {formData.isClickable && formData.link && (
                    <div className="banner-overlay">
                      <div className="banner-content">
                        <h4>{formData.title}</h4>
                        {formData.description && <p>{formData.description}</p>}
                        <span className="banner-link">
                          Click to visit: {formData.link}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="preview-info">
                <h4>Banner Details:</h4>
                <ul>
                  <li>
                    <strong>Title:</strong> {formData.title}
                  </li>
                  <li>
                    <strong>Placement:</strong>{" "}
                    {getPlacementLabel(formData.placement)}
                  </li>
                  <li>
                    <strong>Target Audience:</strong> {formData.targetAudience}
                  </li>
                  <li>
                    <strong>Status:</strong> {formData.status}
                  </li>
                  <li>
                    <strong>Clickable:</strong>{" "}
                    {formData.isClickable ? "Yes" : "No"}
                  </li>
                  {formData.isClickable && formData.link && (
                    <li>
                      <strong>Link:</strong> {formData.link}
                    </li>
                  )}
                  <li>
                    <strong>Schedule:</strong> {formData.startDate} to{" "}
                    {formData.endDate}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
                .banner-form {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .form-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid #e9ecef;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e9ecef;
                }

                .section-icon {
                    color: #ffc007;
                    font-size: 20px;
                }

                .section-header h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-row:last-child {
                    margin-bottom: 0;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: white;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .checkbox-group {
                    flex-direction: row;
                    align-items: center;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #333;
                }

                .checkbox-label input[type="checkbox"] {
                    width: auto;
                    margin: 0;
                }

                .checkbox-text {
                    user-select: none;
                    margin-left: 1vh;
                    position: relative;
                }

                .image-upload-area {
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #fafafa;
                }

                .image-upload-area:hover {
                    border-color: #ffc007;
                    background: #fffbf0;
                }

                .image-upload-area.dragover {
                    border-color: #ffc007;
                    background: #fffbf0;
                    transform: scale(1.02);
                }

                .upload-icon {
                    color: #666;
                    margin-bottom: 12px;
                }

                .upload-text {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .upload-hint {
                    font-size: 12px;
                    color: #666;
                }

                .image-preview {
                    margin-top: 16px;
                    padding: 16px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .preview-header h4 {
                    font-size: 14px;
                    color: #333;
                    margin: 0;
                }

                .remove-image-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                }

                .remove-image-btn:hover {
                    background: #c82333;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    display: block;
                    margin-bottom: 8px;
                }

                .image-info {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    color: #666;
                    flex-wrap: wrap;
                }

                .preview-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .preview-modal {
                    background: white;
                    border-radius: 12px;
                    max-width: 900px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .preview-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid #e9ecef;
                }

                .preview-modal-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 18px;
                }

                .modal-close-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                    padding: 4px;
                    border-radius: 4px;
                }

                .modal-close-btn:hover {
                    background: #f8f9fa;
                    color: #333;
                }

                .preview-modal-content {
                    padding: 24px;
                }

                .banner-preview-container {
                    margin-bottom: 24px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px dashed #dee2e6;
                }

                .banner-preview-container.homepage-hero {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px;
                }

                .banner-preview-container.homepage-sidebar {
                    max-width: 300px;
                    background: #fff;
                    border: 1px solid #e9ecef;
                }

                .banner-preview-container.footer {
                    background: #343a40;
                    color: white;
                }

                .banner-preview-item {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }

                .preview-banner-image {
                    width: 100%;
                    height: auto;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .banner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    border-radius: 6px;
                }

                .banner-preview-item:hover .banner-overlay {
                    opacity: 1;
                }

                .banner-content {
                    text-align: center;
                    padding: 20px;
                }

                .banner-content h4 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                }

                .banner-content p {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    opacity: 0.9;
                }

                .banner-link {
                    font-size: 12px;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .preview-info {
                    background: #f8f9fa;
                    padding: 16px;
                    border-radius: 6px;
                    border-left: 4px solid #ffc007;
                }

                .preview-info h4 {
                    margin: 0 0 12px 0;
                    color: #333;
                    font-size: 16px;
                }

                .preview-info ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .preview-info li {
                    margin-bottom: 6px;
                    font-size: 14px;
                    color: #555;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 24px;
                    border-top: 1px solid #e9ecef;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-primary {
                    background: #ffc007;
                    color: #333;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #e6ac06;
                }

                .btn-secondary {
                    background: #74b9ff;
                    color: white;
                }

                .btn-secondary:hover:not(:disabled) {
                    background: #0984e3;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid #f5c6cb;
                    border-left: 4px solid #dc3545;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-section {
                        padding: 16px;
                    }

                    .form-actions {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .btn {
                        justify-content: center;
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .checkbox-group {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
    </div>
  );
}

export default CreateBanner;

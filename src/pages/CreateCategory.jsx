import { useState, useRef } from "react";
import { MdSave, MdClose, MdCloudUpload } from "react-icons/md";
import { categoryService } from "../api/categoryService";

function CreateCategoryModal({ onClose, onSuccess }) {
  const mainInputRef = useRef(null);
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

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= IMAGE HANDLER =================
  const handleMainImageSelect = (file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("Image size must be less than 2MB");
    }

    setFormData((prev) => ({
      ...prev,
      mainImageFile: file,
      mainImagePreview: URL.createObjectURL(file),
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryKey.trim()) return alert("Category Key is required");
    if (!formData.pageTitle.trim()) return alert("Page Title is required");

    try {
      const existingCategories = await categoryService.getCategories();
      if (
        existingCategories.some(
          (c) =>
            c.categoryKey.toLowerCase() === formData.categoryKey.toLowerCase(),
        )
      ) {
        return alert("Category key already exists!");
      }

      const data = new FormData();
      data.append("categoryKey", formData.categoryKey.toLowerCase().trim());
      data.append("pageTitle", formData.pageTitle.trim());
      data.append("status", formData.status);

      if (formData.pageSubtitle.trim())
        data.append("pageSubtitle", formData.pageSubtitle.trim());

      if (formData.description.trim())
        data.append("description", formData.description.trim());

      if (formData.mainImageFile) data.append("image", formData.mainImageFile);

      await categoryService.createCategory(data);

      alert("Category created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      alert(err.message || "Failed to create category.");
    }
  };

  // ================= RENDER =================
  // ================= RENDER =================
  return (
    <div className="modal">
      <div className="content-card p-6 max-w-xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Create Category</h1>
            <p className="text-gray-500 text-sm">Add a new category</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary">
            <MdClose /> Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FIRST ROW - 3 FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label>Category Key *</label>
              <input
                name="categoryKey"
                value={formData.categoryKey}
                onChange={handleChange}
                placeholder="electronics"
                required
              />
            </div>

            <div className="form-group">
              <label>Page Title *</label>
              <input
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                placeholder="Electronics"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* SECOND ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Page Subtitle</label>
              <input
                name="pageSubtitle"
                value={formData.pageSubtitle}
                onChange={handleChange}
                placeholder="Optional subtitle"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description..."
              />
            </div>
          </div>

          {/* IMAGE UPLOAD SMALL */}
          <div className="form-group">
            <label>Main Image</label>

            <div
              className={`border-2 border-dashed rounded p-2 text-center cursor-pointer w-36 ${
                mainDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
              onClick={() => mainInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setMainDragOver(true);
              }}
              onDragLeave={() => setMainDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setMainDragOver(false);
                handleMainImageSelect(e.dataTransfer.files[0]);
              }}
            >
              <MdCloudUpload size={22} className="mx-auto text-gray-500" />
              <p className="text-xs text-gray-500">Upload</p>
            </div>

            {/* IMAGE PREVIEW 100x100 */}
            {formData.mainImagePreview && (
              <img
                src={formData.mainImagePreview}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded border"
              />
            )}

            <input
              ref={mainInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleMainImageSelect(e.target.files[0])}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              <MdSave /> Save Category
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCategoryModal;

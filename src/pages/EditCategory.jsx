import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdSave, MdClose, MdCloudUpload } from "react-icons/md";
import { categoryService } from "../api/categoryService.js";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mainInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
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
        alert("Failed to fetch category");
        navigate("/categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  // ===== Input Change =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Image Handler =====
  const handleMainImageSelect = (file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("Image must be less than 2MB");
    }

    setFormData((prev) => ({
      ...prev,
      mainImageFile: file,
      mainImagePreview: URL.createObjectURL(file),
    }));
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryKey.trim())
      return alert("Category Key is required");
    if (!formData.pageTitle.trim())
      return alert("Page Title is required");

    try {
      const data = new FormData();
      data.append("categoryKey", formData.categoryKey.toLowerCase().trim());
      data.append("pageTitle", formData.pageTitle.trim());
      data.append("status", formData.status);

      if (formData.pageSubtitle.trim())
        data.append("pageSubtitle", formData.pageSubtitle.trim());

      if (formData.description.trim())
        data.append("description", formData.description.trim());

      if (formData.mainImageFile)
        data.append("image", formData.mainImageFile);

      await categoryService.updateCategory(id, data);

      alert("Category updated successfully!");
      navigate("/categories");
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading category...
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="content-card p-6 max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Edit Category</h1>
            <p className="text-gray-500 text-sm">
              Modify your category details
            </p>
          </div>
          <button onClick={() => navigate("/categories")} className="btn btn-secondary">
            <MdClose /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Category Key *</label>
              <input
                name="categoryKey"
                value={formData.categoryKey}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Page Title *</label>
              <input
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Page Subtitle</label>
              <input
                name="pageSubtitle"
                value={formData.pageSubtitle}
                onChange={handleChange}
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

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>Main Image</label>
            <div
              className={`border-2 border-dashed rounded p-3 text-center cursor-pointer ${
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
              <MdCloudUpload size={28} className="mx-auto text-gray-500" />
              <p className="text-sm text-gray-500">
                Click or drop image (max 2MB)
              </p>
            </div>

            {formData.mainImagePreview && (
              <img
                src={formData.mainImagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
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
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <MdSave /> Update Category
            </button>
            <button
              type="button"
              onClick={() => navigate("/categories")}
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

export default EditCategory;

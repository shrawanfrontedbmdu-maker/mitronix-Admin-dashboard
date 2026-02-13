import { Link } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { categoryService } from "../api/categoryService.js";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Get full image URL =====
  const getImageUrl = (img) => {
    if (!img) return "/images/placeholder.png";
    if (img.startsWith("http")) return img;
    return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  // ===== Fetch categories from backend =====
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===== Delete a category =====
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    }
  };

  return (
    <div className="page-container" style={{ minHeight: "600px", padding: "20px" }}>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Categories</h1>
        <Link to="/categories/create" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <MdAdd /> Add Category
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading categories...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            className="data-table"
            style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ width: "80px", textAlign: "center", padding: "10px" }}>Image</th>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Description</th>
                <th style={{ width: "100px", textAlign: "center", padding: "10px" }}>Status</th>
                <th style={{ width: "220px", textAlign: "center", padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} style={{ height: "80px", borderBottom: "1px solid #ddd" }}>
                    {/* Image */}
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          overflow: "hidden",
                          borderRadius: "6px",
                          margin: "0 auto",
                        }}
                      >
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.pageTitle}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td style={{ verticalAlign: "middle" }}>{category.pageTitle}</td>

                    {/* Description */}
                    <td
                      style={{
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "250px",
                      }}
                    >
                      {category.description || "-"}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      {category.status === "active" ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Deactive</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <Link
                          to={`/categories/edit/${category._id}`}
                          className="btn btn-warning"
                          style={{ minWidth: "90px", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          <MdEdit /> Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(category._id, category.pageTitle)}
                          className="btn btn-danger"
                          style={{ minWidth: "90px", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CategoriesList;

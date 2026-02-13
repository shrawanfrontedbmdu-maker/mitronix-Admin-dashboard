// InfoSectionsList.jsx
import { Link } from "react-router-dom";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { infoSectionService } from "../api/infoSectionServices.js";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

function InfoSectionsList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Get full image URL =====
  const getImageUrl = (img) => {
    if (!img) return "/images/placeholder.png";
    if (img.startsWith("http")) return img;
    return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  // ===== Fetch info sections =====
  const fetchSections = async () => {
    try {
      const data = await infoSectionService.getInfoSections();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch InfoSections:", err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // ===== Delete an info section =====
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await infoSectionService.deleteInfoSection(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
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
        <h1>Info Sections</h1>
        <Link
          to="/infosections/create"
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
        >
          <MdAdd /> Add Section
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading info sections...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            className="data-table"
            style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ width: "80px", textAlign: "center", padding: "10px" }}>Image</th>
                <th style={{ padding: "10px" }}>Title</th>
                <th style={{ padding: "10px" }}>Subtitle</th>
                <th style={{ padding: "10px" }}>Description</th>
                <th style={{ width: "220px", textAlign: "center", padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sections.length > 0 ? (
                sections.map((section) => (
                  <tr key={section._id} style={{ height: "80px", borderBottom: "1px solid #ddd" }}>
                    {/* Main Image */}
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
                          src={getImageUrl(section.image)}
                          alt={section.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td style={{ verticalAlign: "middle" }}>{section.title}</td>

                    {/* Subtitle */}
                    <td style={{ verticalAlign: "middle" }}>{section.subtitle || "-"}</td>

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
                      {section.description || "-"}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <Link
                          to={`/infosections/edit/${section._id}`}
                          className="btn btn-warning"
                          style={{ minWidth: "90px", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          <MdEdit /> Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(section._id, section.title)}
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
                    No info sections found
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

export default InfoSectionsList;

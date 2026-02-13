import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSave, MdCancel, MdCheckCircle } from "react-icons/md";
import instance from "../../api/axios.config";

export default function AddStore() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    password: "",
    phone: "",
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCancel = () => {
    navigate("/stores/list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        storeName: formData.storeName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
      };

      const res = await instance.post(
        "/admin/stores",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data) {
        setMessage("Store created successfully! Redirecting...");

        // Reset form
        setFormData({
          storeName: "",
          email: "",
          password: "",
          phone: "",
          fullAddress: "",
          city: "",
          state: "",
          pincode: "",
          landmark: "",
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/stores/list");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#2d3436" }}>
            Create New Store
          </h1>
          <p style={{ color: "#636e72", fontSize: "14px", marginTop: "5px" }}>
            Add a new store location to your business
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          {/* Success Message */}
          {message && (
            <div
              style={{
                padding: "15px 20px",
                backgroundColor: "#d1f2eb",
                border: "1px solid #00b894",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MdCheckCircle style={{ fontSize: "20px", color: "#00b894" }} />
              <span
                style={{
                  color: "#00b894",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                {message}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "15px 20px",
                backgroundColor: "#ffebee",
                border: "1px solid #ef5350",
                borderRadius: "8px",
                marginBottom: "20px",
                color: "#c62828",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Store Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#2d3436",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "2px solid #ffc007",
              }}
            >
              Store Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Store Name */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Store Name <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="e.g., Downtown Store"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Phone Number <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#2d3436",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "2px solid #ffc007",
              }}
            >
              Account Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Email */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Store Email <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="store@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Temporary Password <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter temporary password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#2d3436",
                marginBottom: "15px",
                paddingBottom: "10px",
                borderBottom: "2px solid #ffc007",
              }}
            >
              Address Information
            </h3>

            {/* Full Address */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>
                Full Address <span style={{ color: "#e17055" }}>*</span>
              </label>
              <input
                type="text"
                name="fullAddress"
                placeholder="e.g., 123 Main Street, Building A"
                value={formData.fullAddress}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "white",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* City, State, Pincode, Landmark Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              {/* City */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  City <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g., Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              {/* State */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  State <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="e.g., Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              {/* Pincode */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Pincode <span style={{ color: "#e17055" }}>*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="e.g., 400001"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              {/* Landmark */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "6px" }}>
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="e.g., Near Central Park"
                  value={formData.landmark}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              paddingTop: "20px",
              borderTop: "1px solid #e1e8ed",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: loading ? "#ccc" : "#ffc007",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#e6ac06";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "#ffc007";
              }}
            >
              <MdSave style={{ fontSize: "18px" }} />
              {loading ? "Creating..." : "Create Store"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "#74b9ff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#0984e3")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#74b9ff")
              }
            >
              <MdCancel style={{ fontSize: "18px" }} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

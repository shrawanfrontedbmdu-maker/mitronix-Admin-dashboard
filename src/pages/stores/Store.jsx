import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdAdd, MdInfo } from "react-icons/md";
import instance from "../../api/axios.config";

export default function Store() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await instance.get(
        "/admin/stores",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchStores();
  };

  if (loading) {
    return (
      <div
        className="page-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "600px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "3px solid #f0f0f0",
              borderTop: "3px solid #ffc007",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }}
          ></div>
          <p style={{ color: "#636e72", fontSize: "14px" }}>
            Loading stores...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ minHeight: "600px" }}>
        <div
          style={{
            padding: "30px",
            backgroundColor: "#ffebee",
            border: "1px solid #ef5350",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <MdInfo
            style={{
              fontSize: "32px",
              color: "#c62828",
              marginBottom: "10px",
            }}
          />
          <p style={{ color: "#c62828", fontSize: "16px", fontWeight: "500" }}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#ffc007",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#e6ac06")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#ffc007")
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            Stores Management
          </h1>
          <p style={{ color: "#636e72", fontSize: "14px", marginTop: "5px" }}>
            Manage all your store locations
          </p>
        </div>
        <Link
          to="/stores/create"
          className="btn btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            backgroundColor: "#ffc007",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "500",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ac06")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffc007")
          }
        >
          <MdAdd style={{ fontSize: "18px" }} /> Add Store
        </Link>
      </div>

      {/* Stores Table Card */}
      <div className="content-card">
        {stores.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              className="data-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    Store Name
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    Phone
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    City
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    State
                  </th>
                  <th
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#2d3436",
                      borderBottom: "1px solid #e1e8ed",
                      fontSize: "14px",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store._id}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "15px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#2d3436",
                      }}
                    >
                      {store.storeName}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "14px",
                        color: "#636e72",
                      }}
                    >
                      {store.userId?.email}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "14px",
                        color: "#636e72",
                      }}
                    >
                      {store.phone || "-"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "14px",
                        color: "#636e72",
                      }}
                    >
                      {store.address?.city || "-"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "14px",
                        color: "#636e72",
                      }}
                    >
                      {store.address?.state || "-"}
                    </td>

                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <span
                        className="status"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "inline-block",
                          backgroundColor: store.isActive
                            ? "#d1f2eb"
                            : "#ffebee",
                          color: store.isActive ? "#00b894" : "#e53e3e",
                          border: store.isActive
                            ? "1px solid rgba(0, 184, 148, 0.3)"
                            : "1px solid rgba(229, 62, 62, 0.3)",
                        }}
                      >
                        {store.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "15px",
                opacity: "0.3",
              }}
            >
              📦
            </div>
            <p
              style={{
                color: "#636e72",
                fontSize: "16px",
                marginBottom: "20px",
              }}
            >
              No stores found
            </p>
            <Link
              to="/stores/create"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#ffc007",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#e6ac06")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#ffc007")
              }
            >
              Create First Store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

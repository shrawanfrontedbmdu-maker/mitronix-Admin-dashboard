import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdCheckCircle,
  MdStar,
} from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productResponse = await productService.getProductById(id);
        const foundProduct = productResponse.product || productResponse;

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      try {
        setDeleting(true);
        await productService.deleteProduct(id);
        navigate("/admin/products/list");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product. Please try again.");
      } finally {
        setDeleting(false);
      }
    }
  };

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{
            padding: "32px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div
            style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}
          >
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  /* ===== ERROR ===== */
  if (error || !product) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#dc2626",
              }}
            >
              {error || "Product not found"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/admin/products/list"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#667eea",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <MdArrowBack size={16} /> Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===== DERIVED VALUES (schema ke hisab se) ===== */
  // Total stock: variants hain toh unka sum, nahi toh product-level stockQuantity
  const totalStock =
    product.variants?.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
      : product.stockQuantity || 0;

  // Overall stock status
  const overallStockStatus =
    totalStock > 5 ? "in-stock" : totalStock > 0 ? "low-stock" : "out-of-stock";

  // Price display: variant product ke liye pehle variant ki price, nahi toh sellingPrice
  const isVariantProduct = product.variants?.length > 0;
  const displayPrice = isVariantProduct
    ? product.variants[0]?.price
    : product.sellingPrice || 0;
  const displayMRP = isVariantProduct ? product.variants[0]?.mrp : product.mrp;

  // Category: already populated from backend (name, categoryKey)
  const categoryName =
    product.category?.name || product.category?.pageTitle || "";

  const stockStatusColor = {
    "in-stock": { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
    "low-stock": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    "out-of-stock": { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  };
  const stockColor = stockStatusColor[overallStockStatus];

  /* ===== CARD WRAPPER STYLE ===== */
  const card = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: "24px",
  };

  const sectionTitle = {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#111827",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  };
  const valueStyle = { fontSize: "14px", fontWeight: "600", color: "#111827" };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* ===== PAGE HEADER ===== */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 4px 0",
                color: "#111827",
              }}
            >
              Product Details
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              View and manage product information
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to={`/admin/products/edit/${id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: "#667eea",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <MdEdit size={16} /> Edit Product
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: deleting ? "#9ca3af" : "#ef4444",
                color: "white",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              <MdDelete size={16} /> {deleting ? "Deleting..." : "Delete"}
            </button>
            <Link
              to="/admin/products/list"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                border: "1px solid #e5e7eb",
              }}
            >
              <MdArrowBack size={16} /> Back to List
            </Link>
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "24px",
            marginBottom: "24px",
            alignItems: "start",
          }}
        >
          {/* ===== LEFT — Images + Badges ===== */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={card}>
              {/* Main Image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "16px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <img
                  src={
                    product.images?.[selectedImageIndex]?.url ||
                    "https://via.placeholder.com/500"
                  }
                  alt={
                    product.images?.[selectedImageIndex]?.alt || product.name
                  }
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/500?text=No+Image")
                  }
                />
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: "8px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index
                            ? "2px solid #667eea"
                            : "1px solid #e5e7eb",
                        opacity: selectedImageIndex === index ? 1 : 0.6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity =
                          selectedImageIndex === index ? "1" : "0.6")
                      }
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/100?text=Img")
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor:
                      product.status === "active" ? "#d1fae5" : "#f3f4f6",
                    color: product.status === "active" ? "#065f46" : "#6b7280",
                  }}
                >
                  {product.status === "active" ? "✓ Active" : "Inactive"}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: stockColor.bg,
                    color: stockColor.text,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: stockColor.dot,
                      display: "inline-block",
                    }}
                  />
                  {overallStockStatus === "in-stock"
                    ? "In Stock"
                    : overallStockStatus === "low-stock"
                      ? "Low Stock"
                      : "Out of Stock"}
                </div>
                {product.isFeatured && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                    }}
                  >
                    <MdStar size={13} /> Featured
                  </div>
                )}
                {product.isRecommended && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                    }}
                  >
                    <MdCheckCircle size={13} /> Recommended
                  </div>
                )}
                {product.isDigital && (
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: "#e0e7ff",
                      color: "#4338ca",
                    }}
                  >
                    💾 Digital
                  </div>
                )}
              </div>
            </div>

            {/* Ratings (schema: avgRating, reviewCount) */}
            {product.avgRating > 0 && (
              <div style={card}>
                <h3 style={sectionTitle}>Ratings & Reviews</h3>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {product.avgRating.toFixed(1)}
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                        marginBottom: "4px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color:
                              star <= Math.round(product.avgRating)
                                ? "#f59e0b"
                                : "#d1d5db",
                            fontSize: "18px",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {product.reviewCount || 0} reviews
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT — All Details ===== */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Product Header */}
            <div style={card}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  margin: "0 0 8px 0",
                  color: "#111827",
                }}
              >
                {product.name}
              </h2>
              {product.brand && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#667eea",
                    fontWeight: "600",
                    marginBottom: "12px",
                  }}
                >
                  {product.brand}
                </div>
              )}

              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "1.7",
                  margin: "0 0 20px 0",
                }}
              >
                {product.description}
              </p>

              {/* Pricing Block */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  {isVariantProduct ? "Starting from" : "Selling Price"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      fontSize: "34px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    ₹{(displayPrice || 0).toLocaleString("en-IN")}
                  </div>
                  {displayMRP && displayMRP > displayPrice && (
                    <>
                      <div
                        style={{
                          fontSize: "18px",
                          color: "#9ca3af",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{displayMRP.toLocaleString("en-IN")}
                      </div>
                      <div
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "#10b981",
                          color: "white",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {Math.round(
                          ((displayMRP - displayPrice) / displayMRP) * 100,
                        )}
                        % OFF
                      </div>
                    </>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginTop: "6px",
                  }}
                >
                  Total Stock:{" "}
                  <strong
                    style={{ color: totalStock > 0 ? "#065f46" : "#991b1b" }}
                  >
                    {totalStock} units
                  </strong>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  ["Product Key", product.productKey, true],
                  ["Category", categoryName, false],
                  ["Brand", product.brand, false],
                  ["Model No.", product.modelNumber, false],
                  ["SKU", product.sku, true],
                  ["Slug", product.slug, true],
                ]
                  .filter(([, val]) => val)
                  .map(([label, val, mono]) => (
                    <div
                      key={label}
                      style={{
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={labelStyle}>{label}</div>
                      <div
                        style={{
                          ...valueStyle,
                          fontFamily: mono ? "monospace" : "inherit",
                          fontSize: mono ? "13px" : "14px",
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* ===== VARIANTS ===== */}
            {isVariantProduct && (
              <div style={card}>
                <h3 style={sectionTitle}>
                  Product Variants ({product.variants.length})
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {product.variants.map((variant, index) => {
                    const vStockColor =
                      stockStatusColor[variant.stockStatus] || stockColor;
                    const attrLabel =
                      [
                        variant.attributes?.color,
                        variant.attributes?.size,
                        variant.attributes?.model,
                      ]
                        .filter(Boolean)
                        .join(" • ") || `Variant ${index + 1}`;
                    return (
                      <div
                        key={index}
                        style={{
                          padding: "16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        {/* Variant Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "14px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#111827",
                                marginBottom: "2px",
                              }}
                            >
                              {attrLabel}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                fontFamily: "monospace",
                              }}
                            >
                              SKU: {variant.sku}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                backgroundColor: vStockColor.bg,
                                color: vStockColor.text,
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: vStockColor.dot,
                                  display: "inline-block",
                                }}
                              />
                              {variant.stockStatus || "out-of-stock"}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: variant.isActive ? "#10b981" : "#9ca3af",
                                fontWeight: "600",
                              }}
                            >
                              {variant.isActive ? "✓ Active" : "Inactive"}
                            </div>
                          </div>
                        </div>

                        {/* Pricing + Stock row */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "10px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              padding: "10px",
                              backgroundColor: "white",
                              borderRadius: "6px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <div style={labelStyle}>Selling Price</div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#111827",
                              }}
                            >
                              ₹{(variant.price || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                          {variant.mrp && variant.mrp > variant.price && (
                            <div
                              style={{
                                padding: "10px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              <div style={labelStyle}>MRP</div>
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#9ca3af",
                                  textDecoration: "line-through",
                                }}
                              >
                                ₹{variant.mrp.toLocaleString("en-IN")}
                              </div>
                            </div>
                          )}
                          <div
                            style={{
                              padding: "10px",
                              backgroundColor: "white",
                              borderRadius: "6px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <div style={labelStyle}>Stock Qty</div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#111827",
                              }}
                            >
                              {variant.stockQuantity}
                            </div>
                          </div>
                        </div>

                        {/* Dimensions (if present) */}
                        {variant.dimensions &&
                          (variant.dimensions.weight ||
                            variant.dimensions.length) && (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                marginBottom: "10px",
                              }}
                            >
                              {variant.dimensions.weight && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#e0e7ff",
                                    color: "#4338ca",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                  }}
                                >
                                  ⚖️ {variant.dimensions.weight}g
                                </span>
                              )}
                              {variant.dimensions.length && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#e0e7ff",
                                    color: "#4338ca",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                  }}
                                >
                                  📐 {variant.dimensions.length}×
                                  {variant.dimensions.width}×
                                  {variant.dimensions.height}{" "}
                                  {variant.dimensions.unit}
                                </span>
                              )}
                            </div>
                          )}

                        {/* Variant Specs */}
                        {variant.specifications?.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#374151",
                                marginBottom: "6px",
                              }}
                            >
                              Variant Specifications
                            </div>
                            <div style={{ display: "grid", gap: "4px" }}>
                              {variant.specifications.map((spec, si) => (
                                <div
                                  key={si}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 2fr",
                                    padding: "6px 10px",
                                    backgroundColor:
                                      si % 2 === 0 ? "#f9fafb" : "white",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <span style={{ color: "#6b7280" }}>
                                    {spec.key}
                                  </span>
                                  <span
                                    style={{
                                      color: "#111827",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {String(spec.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== SPECIFICATIONS ===== */}
            {product.specifications?.length > 0 && (
              <div style={card}>
                <h3 style={sectionTitle}>Technical Specifications</h3>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr",
                        padding: "12px 16px",
                        backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                        borderBottom:
                          index < product.specifications.length - 1
                            ? "1px solid #e5e7eb"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#6b7280",
                        }}
                      >
                        {spec.key}
                      </div>
                      <div style={{ fontSize: "13px", color: "#111827" }}>
                        {String(spec.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== KEY FEATURES ===== */}
            {product.keyFeatures?.length > 0 && (
              <div style={card}>
                <h3 style={sectionTitle}>Key Features</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                  {product.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "14px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        borderLeft: "3px solid #667eea",
                      }}
                    >
                      <MdCheckCircle
                        size={20}
                        style={{
                          color: "#10b981",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#111827",
                            marginBottom: "2px",
                          }}
                        >
                          {feature.key}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {String(feature.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== WARRANTY & RETURN ===== */}
            <div style={card}>
              <h3 style={sectionTitle}>Warranty & Return Policy</h3>
              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    🛡️ Warranty
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#166534",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.warranty || "No warranty information available"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    ↩️ Return Policy
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#1e40af",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.returnPolicy ||
                      "No return policy information available"}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== DIMENSIONS (non-variant product) ===== */}
            {!isVariantProduct &&
              product.dimensions &&
              (product.dimensions.weight || product.dimensions.length) && (
                <div style={card}>
                  <h3 style={sectionTitle}>Physical Dimensions</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {[
                      ["⚖️ Weight", product.dimensions.weight, "g"],
                      [
                        "📏 Length",
                        product.dimensions.length,
                        product.dimensions.unit,
                      ],
                      [
                        "↔️ Width",
                        product.dimensions.width,
                        product.dimensions.unit,
                      ],
                      [
                        "↕️ Height",
                        product.dimensions.height,
                        product.dimensions.unit,
                      ],
                    ]
                      .filter(([, val]) => val)
                      .map(([label, val, unit]) => (
                        <div
                          key={label}
                          style={{
                            padding: "14px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginBottom: "6px",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          >
                            {val}{" "}
                            <span
                              style={{ fontSize: "12px", fontWeight: "400" }}
                            >
                              {unit}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* ===== SEO INFO ===== */}
            {(product.metaTitle ||
              product.metaDescription ||
              product.keywords?.length > 0) && (
              <div style={card}>
                <h3 style={sectionTitle}>SEO Information</h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {product.metaTitle && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={labelStyle}>Meta Title</div>
                      <div style={valueStyle}>{product.metaTitle}</div>
                    </div>
                  )}
                  {product.metaDescription && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={labelStyle}>Meta Description</div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          lineHeight: "1.5",
                        }}
                      >
                        {product.metaDescription}
                      </div>
                    </div>
                  )}
                  {product.keywords?.length > 0 && (
                    <div>
                      <div style={{ ...labelStyle, marginBottom: "8px" }}>
                        Keywords
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {product.keywords.map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                              borderRadius: "20px",
                              fontSize: "12px",
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== TAGS ===== */}
            {product.tags?.length > 0 && (
              <div style={card}>
                <h3 style={sectionTitle}>Tags</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.tags.map((tag, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#e0e7ff",
                        color: "#4338ca",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== RELATED PRODUCTS ===== */}
            {product.relatedProducts?.length > 0 && (
              <div style={card}>
                <h3 style={sectionTitle}>Related Products</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.relatedProducts.map((rp, i) => (
                    <Link
                      key={i}
                      to={`/admin/products/details/${rp._id || rp}`}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#f0fdf4",
                        color: "#166534",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "500",
                        textDecoration: "none",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      {rp.name || rp._id || rp}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ===== ADMIN INFO ===== */}
            <div style={card}>
              <h3 style={sectionTitle}>Admin Information</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  ["Product Key", product.productKey, true],
                  ["Slug", product.slug, true],
                  [
                    "Created At",
                    product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString(
                          "en-IN",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "—",
                    false,
                  ],
                  [
                    "Last Updated",
                    product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString(
                          "en-IN",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "—",
                    false,
                  ],
                  [
                    "Created By",
                    product.createdBy
                      ? product.createdBy.name ||
                        product.createdBy.email ||
                        String(product.createdBy)
                      : "—",
                    false,
                  ],
                  ["Archived", product.isArchived ? "Yes" : "No", false],
                ].map(([label, val, mono]) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={labelStyle}>{label}</div>
                    <div
                      style={{
                        ...valueStyle,
                        fontFamily: mono ? "monospace" : "inherit",
                        fontSize: mono ? "12px" : "14px",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProductDetails;

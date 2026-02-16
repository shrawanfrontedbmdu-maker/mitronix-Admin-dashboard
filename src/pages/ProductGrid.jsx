import { Link } from "react-router-dom";
import {
  MdAdd,
  MdList,
  MdDelete,
  MdVisibility,
  MdEdit,
  MdSearch,
  MdStar,
  MdCheckCircle,
} from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStock, setFilterStock] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
        ]);
        setProducts(productsRes?.products || productsRes || []);
        setCategories(categoriesRes?.categories || categoriesRes || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== HELPERS ===== */

  // Category name — backend already populate karta hai (name, categoryKey)
  const getCategoryName = (category) => {
    if (!category) return "Uncategorized";
    if (typeof category === "object")
      return (
        category.name || category.pageTitle || category.title || "Uncategorized"
      );
    const found = categories.find((cat) => cat._id === category);
    return found
      ? found.name || found.pageTitle || found.title
      : "Uncategorized";
  };

  // Total stock — variant product: sum of variant stocks; non-variant: product.stockQuantity
  const getTotalStock = (product) =>
    product.variants?.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
      : product.stockQuantity || 0;

  // Stock badge style — schema ke hisab se: >5 in-stock, 1-5 low-stock, 0 out-of-stock
  const getStockStyle = (totalStock) => {
    if (totalStock > 5)
      return { bg: "rgba(16,185,129,0.92)", label: `${totalStock} in stock` };
    if (totalStock > 0)
      return { bg: "rgba(245,158,11,0.92)", label: `Low: ${totalStock} left` };
    return { bg: "rgba(239,68,68,0.92)", label: "Out of stock" };
  };

  // Price — variant: pehle variant ki price; non-variant: sellingPrice
  const getDisplayPrice = (product) =>
    product.variants?.length > 0
      ? product.variants[0]?.price || 0
      : product.sellingPrice || 0;

  // MRP — variant: pehle variant ka mrp; non-variant: product.mrp
  const getDisplayMRP = (product) =>
    product.variants?.length > 0 ? product.variants[0]?.mrp : product.mrp;

  /* ===== DELETE ===== */
  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await productService.deleteProduct(productId);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  /* ===== FILTER ===== */
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search) ||
      product.productKey?.toLowerCase().includes(search) ||
      product.tags?.some((t) => t.toLowerCase().includes(search));

    const matchesCategory =
      !filterCategory ||
      product.category === filterCategory ||
      product.category?._id === filterCategory;

    const matchesStatus = !filterStatus || product.status === filterStatus;

    const stock = getTotalStock(product);
    const matchesStock =
      !filterStock ||
      (filterStock === "in-stock" && stock > 5) ||
      (filterStock === "low-stock" && stock > 0 && stock <= 5) ||
      (filterStock === "out-of-stock" && stock === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const hasFilters =
    searchTerm || filterCategory || filterStatus || filterStock;

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
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  /* ===== ERROR ===== */
  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#dc2626",
              }}
            >
              {error}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              Unable to load products. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== MAIN RENDER ===== */
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
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
              Product Grid
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              {filteredProducts.length} of {products.length} product
              {products.length !== 1 ? "s" : ""}
              {hasFilters ? " (filtered)" : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
              <MdList size={18} /> List View
            </Link>
            <Link
              to="/admin/products/create"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <MdAdd size={18} /> Add Product
            </Link>
          </div>
        </div>

        {/* ===== SEARCH & FILTERS ===== */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: "1 1 260px", position: "relative" }}>
            <MdSearch
              size={20}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Search by name, brand, productKey, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: "0 1 190px" }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.pageTitle || cat.title || cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: "0 1 145px" }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div style={{ flex: "0 1 155px" }}>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterStatus("");
                setFilterStock("");
              }}
              style={{
                padding: "10px 16px",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ===== EMPTY STATE ===== */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              {hasFilters
                ? "No products match your filters"
                : "No products found"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              {hasFilters
                ? "Try adjusting your search or filters"
                : "Get started by creating your first product"}
            </p>
            {!hasFilters && (
              <Link
                to="/admin/products/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <MdAdd size={18} /> Create Product
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ===== PRODUCT CARDS GRID ===== */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredProducts.map((product) => {
                const totalStock = getTotalStock(product);
                const stockStyle = getStockStyle(totalStock);
                const displayPrice = getDisplayPrice(product);
                const displayMRP = getDisplayMRP(product);
                const isVariant = product.variants?.length > 0;
                const categoryName = getCategoryName(product.category);

                // First variant attributes summary
                const firstVariant = product.variants?.[0];
                const variantSummary = firstVariant
                  ? [
                      firstVariant.attributes?.color,
                      firstVariant.attributes?.size,
                      firstVariant.attributes?.model,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : null;

                return (
                  <div
                    key={product._id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      transition: "all 0.2s",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px -4px rgba(0,0,0,0.12)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      title="Delete Product"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "30px",
                        height: "30px",
                        backgroundColor: "rgba(239,68,68,0.85)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(239,68,68,0.85)")
                      }
                    >
                      <MdDelete size={15} />
                    </button>

                    {/* Top-left Badges */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        zIndex: 10,
                      }}
                    >
                      {product.isFeatured && (
                        <div
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(251,191,36,0.95)",
                            color: "#78350f",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <MdStar size={11} /> Featured
                        </div>
                      )}
                      {product.isRecommended && (
                        <div
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(102,126,234,0.95)",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <MdCheckCircle size={11} /> Recommended
                        </div>
                      )}
                      {product.isDigital && (
                        <div
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(99,102,241,0.9)",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          💾 Digital
                        </div>
                      )}
                    </div>

                    {/* Product Image */}
                    <Link
                      to={`/admin/products/details/${product._id}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          backgroundColor: "#f9fafb",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/300"
                          }
                          alt={product.images?.[0]?.alt || product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s",
                          }}
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/300?text=No+Image")
                          }
                          onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                          }
                        />
                        {/* Stock badge — bottom right */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            padding: "5px 10px",
                            backgroundColor: stockStyle.bg,
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {stockStyle.label}
                        </div>
                        {/* Variant count — bottom left */}
                        {isVariant && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              left: "10px",
                              padding: "5px 10px",
                              backgroundColor: "rgba(17,24,39,0.75)",
                              color: "white",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            {product.variants.length} variants
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div
                      style={{
                        padding: "14px 16px 16px",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Category */}
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#667eea",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "6px",
                          fontWeight: "700",
                        }}
                      >
                        {categoryName}
                      </div>

                      {/* Product Name */}
                      <Link
                        to={`/admin/products/details/${product._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            margin: "0 0 4px 0",
                            color: "#111827",
                            lineHeight: "1.4",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Brand */}
                      {product.brand && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#9ca3af",
                            marginBottom: "6px",
                          }}
                        >
                          {product.brand}
                        </div>
                      )}

                      {/* Variant attributes summary */}
                      {variantSummary && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "8px",
                            padding: "4px 8px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            display: "inline-block",
                          }}
                        >
                          {variantSummary}
                        </div>
                      )}

                      {/* Pricing */}
                      <div style={{ marginTop: "auto", marginBottom: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          >
                            ₹{(displayPrice || 0).toLocaleString("en-IN")}
                          </div>
                          {displayMRP && displayMRP > displayPrice && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#9ca3af",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{displayMRP.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                        {displayMRP && displayMRP > displayPrice && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#10b981",
                              fontWeight: "700",
                              marginTop: "2px",
                            }}
                          >
                            {Math.round(
                              ((displayMRP - displayPrice) / displayMRP) * 100,
                            )}
                            % OFF
                          </div>
                        )}
                        {isVariant && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#9ca3af",
                              marginTop: "2px",
                            }}
                          >
                            Starting price
                          </div>
                        )}
                      </div>

                      {/* Status + productKey row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor:
                              product.status === "active"
                                ? "#d1fae5"
                                : "#f3f4f6",
                            color:
                              product.status === "active"
                                ? "#065f46"
                                : "#6b7280",
                          }}
                        >
                          {product.status === "active"
                            ? "✓ Active"
                            : "Inactive"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            fontFamily: "monospace",
                          }}
                        >
                          {product.productKey}
                        </div>
                      </div>

                      {/* Ratings (schema: avgRating, reviewCount) */}
                      {product.avgRating > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "12px",
                          }}
                        >
                          <div style={{ display: "flex" }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                style={{
                                  color:
                                    s <= Math.round(product.avgRating)
                                      ? "#f59e0b"
                                      : "#e5e7eb",
                                  fontSize: "13px",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {product.avgRating.toFixed(1)} (
                            {product.reviewCount || 0})
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: "12px",
                        }}
                      >
                        <Link
                          to={`/admin/products/details/${product._id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "8px 10px",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                            borderRadius: "7px",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#667eea";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#374151";
                          }}
                        >
                          <MdVisibility size={15} /> View
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "8px 10px",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                            borderRadius: "7px",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "500",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#10b981";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#374151";
                          }}
                        >
                          <MdEdit size={15} /> Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Count */}
            <div
              style={{
                marginTop: "24px",
                padding: "12px 0",
                fontSize: "13px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> product
              {products.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
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

export default ProductGrid;

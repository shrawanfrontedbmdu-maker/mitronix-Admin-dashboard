import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdInventory,
  MdCategory,
  MdAttachMoney,
  MdInfo,
  MdLocalOffer,
  MdStar,
  MdCheckCircle,
} from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
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

          if (foundProduct.category) {
            const categoriesRes = await categoryService.getCategories();
            const categories = categoriesRes.categories || categoriesRes;
            const categoryId =
              foundProduct.category._id || foundProduct.category;
            const foundCategory = categories.find(
              (cat) => cat._id === categoryId,
            );
            setCategory(foundCategory);
          }
        } else {
          setError("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      try {
        setDeleting(true);
        await productService.deleteProduct(id);
        alert("Product deleted successfully!");
        navigate("/admin/products/list");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      } finally {
        setDeleting(false);
      }
    }
  };

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
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <div
            style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}
          >
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

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
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <MdArrowBack size={16} />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total stock from variants if exists
  const totalStock =
    product.variants?.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
      : product.stockQuantity || 0;

  // Get price display
  const displayPrice =
    product.sellingPrice || product.variants?.[0]?.price || 0;
  const displayMRP = product.mrp;

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
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
                fontWeight: "600",
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
                backgroundColor: "#10b981",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
              }}
            >
              <MdEdit size={16} />
              Edit Product
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
              <MdDelete size={16} />
              {deleting ? "Deleting..." : "Delete"}
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
              <MdArrowBack size={16} />
              Back to List
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Left Column - Images */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "24px",
              position: "sticky",
              top: "24px",
              alignSelf: "start",
            }}
          >
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
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/500?text=No+Image")
                }
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                  gap: "12px",
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
                          ? "2px solid #3b82f6"
                          : "1px solid #e5e7eb",
                      opacity: selectedImageIndex === index ? 1 : 0.6,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity =
                        selectedImageIndex === index ? "1" : "0.6")
                    }
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=No+Image")
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Badges */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
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
                  <MdStar size={14} />
                  Featured
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
                  <MdCheckCircle size={14} />
                  Recommended
                </div>
              )}
              {product.isDigital && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#e0e7ff",
                    color: "#4338ca",
                  }}
                >
                  Digital Product
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Product Header */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  margin: "0 0 12px 0",
                  color: "#111827",
                }}
              >
                {product.name}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    backgroundColor:
                      product.status === "active" ? "#d1fae5" : "#f3f4f6",
                    color: product.status === "active" ? "#065f46" : "#6b7280",
                  }}
                >
                  {product.status === "active" ? "Active" : "Inactive"}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    backgroundColor: totalStock > 0 ? "#d1fae5" : "#fee2e2",
                    color: totalStock > 0 ? "#065f46" : "#991b1b",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: totalStock > 0 ? "#10b981" : "#ef4444",
                    }}
                  ></span>
                  {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                </div>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "1.6",
                  margin: "0 0 16px 0",
                }}
              >
                {product.description}
              </p>

              {/* Pricing */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </div>
                  {displayMRP && displayMRP !== displayPrice && (
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
                          padding: "4px 8px",
                          backgroundColor: "#10b981",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "600",
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
                {product.costPrice && (
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    Cost Price: ₹{product.costPrice.toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              {/* Quick Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                {product.sku && (
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      SKU
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                        fontFamily: "monospace",
                      }}
                    >
                      {product.sku}
                    </div>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Brand
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {product.brand}
                    </div>
                  </div>
                )}
                {category && (
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Category
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {category.pageTitle || category.title || category.name}
                    </div>
                  </div>
                )}
                {product.modelNumber && (
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Model Number
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {product.modelNumber}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 16px 0",
                    color: "#111827",
                  }}
                >
                  Product Variants ({product.variants.length})
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {product.variants.map((variant, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#111827",
                              marginBottom: "4px",
                            }}
                          >
                            {[
                              variant.attributes?.color,
                              variant.attributes?.size,
                              variant.attributes?.model,
                            ]
                              .filter(Boolean)
                              .join(" • ") || `Variant ${index + 1}`}
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
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              variant.stockQuantity > 0 ? "#d1fae5" : "#fee2e2",
                            color:
                              variant.stockQuantity > 0 ? "#065f46" : "#991b1b",
                          }}
                        >
                          {variant.stockQuantity > 0
                            ? `${variant.stockQuantity} in stock`
                            : "Out of stock"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>
                            Price
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            ₹{variant.price.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>
                            Status
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "500",
                              color: variant.isActive ? "#10b981" : "#9ca3af",
                            }}
                          >
                            {variant.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 16px 0",
                    color: "#111827",
                  }}
                >
                  Specifications
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr",
                        padding: "12px",
                        backgroundColor:
                          index % 2 === 0 ? "#f9fafb" : "transparent",
                        borderRadius: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#6b7280",
                        }}
                      >
                        {spec.key}
                      </div>
                      <div style={{ fontSize: "14px", color: "#111827" }}>
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 16px 0",
                    color: "#111827",
                  }}
                >
                  Key Features
                </h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {product.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "6px",
                        borderLeft: "3px solid #3b82f6",
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
                          {feature.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty & Returns */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0 0 16px 0",
                  color: "#111827",
                }}
              >
                Warranty & Returns
              </h3>
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Warranty Information
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.warranty || "No warranty information available"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Return Policy
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.returnPolicy ||
                      "No return policy information available"}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            {product.dimensions &&
              (product.dimensions.weight || product.dimensions.length) && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 16px 0",
                      color: "#111827",
                    }}
                  >
                    Physical Details
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {product.dimensions.weight && (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          Weight
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {product.dimensions.weight}{" "}
                          {product.dimensions.unit === "inch" ? "lb" : "kg"}
                        </div>
                      </div>
                    )}
                    {product.dimensions.length && (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          Length
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {product.dimensions.length} {product.dimensions.unit}
                        </div>
                      </div>
                    )}
                    {product.dimensions.width && (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          Width
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {product.dimensions.width} {product.dimensions.unit}
                        </div>
                      </div>
                    )}
                    {product.dimensions.height && (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          Height
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {product.dimensions.height} {product.dimensions.unit}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 16px 0",
                    color: "#111827",
                  }}
                >
                  Tags
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.tags.map((tag, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#e0e7ff",
                        color: "#4338ca",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Info */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0 0 16px 0",
                  color: "#111827",
                }}
              >
                Admin Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Product Key
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      fontFamily: "monospace",
                    }}
                  >
                    {product.productKey}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Stock Status
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {product.stockStatus}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Low Stock Threshold
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {product.lowStockThreshold || 5} units
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Allow Backorder
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: product.allowBackorder ? "#10b981" : "#ef4444",
                    }}
                  >
                    {product.allowBackorder ? "Yes" : "No"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Created At
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Last Updated
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default ProductDetails;

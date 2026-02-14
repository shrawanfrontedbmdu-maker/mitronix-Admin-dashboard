import { Link } from "react-router-dom";
import { 
  MdAdd, MdList, MdDelete, MdVisibility, MdEdit, 
  MdSearch, MdFilterList, MdStar, MdCheckCircle 
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
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find((cat) => cat._id === categoryId || cat._id === categoryId._id);
    return category ? category.pageTitle || category.title || category.name : "N/A";
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter((product) => product._id !== productId));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.category === filterCategory || product.category?._id === filterCategory;
    
    const matchesStatus = !filterStatus || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
              {error}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Unable to load products. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>
              Product Grid
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Browse products in grid layout ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link 
              to="/products/list"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #e5e7eb'
              }}
            >
              <MdList size={18} />
              List View
            </Link>
            <Link 
              to="/products/create"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              <MdAdd size={18} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <MdSearch size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '0 1 200px' }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
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
          <div style={{ flex: '0 1 150px' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterCategory || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterStatus("");
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
              {searchTerm || filterCategory || filterStatus ? 'No products match your filters' : 'No products found'}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              {searchTerm || filterCategory || filterStatus 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first product'}
            </p>
            {!searchTerm && !filterCategory && !filterStatus && (
              <Link 
                to="/products/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <MdAdd size={18} />
                Create Product
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredProducts.map((product) => {
              // Calculate stock
              const totalStock = product.variants?.length > 0
                ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
                : product.stockQuantity || 0;

              // Get price
              const displayPrice = product.sellingPrice || product.variants?.[0]?.price || 0;
              const displayMRP = product.mrp;

              // Get variant info
              const variantInfo = product.variants?.[0]?.attributes?.color || 
                                 product.variants?.[0]?.attributes?.size || "";

              return (
                <div
                  key={product._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                    title="Delete Product"
                  >
                    <MdDelete size={16} />
                  </button>

                  {/* Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    zIndex: 10
                  }}>
                    {product.isFeatured && (
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(251, 191, 36, 0.95)',
                        color: '#78350f',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MdStar size={12} />
                        Featured
                      </div>
                    )}
                    {product.isRecommended && (
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.95)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MdCheckCircle size={12} />
                        Recommended
                      </div>
                    )}
                  </div>

                  {/* Image */}
                  <Link
                    to={`/products/details/${product._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      backgroundColor: '#f9fafb',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      
                      {/* Stock Badge on Image */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        padding: '6px 12px',
                        backgroundColor: totalStock > 0 ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Category */}
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      {getCategoryName(product.category)}
                    </div>

                    {/* Title */}
                    <Link
                      to={`/products/details/${product._id}`}
                      style={{
                        textDecoration: 'none',
                        color: '#111827',
                        marginBottom: '8px'
                      }}
                    >
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Variant Info */}
                    {variantInfo && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        {variantInfo}
                      </div>
                    )}

                    {/* Brand */}
                    {product.brand && (
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                        {product.brand}
                      </div>
                    )}

                    {/* Pricing */}
                    <div style={{ marginBottom: '12px', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                          ₹{displayPrice.toLocaleString('en-IN')}
                        </div>
                        {displayMRP && displayMRP !== displayPrice && (
                          <div style={{
                            fontSize: '14px',
                            color: '#9ca3af',
                            textDecoration: 'line-through'
                          }}>
                            ₹{displayMRP.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      {displayMRP && displayPrice < displayMRP && (
                        <div style={{
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: '600'
                        }}>
                          {Math.round(((displayMRP - displayPrice) / displayMRP) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* SKU */}
                    {product.sku && (
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        fontFamily: 'monospace',
                        marginBottom: '12px'
                      }}>
                        SKU: {product.sku}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: product.status === 'active' ? '#dbeafe' : '#f3f4f6',
                        color: product.status === 'active' ? '#1e40af' : '#6b7280'
                      }}>
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: '16px'
                    }}>
                      <Link
                        to={`/products/details/${product._id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <MdVisibility size={16} />
                        View
                      </Link>
                      <Link
                        to={`/products/edit/${product._id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <MdEdit size={16} />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        {filteredProducts.length > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '12px 0',
            fontSize: '13px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        )}
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

export default ProductGrid;
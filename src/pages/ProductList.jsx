import { Link } from "react-router-dom";
import { MdAdd, MdViewModule, MdVisibility, MdEdit, MdDelete, MdSearch, MdFilterList } from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);

      setProducts(productsRes?.products || productsRes || []);
      setCategories(categoriesRes?.categories || categoriesRes || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find((cat) => cat._id === categoryId || cat._id === categoryId._id);
    return category ? category.pageTitle || category.title || category.name : "N/A";
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  // Filter products based on search and filters
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

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* HEADER */}
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
              Product List
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Manage your products ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link 
              to="/products/grid" 
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
              <MdViewModule size={18} />
              Grid View
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

        {/* SEARCH & FILTERS */}
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
              placeholder="Search products by name, SKU, or brand..."
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
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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

        {/* ERROR */}
        {error && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            color: '#92400e',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* TABLE */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Product</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>SKU</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Category</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Price</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Stock</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Brand</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Status</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product, index) => {
                    // Display SKU
                    const skuDisplay = product.sku || 
                      (product.variants?.length > 0 
                        ? `${product.variants[0].sku}${product.variants.length > 1 ? ` +${product.variants.length - 1}` : ''}`
                        : "N/A");

                    // Display variant info
                    const variantInfo = product.variants?.[0]?.attributes?.color || 
                                       product.variants?.[0]?.attributes?.size || "";

                    // Display Price
                    const priceDisplay = product.sellingPrice || product.variants?.[0]?.price || 0;
                    const mrpDisplay = product.mrp;

                    // Status
                    const isActive = product.status === "active";

                    // Stock status
                    const totalStock = product.stockQuantity || 
                      (product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0);

                    return (
                      <tr 
                        key={product._id} 
                        style={{
                          borderBottom: index < filteredProducts.length - 1 ? '1px solid #f3f4f6' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* PRODUCT */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={product.images?.[0]?.url || "https://via.placeholder.com/60"}
                              alt={product.name}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                              }}
                              onError={(e) => e.target.src = "https://via.placeholder.com/60?text=No+Image"}
                            />
                            <div style={{ minWidth: '200px' }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '4px'
                              }}>
                                {product.name}
                              </div>
                              {variantInfo && (
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  {variantInfo}
                                </div>
                              )}
                              {product.variants?.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                  {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                            {skuDisplay}
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            {getCategoryName(product.category)}
                          </div>
                        </td>

                        {/* PRICE */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            ₹{priceDisplay?.toLocaleString('en-IN') || '0'}
                          </div>
                          {mrpDisplay && mrpDisplay !== priceDisplay && (
                            <div style={{
                              fontSize: '12px',
                              color: '#9ca3af',
                              textDecoration: 'line-through'
                            }}>
                              MRP: ₹{mrpDisplay.toLocaleString('en-IN')}
                            </div>
                          )}
                          {mrpDisplay && priceDisplay < mrpDisplay && (
                            <div style={{
                              fontSize: '11px',
                              color: '#10b981',
                              fontWeight: '500',
                              marginTop: '2px'
                            }}>
                              {Math.round(((mrpDisplay - priceDisplay) / mrpDisplay) * 100)}% off
                            </div>
                          )}
                        </td>

                        {/* STOCK */}
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: totalStock > 0 ? '#d1fae5' : '#fee2e2',
                            color: totalStock > 0 ? '#065f46' : '#991b1b'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: totalStock > 0 ? '#10b981' : '#ef4444'
                            }}></span>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                          </div>
                          {totalStock > 0 && totalStock <= (product.lowStockThreshold || 5) && (
                            <div style={{
                              fontSize: '11px',
                              color: '#f59e0b',
                              marginTop: '4px',
                              fontWeight: '500'
                            }}>
                              Low stock
                            </div>
                          )}
                        </td>

                        {/* BRAND */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            {product.brand || "—"}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: isActive ? '#dbeafe' : '#f3f4f6',
                            color: isActive ? '#1e40af' : '#6b7280'
                          }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </div>
                          {product.isFeatured && (
                            <div style={{
                              fontSize: '11px',
                              color: '#7c3aed',
                              marginTop: '4px',
                              fontWeight: '500'
                            }}>
                              ⭐ Featured
                            </div>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center'
                          }}>
                            <Link
                              to={`/products/details/${product._id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                borderRadius: '6px',
                                textDecoration: 'none',
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
                              title="View Details"
                            >
                              <MdVisibility size={16} />
                            </Link>

                            <Link
                              to={`/products/edit/${product._id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                borderRadius: '6px',
                                textDecoration: 'none',
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
                              title="Edit Product"
                            >
                              <MdEdit size={16} />
                            </Link>

                            <button
                              onClick={() => handleDelete(product._id, product.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef4444';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.color = '#374151';
                              }}
                              title="Delete Product"
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredProducts.length > 0 && (
          <div style={{
            marginTop: '16px',
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

export default ProductList;
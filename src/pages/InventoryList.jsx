import React, { useEffect, useState } from 'react';
import { productService } from '../api/productService.js';
import { MdWarning, MdRefresh, MdInventory, MdExpandMore, MdExpandLess } from 'react-icons/md';

function InventoryList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productService.getProducts();
      console.log('API Response:', response);
      
      let productList = [];
      if (Array.isArray(response)) {
        productList = response;
      } else if (response.data && Array.isArray(response.data)) {
        productList = response.data;
      } else if (response.products && Array.isArray(response.products)) {
        productList = response.products;
      }
      
      setProducts(productList);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (productId) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const reorder = async (product, variantIndex = null) => {
    const qty = parseInt(prompt('Enter quantity to add', '10'), 10);
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      let updatedProduct = { ...product };

      if (variantIndex !== null && product.variants && product.variants[variantIndex]) {
        // Update specific variant
        updatedProduct.variants = [...product.variants];
        updatedProduct.variants[variantIndex] = {
          ...updatedProduct.variants[variantIndex],
          stockQuantity: (updatedProduct.variants[variantIndex].stockQuantity || 0) + qty
        };
      } else {
        // Update main product stock
        updatedProduct.stockQuantity = (product.stockQuantity || 0) + qty;
        updatedProduct.stockStatus = (product.stockQuantity || 0) + qty > (product.lowStockThreshold || 5) 
          ? 'in-stock' 
          : 'low-stock';
      }

      await productService.updateProduct(
        product._id || product.id || product.slug,
        updatedProduct
      );

      setProducts(prev =>
        prev.map(item =>
          item._id === product._id ? updatedProduct : item
        )
      );

      setSuccess(`Stock updated successfully for ${product.name}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  const lowThreshold = 5;
  
  // Calculate stats including variants
  const calculateStats = () => {
    let totalItems = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        // Product has variants
        p.variants.forEach(v => {
          totalItems++;
          const qty = v.stockQuantity || 0;
          if (qty === 0) outOfStockItems++;
          else if (qty <= lowThreshold) lowStockItems++;
        });
      } else {
        // Regular product
        totalItems++;
        const qty = p.stockQuantity || 0;
        if (qty === 0) outOfStockItems++;
        else if (qty <= (p.lowStockThreshold || lowThreshold)) lowStockItems++;
      }
    });

    return { totalItems, lowStockItems, outOfStockItems };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
            Loading inventory...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px 32px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                color: '#111827'
              }}>
                Inventory Control
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Monitor stock levels and manage reorders
              </p>
            </div>
            <button
              onClick={fetchProducts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <MdRefresh size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Total Items
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#111827' }}>
              {stats.totalItems}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {products.length} products
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Low Stock Items
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#f59e0b' }}>
              {stats.lowStockItems}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            borderLeft: '4px solid #ef4444'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Out of Stock
            </div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#ef4444' }}>
              {stats.outOfStockItems}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {/* Products Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MdWarning size={20} color="#f59e0b" />
              Inventory List ({stats.lowStockItems} low stock alerts)
            </h3>
          </div>

          {!Array.isArray(products) || products.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <MdInventory size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                No products found
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Add products to start managing inventory
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      width: '40px'
                    }}>
                      
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Product
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Brand
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      SKU
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Stock Qty
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => {
                    const hasVariants = p.variants && p.variants.length > 0;
                    const isExpanded = expandedProducts.has(p._id);
                    
                    // For products without variants
                    const isLowStock = !hasVariants && (p.stockQuantity || 0) <= (p.lowStockThreshold || lowThreshold);
                    const isOutOfStock = !hasVariants && (p.stockQuantity || 0) === 0;

                    return (
                      <React.Fragment key={p._id || p.slug || index}>
                        {/* Main Product Row */}
                        <tr style={{
                          backgroundColor: isLowStock ? '#fef3c7' : 'white',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {hasVariants && (
                              <button
                                onClick={() => toggleExpand(p._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isExpanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#111827',
                                marginBottom: '4px'
                              }}>
                                {p.name}
                                {hasVariants && (
                                  <span style={{
                                    marginLeft: '8px',
                                    padding: '2px 8px',
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}>
                                    {p.variants.length} variants
                                  </span>
                                )}
                              </div>
                              {p.category?.name && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#6b7280'
                                }}>
                                  {p.category.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              {p.brand || '-'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                              {p.sku || (hasVariants ? 'See variants' : '-')}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {hasVariants ? (
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                {p.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)} total
                              </div>
                            ) : (
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981'
                              }}>
                                {p.stockQuantity || 0}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {hasVariants ? (
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                See variants
                              </span>
                            ) : (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                backgroundColor: isOutOfStock ? '#fef2f2' : isLowStock ? '#fef3c7' : '#dcfce7',
                                color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a'
                              }}>
                                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {!hasVariants && isLowStock ? (
                              <button
                                onClick={() => reorder(p)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                Reorder
                              </button>
                            ) : hasVariants ? (
                              <span style={{ fontSize: '13px', color: '#9ca3af' }}>-</span>
                            ) : (
                              <span style={{ fontSize: '14px', color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                        </tr>

                        {/* Variant Rows */}
                        {hasVariants && isExpanded && p.variants.map((variant, vIndex) => {
                          const vIsLowStock = (variant.stockQuantity || 0) <= lowThreshold;
                          const vIsOutOfStock = (variant.stockQuantity || 0) === 0;

                          return (
                            <tr
                              key={`${p._id}-variant-${vIndex}`}
                              style={{
                                backgroundColor: vIsLowStock ? '#fef3c7' : '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                              }}
                            >
                              <td style={{ padding: '12px 24px' }}></td>
                              <td style={{ padding: '12px 24px', paddingLeft: '48px' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                  {[
                                    variant.attributes?.color,
                                    variant.attributes?.size,
                                    variant.attributes?.model
                                  ].filter(Boolean).join(' / ') || 'Variant ' + (vIndex + 1)}
                                </div>
                              </td>
                              <td style={{ padding: '12px 24px' }}>
                                <div style={{ fontSize: '13px', color: '#9ca3af' }}>-</div>
                              </td>
                              <td style={{ padding: '12px 24px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                                  {variant.sku || '-'}
                                </div>
                              </td>
                              <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                                <div style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: vIsOutOfStock ? '#ef4444' : vIsLowStock ? '#f59e0b' : '#10b981'
                                }}>
                                  {variant.stockQuantity || 0}
                                </div>
                              </td>
                              <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  backgroundColor: vIsOutOfStock ? '#fef2f2' : vIsLowStock ? '#fef3c7' : '#dcfce7',
                                  color: vIsOutOfStock ? '#dc2626' : vIsLowStock ? '#d97706' : '#16a34a'
                                }}>
                                  {vIsOutOfStock ? 'Out of Stock' : vIsLowStock ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                                {vIsLowStock ? (
                                  <button
                                    onClick={() => reorder(p, vIndex)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Reorder
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

export default InventoryList;
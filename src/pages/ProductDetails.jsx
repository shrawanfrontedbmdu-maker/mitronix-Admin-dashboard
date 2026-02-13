import { Link, useParams, useNavigate } from 'react-router-dom'
import { MdEdit, MdDelete, MdArrowBack, MdInventory, MdCategory, MdAttachMoney, MdInfo } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { productService } from '../api/productService.js'
import { categoryService } from '../api/categoryService.js'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // For now, fetch all products and find the one with matching ID
        // In a real app, you'd have a getProductById endpoint
        const products = await productService.getProducts()
        const foundProduct = products.find(p => p._id === id)

        if (foundProduct) {
          setProduct(foundProduct)

          const categories = await categoryService.getCategories()
          const foundCategory = categories.find(cat => cat._id === foundProduct.category)
          setCategory(foundCategory)
        } else {
          setError('Product not found')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])


  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      try {
        setDeleting(true)
        await productService.deleteProduct(id)
        alert('Product deleted successfully!')
        navigate('/products/list')
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Product Details</h1>
            <p className="page-subtitle">Loading product information...</p>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Product Details</h1>
            <p className="page-subtitle">Product not found</p>
          </div>
          <div className="page-actions">
            <Link to="/products/list" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to List
            </Link>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>{error || 'Product not found'}</p>
          <Link to="/products/list" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-product-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Product Details</h1>
          <p className="page-subtitle">View and manage product information</p>
        </div>
        <div className="page-actions">
          <Link to={`/products/edit/${id}`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit Product
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={deleting}
          >
            <MdDelete size={16} />
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
          <Link to="/products/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to List
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="admin-content-container">
        <div className="product-overview">
          <div className="product-images-section">
            <div className="admin-image-container">
              <img
                className="admin-product-image"
                src={product.images && product.images.length > 0 ? product.images[selectedImageIndex]?.url || product.images[0].url : 'https://via.placeholder.com/400x400'}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="admin-thumbnail-gallery">
                <div className="admin-thumbnail-grid">
                  {product.images.map((image, index) => (
                    <img
                      key={`product-image-${product._id || 'default'}-${index}-${image.url ? image.url.split('/').pop() : index}`}
                      className={`admin-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      onClick={() => setSelectedImageIndex(index)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="product-info-section">
            <div className="content-card">
              <div className="product-header-info">
                <h2 className="product-name">{product.name}</h2>
                <div className="product-badges">
                  <span className={`status-badge ${product.stockStatus === 'InStock' ? 'active' : 'inactive'}`}>
                    {product.stockStatus === 'InStock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="admin-info-grid">
                <div className="info-card">
                  <div className="info-header">
                    <MdAttachMoney className="info-icon" />
                    <h3>Pricing Information</h3>
                  </div>
                  <div className="info-content">
                    <div className="price-row">
                      <span className="price-label">Selling Price:</span>
                      <span className="price-value main-price">₹{product.price?.toLocaleString()}</span>
                    </div>
                    {product.mrp && product.mrp !== product.price && (
                      <>
                        <div className="price-row">
                          <span className="price-label">MRP:</span>
                          <span className="price-value">₹{product.mrp?.toLocaleString()}</span>
                        </div>
                        <div className="price-row">
                          <span className="price-label">Discount:</span>
                          <span className="price-value discount">
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                          </span>
                        </div>
                      </>
                    )}
                    {product.discountPrice && product.discountPrice !== product.price && (
                      <div className="price-row">
                        <span className="price-label">Discounted Price:</span>
                        <span className="price-value">₹{product.discountPrice?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <MdInventory className="info-icon" />
                    <h3>Inventory & Stock</h3>
                  </div>
                  <div className="info-content">
                    <div className="stock-row">
                      <span className="stock-label">Stock Quantity:</span>
                      <span className={`stock-value ${product.stockQuantity === 0 ? 'out-of-stock' : 'in-stock'}`}>
                        {product.stockQuantity || 0} units
                      </span>
                    </div>
                    <div className="stock-row">
                      <span className="stock-label">Stock Status:</span>
                      <span className={`stock-status ${product.stockStatus === 'InStock' ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stockStatus === 'InStock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    {product.sku && (
                      <div className="stock-row">
                        <span className="stock-label">SKU:</span>
                        <span className="stock-value">{product.sku}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <MdCategory className="info-icon" />
                    <h3>Product Details</h3>
                  </div>
                  <div className="info-content">
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{category ? category.title : 'Unknown'}</span>
                    </div>
                    {product.brand && (
                      <div className="detail-row">
                        <span className="detail-label">Brand:</span>
                        <span className="detail-value">{product.brand}</span>
                      </div>
                    )}
                    {product.colour && (
                      <div className="detail-row">
                        <span className="detail-label">Color:</span>
                        <span className="detail-value">{product.colour}</span>
                      </div>
                    )}
                    {product.size && (
                      <div className="detail-row">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{product.size}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-header">
                    <MdInfo className="info-icon" />
                    <h3>Additional Information</h3>
                  </div>
                  <div className="info-content">
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{new Date(product.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">{new Date(product.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    {product.weight && (
                      <div className="detail-row">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="detail-row">
                        <span className="detail-label">Dimensions:</span>
                        <span className="detail-value">{product.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="description-section">
                  <h3>Product Description</h3>
                  <p className="description-text">{product.description}</p>
                </div>
              )}
   
              {/* {product.variants && product.variants.length > 0 && (
                <div className="variants-section">
                  <h3>Available Variants</h3>
                  <div className="variants-list">
                    {product.variants?.map((variant, index) => (
                      <span key={`variant-${product._id || 'default'}-${index}-${variant.replace(/[^a-zA-Z0-9]/g, '')}`} className="variant-badge">{variant}</span>
                    ))}
                  </div>
                </div>
              )} */}

              {/* {product.tags && product.tags.length > 0 && (
                <div className="tags-section">
                  <h3>Product Tags</h3>
                  <div className="tags-list">
                    {product.tags.map((tag, index) => (
                      <span key={`tag-${product._id || 'default'}-${index}-${tag.replace(/[^a-zA-Z0-9]/g, '')}`} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Additional Product Information */}
        <div className="product-additional-info">

          <div className="info-tab-content">
            {product.specification && (
              <div className="tab-section">
                <h3>Specifications</h3>
                <div className="specifications-content">
                  <p>{product.specification}</p>
                </div>
              </div>
            )}

            {(product.warranty || product.returnPolicy) && (
              <div className="tab-section">
                <h3>Warranty & Returns</h3>
                <div className="warranty-info">
                  {product.warranty && (
                    <div className="info-item">
                      <h4>Warranty</h4>
                      <p>{product.warranty}</p>
                    </div>
                  )}
                  {product.returnPolicy && (
                    <div className="info-item">
                      <h4>Return Policy</h4>
                      <p>{product.returnPolicy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {product.shipping && (
              <div className="tab-section">
                <h3>Shipping Information</h3>
                <div className="shipping-info">
                  <div className="shipping-item">
                    <strong>Delivery:</strong> {product.shipping.charges}
                  </div>
                  <div className="shipping-item">
                    <strong>Delivery Time:</strong> {product.shipping.deliveryTime}
                  </div>
                  {product.shipping.restrictions && (
                    <div className="shipping-item">
                      <strong>Note:</strong> {product.shipping.restrictions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(product.weight || product.dimensions) && (
              <div className="tab-section">
                <h3>Physical Details</h3>
                <div className="physical-details">
                  {product.weight && (
                    <div className="detail-row">
                      <span className="detail-label">Weight:</span>
                      <span className="detail-value">{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="detail-row">
                      <span className="detail-label">Dimensions:</span>
                      <span className="detail-value">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin-only sections */}
            <div className="admin-only-section">
              <h3>Admin Information</h3>

              {(product.barcode || product.hsnCode) && (
                <div className="admin-codes">
                  <h4>Product Codes</h4>
                  {product.barcode && (
                    <div className="code-item">
                      <span className="code-label">Barcode:</span>
                      <span className="code-value">{product.barcode}</span>
                    </div>
                  )}
                  {product.hsnCode && (
                    <div className="code-item">
                      <span className="code-label">HSN Code:</span>
                      <span className="code-value">{product.hsnCode}</span>
                    </div>
                  )}
                </div>
              )}

              {product.supplier && (
                <div className="supplier-info">
                  <h4>Supplier Details</h4>
                  <div className="supplier-details">
                    <div className="supplier-row">
                      <span className="supplier-label">Name:</span>
                      <span className="supplier-value">{product.supplier.name}</span>
                    </div>
                    {product.supplier.contact && (
                      <div className="supplier-row">
                        <span className="supplier-label">Contact:</span>
                        <span className="supplier-value">{product.supplier.contact}</span>
                      </div>
                    )}
                    {product.supplier.email && (
                      <div className="supplier-row">
                        <span className="supplier-label">Email:</span>
                        <span className="supplier-value">{product.supplier.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="product-history">
                <h4>Product History</h4>
                <div className="history-details">
                  <div className="history-row">
                    <span className="history-label">Created:</span>
                    <span className="history-value">{new Date(product.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="history-row">
                    <span className="history-label">Last Updated:</span>
                    <span className="history-value">{new Date(product.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="history-row">
                    <span className="history-label">Status:</span>
                    <span className="history-value">{product.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails

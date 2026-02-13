import { Link } from "react-router-dom";
import { MdAdd, MdList, MdDelete, MdVisibility, MdEdit } from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
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
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.title : "Unknown";
  };

 const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await productService.deleteProduct(productId)
        // Remove the deleted product from the state
        setProducts(products.filter(product => product._id !== productId))
        alert('Product deleted successfully!')
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Product Grid</h1>
            <p className="page-subtitle">Manage your products inventory</p>
          </div>
        </div>
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Product List</h1>
            <p className="page-subtitle">Manage your products inventory</p>
          </div>
          <div className="page-actions">
            <Link to="/products/create" className="btn btn-primary">
              <MdAdd size={16} />
              Add Product
            </Link>
          </div>
        </div>
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <p style={{ color: "#dc2626", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Product Grid</h1>
          <p className="page-subtitle">
            Browse products in grid layout ({products.length} products)
          </p>
        </div>
        <div className="page-actions">
          <Link to="/products/create" className="btn btn-primary">
            <MdAdd size={16} />
            Add Product
          </Link>
          <Link to="/products/list" className="btn btn-secondary">
            <MdList size={16} />
            List View
          </Link>
        </div>
      </div>
    
      <div className="products-grid">
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ marginBottom: "20px" }}>No products found.</p>
            <Link to="/products/create" className="btn btn-primary">
              <MdAdd size={16} />
              Create Your First Product
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-card-header">
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="delete-btn"
                  title="Delete Product"
                >
                  <MdDelete size={16} />
                </button>
              </div>

              <div className="product-image-container">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0].url : 'https://via.placeholder.com/50x50'}
                  alt={product.name}
                  className="product-card-image"
                />
              </div>

              <div className="product-card-content">
                <h3 className="product-card-title">{product.name}</h3>

                {product.brand && (
                  <p className="product-card-brand">Brand: {product.brand}</p>
                )}

                <p className="product-card-category">{getCategoryName(product.category)}</p>

                {product.sku && (
                  <p className="product-card-sku">SKU: {product.sku}</p>
                )}

                <div className="product-card-pricing">
                  <div className="selling-price">₹{product.price?.toLocaleString()}</div>
                  {product.mrp && product.mrp > product.price && (
                    <div className="mrp-price">MRP: ₹{product.mrp?.toLocaleString()}</div>
                  )}
                  {product.mrp && product.mrp > product.price && (
                    <div className="discount-info">
                      {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}% OFF
                    </div>
                  )}
                </div>

                <div className="product-card-variants">
                  {product.colour && (
                    <span className="variant-info">Color: {product.colour}</span>
                  )}
                  {product.size && (
                    <span className="variant-info">Size: {product.size}</span>
                  )}
                </div>

                <div className="product-card-meta">
                  <span
                    className={`stock-badge ${
                      product.stockQuantity === 0 ? "out-of-stock" : "in-stock"
                    }`}
                  >
                    Stock: {product.stockQuantity || 0}
                  </span>
                  <span
                    className={`status-badge ${
                      product.stockStatus === "InStock" ? "active" : "inactive"
                    }`}
                  >
                    {product.stockStatus === "InStock" ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {product.warranty && (
                  <div className="product-card-warranty">
                    <small>📅 {product.warranty}</small>
                  </div>
                )}
              </div>

              <div className="product-card-actions">
                <Link
                  to={`/products/details/${product._id}`}
                  className="card-action-btn view"
                >
                  <MdVisibility size={16} className="view-icon" />
                  View
                </Link>
                <Link
                  to={`/products/edit/${product._id}`}
                  className="card-action-btn edit"
                >
                  <MdEdit size={16} className="edit-icon" />
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductGrid;

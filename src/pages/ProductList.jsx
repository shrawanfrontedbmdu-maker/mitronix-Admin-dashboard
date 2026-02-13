import { Link } from "react-router-dom";
import { MdAdd, MdViewModule, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      setProducts(productsRes?.products || []);
      setCategories(categoriesRes || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.title || category.name : "N/A";
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="content-card" style={{ textAlign: "center", padding: "40px" }}>
        <div className="loader"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product List</h1>
          <p className="page-subtitle">Manage your products ({products.length})</p>
        </div>

        <div className="page-actions">
          <Link to="/products/create" className="btn btn-primary">
            <MdAdd /> Add Product
          </Link>
          <Link to="/products/grid" className="btn btn-secondary">
            <MdViewModule /> Grid View
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="content-card" style={{ background: "#fef3c7", color: "#92400e" }}>
          ⚠️ {error}
        </div>
      )}

      {/* TABLE */}
      <div className="content-card">
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No products found</p>
            <Link to="/products/create" className="btn btn-primary">
              Create Product
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  // Display SKU
                  const skuDisplay =
                    product.sku ||
                    (product.variants?.length > 0 ? product.variants[0].sku + " +" + (product.variants.length - 1) : "N/A");

                  // Display Color (from first variant if exists)
                  const colorDisplay = product.variants?.[0]?.attributes?.color || "";

                  // Display Price
                  const priceDisplay = product.sellingPrice || product.variants?.[0]?.price || 0;
                  const mrpDisplay = product.mrp || product.variants?.[0]?.mrp;

                  // Status
                  const statusDisplay = product.status === "active";

                  return (
                    <tr key={product._id}>
                      {/* PRODUCT */}
                      <td>
                        <div className="product-info">
                          <img
                            src={product.images?.[0]?.url || "https://via.placeholder.com/50"}
                            alt={product.name}
                            className="product-image"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/50?text=No+Image")}
                          />
                          <div>
                            <strong>{product.name}</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>{colorDisplay}</div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>{skuDisplay}</td>

                      {/* CATEGORY */}
                      <td>{getCategoryName(product.category)}</td>

                      {/* PRICE */}
                      <td>
                        <strong>₹{priceDisplay}</strong>
                        {mrpDisplay && (
                          <div style={{ fontSize: "12px", color: "#888" }}>MRP: ₹{mrpDisplay}</div>
                        )}
                      </td>

                      {/* STOCK */}
                      <td>
                        <span className={product.stockQuantity > 0 ? "badge green" : "badge red"}>
                          {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>

                      {/* BRAND */}
                      <td>{product.brand || "N/A"}</td>

                      {/* STATUS */}
                      <td>
                        <span className={statusDisplay ? "badge blue" : "badge gray"}>
                          {statusDisplay ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="action-buttons">
                          <Link to={`/products/details/${product._id}`} className="action-btn view">
                            <MdVisibility />
                          </Link>

                          <Link to={`/products/edit/${product._id}`} className="action-btn edit">
                            <MdEdit />
                          </Link>

                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="action-btn delete"
                          >
                            <MdDelete />
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
    </div>
  );
}

export default ProductList;

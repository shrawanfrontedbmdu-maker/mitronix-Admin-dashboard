import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdSave, MdAdd, MdDelete, MdSearch } from "react-icons/md";
import { orderService } from "../api/orderService.js";
import { productService } from "../api/productService.js";

function OrderAdd() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    orderNumber: "",
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    priority: "Normal",
    status: "Draft",
    customer: {
      name: "",
      company: "",
      address: "",
      city: "",
      email: "",
      phone: "",
    },
    products: [
      {
        id: 1,
        productId: "",
        name: "",
        sku: "",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ],
    notes: "",
    shippingAddress: "",
    paymentMethod: "Credit Card",
    taxRate: 10,
    shippingCost: 0,
    discountAmount: 0,
  });

  const [showProductSelector, setShowProductSelector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const productsData = await productService.getProducts();
        const list = Array.isArray(productsData)
          ? productsData
          : productsData?.data || [];
        if (mounted) setAvailableProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (mounted) setAvailableProducts([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("customer.")) {
      const customerField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value,
        },
      }));
    } else {
      let processedValue = value;
      if (["taxRate", "shippingCost", "discountAmount"].includes(name)) {
        processedValue = value === "" ? 0 : parseFloat(value) || 0;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };

    if (field === "quantity" || field === "price") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : updatedProducts[index].quantity;
      const price =
        field === "price"
          ? parseFloat(value) || 0
          : updatedProducts[index].price;
      updatedProducts[index].total = quantity * price;
    }

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const selectProduct = (productIndex, product) => {
    const updatedProducts = [...formData.products];
    const price = product && (product.price !== undefined && product.price !== null) ? parseFloat(product.price) || 0 : 0;
    const name = product?.name || "";
    const sku = product?.sku || "";
    const productId = product?._id || product?.id || "";

    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      productId,
      name,
      sku,
      price,
      total: (parseFloat(updatedProducts[productIndex].quantity) || 0) * price,
    };

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));

    setShowProductSelector(null);
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      productId: "",
      name: "",
      sku: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      const productTotal = parseFloat(product.total) || 0;
      return sum + productTotal;
    }, 0);

    const taxRate = parseFloat(formData.taxRate) || 0;
    const shippingCost = parseFloat(formData.shippingCost) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;

    const tax = (subtotal * taxRate) / 100;
    const total = Math.max(0, subtotal + tax + shippingCost - discountAmount);

    return {
      subtotal: Math.max(0, subtotal),
      tax: Math.max(0, tax),
      total: Math.max(0, total),
    };
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const { subtotal, tax, total } = calculateTotals();

  //     const orderData = {
  //       customerName: formData.customer.name,
  //       products: formData.products.map((product) => ({
  //         productId:
  //           product.productId && product.productId !== ""
  //             ? product.productId
  //             : null,
  //         name: product.name,
  //         quantity: parseInt(product.quantity) || 1,
  //         price: parseFloat(product.price) || 0,
  //       })),
  //       shippingAddress: {
  //         address: formData.customer.address,
  //         city: formData.customer.city,
  //         email: formData.customer.email,
  //         phone: formData.customer.phone,
  //         company: formData.customer.company,
  //       },
  //       paymentMethod: formData.paymentMethod || "COD",
  //       paymentStatus: "Pending",
  //       orderStatus: formData.status || "Processing",
  //       totalAmount: total,
  //       orderDate: new Date(formData.orderDate),
  //       deliveryDate: formData.deliveryDate
  //         ? new Date(formData.deliveryDate)
  //         : null,
  //       priority: formData.priority || "Normal",
  //       notes: formData.notes || "",
  //       taxRate: parseFloat(formData.taxRate) || 0,
  //       shippingCost: parseFloat(formData.shippingCost) || 0,
  //       discountAmount: parseFloat(formData.discountAmount) || 0,
  //     };

  //     await orderService.createOrder(orderData);
  //     alert("Order created successfully!");
  //     navigate("/orders/list");
  //   } catch (error) {
  //     console.error("Error creating order:", error);
  //     setError(error.message || "Failed to create order. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { subtotal, tax, total } = calculateTotals();

      const orderData = {
        customerName: formData.customer.name,

        products: formData.products.map((product) => ({
          productId:
            product.productId && product.productId !== ""
              ? product.productId
              : null,
          name: product.name,
          sku: product.sku || "",          // ✅ SKU added
          quantity: parseInt(product.quantity) || 1,
          price: parseFloat(product.price) || 0,
        })),

        shippingAddress: {
          address: formData.customer.address,
          city: formData.customer.city,
          email: formData.customer.email,
          phone: formData.customer.phone,
          company: formData.customer.company,
        },

        paymentMethod: formData.paymentMethod || "COD",
        paymentStatus: "Pending",
        orderStatus: formData.status || "Processing",

        totalAmount: total,
        orderDate: formData.orderDate
          ? new Date(formData.orderDate)
          : new Date(),

        deliveryDate: formData.deliveryDate
          ? new Date(formData.deliveryDate)
          : null,

        priority: formData.priority || "Normal",
        notes: formData.notes || "",

        taxRate: parseFloat(formData.taxRate) || 0,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        discountAmount: parseFloat(formData.discountAmount) || 0,
      };

      await orderService.createOrder(orderData);

      alert("Order created successfully!");
      navigate("/orders/list");
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error?.response?.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Add Order</h1>
          <p className="page-subtitle">Create a new customer order</p>
        </div>
        <div className="page-actions">
          <Link to="/orders/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              borderLeft: "4px solid #ef4444",
              marginBottom: "20px",
              padding: "12px 16px",
            }}
          >
            <p style={{ color: "#dc2626", margin: 0, fontSize: "14px" }}>
              ❌ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-grid">
            {/* Order Details */}
            <div className="content-card">
              <h3>Order Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="orderNumber">Order Number *</label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="ORD-2024-001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="orderDate">Order Date *</label>
                  <input
                    type="date"
                    id="orderDate"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deliveryDate">Expected Delivery Date</label>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Order Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="content-card">
              <h3>Customer Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer.name">Customer Name *</label>
                  <input
                    type="text"
                    id="customer.name"
                    name="customer.name"
                    value={formData.customer.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customer.company">Company</label>
                  <input
                    type="text"
                    id="customer.company"
                    name="customer.company"
                    value={formData.customer.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer.email">Email *</label>
                  <input
                    type="email"
                    id="customer.email"
                    name="customer.email"
                    value={formData.customer.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customer.phone">Phone</label>
                  <input
                    type="tel"
                    id="customer.phone"
                    name="customer.phone"
                    value={formData.customer.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer.address">Billing Address</label>
                <textarea
                  id="customer.address"
                  name="customer.address"
                  value={formData.customer.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="123 Customer Street"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer.city">City</label>
                <input
                  type="text"
                  id="customer.city"
                  name="customer.city"
                  value={formData.customer.city}
                  onChange={handleInputChange}
                  placeholder="New York, NY 10001"
                />
              </div>
            </div>
          </div>
          {/* Products Section */}
          <div className="content-card">
            <div className="section-header">
              <h3>Order Products</h3>
              <button
                type="button"
                onClick={addProduct}
                className="btn btn-outline"
              >
                <MdAdd size={16} />
                Add Product
              </button>
            </div>

            <div className="products-table">
              <div className="table-header">
                <div className="col-product">Product</div>
                <div className="col-sku">SKU</div>
                <div className="col-quantity">Quantity</div>
                <div className="col-price">Price</div>
                <div className="col-total">Total</div>
                <div className="col-actions">Actions</div>
              </div>

              {formData.products.map((product, index) => (
                <div key={product.id} className="table-row">
                  <div className="col-product">
                    <div className="product-selector">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(index, "name", e.target.value)
                        }
                        placeholder="Select or enter product name"
                        required
                      />
                      <button
                        type="button"
                        className="product-search-btn"
                        onClick={() => setShowProductSelector(index)}
                      >
                        <MdSearch size={16} />
                      </button>

                      {showProductSelector === index && (
                        <div className="product-dropdown">
                          <div className="dropdown-header">
                            <strong>Select Product</strong>
                            <button
                              type="button"
                              onClick={() => setShowProductSelector(null)}
                              className="close-dropdown"
                            >
                              ×
                            </button>
                          </div>
                          <div className="product-list">
                            {availableProducts.map((availableProduct) => (
                              <div
                                key={availableProduct._id || availableProduct.id}
                                className="product-option"
                                onClick={() =>
                                  selectProduct(index, availableProduct)
                                }
                              >
                                <div className="product-info">
                                  <div className="product-name">
                                    {availableProduct.name}
                                  </div>
                                  <div className="product-details">
                                    SKU: {availableProduct.sku} | Stock:{" "}
                                    {availableProduct.stock} | ₹
                                    {availableProduct.price}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-sku">
                    <input
                      type="text"
                      value={product.sku}
                      onChange={(e) =>
                        handleProductChange(index, "sku", e.target.value)
                      }
                      placeholder="SKU"
                      required
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-price">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(index, "price", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-total">
                    <span className="total-display">
                      ₹{(parseFloat(product.total) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="action-btn delete"
                      disabled={formData.products.length === 1}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="totals-section">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="taxRate">Tax Rate (%)</label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingCost">Shipping Cost</label>
                    <input
                      type="number"
                      id="shippingCost"
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="discountAmount">Discount Amount</label>
                  <input
                    type="number"
                    id="discountAmount"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="totals-display">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>₹{(subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax ({parseFloat(formData.taxRate) || 0}%):</span>
                    <span>₹{(tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>
                      ₹{(parseFloat(formData.shippingCost) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>
                      -₹{(parseFloat(formData.discountAmount) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>₹{(total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Additional Information */}
          <div className="content-card">
            <h3>Additional Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="shippingAddress">Shipping Address</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter shipping address (if different from billing address)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Order Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Special instructions or notes for this order..."
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <MdSave size={16} />
              {loading ? "Creating Order..." : "Create Order"}
            </button>
            <Link to="/orders/list" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderAdd;

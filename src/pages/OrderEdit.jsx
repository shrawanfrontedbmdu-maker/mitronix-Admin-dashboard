import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdSave, MdAdd, MdDelete, MdSearch } from 'react-icons/md'
import { orderService } from '../api/orderService.js'

function OrderEdit() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    customerName: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    priority: 'Normal',
    orderStatus: 'Processing',
    shippingAddress: {
      address: '',
      city: '',
      email: '',
      phone: '',
      company: ''
    },
    products: [],
    notes: '',
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    taxRate: 0,
    shippingCost: 0,
    discountAmount: 0
  })

  const [showProductSelector, setShowProductSelector] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadOrderData()
    }
  }, [id])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      setError('')
      const orders = await orderService.getOrders()
      const order = orders.find(o => o._id === id)

      if (order) {
        setFormData({
          customerName: order.customerName || '',
          orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
          priority: order.priority || 'Normal',
          orderStatus: order.orderStatus || 'Processing',
          shippingAddress: {
            address: order.shippingAddress?.address || '',
            city: order.shippingAddress?.city || '',
            email: order.shippingAddress?.email || '',
            phone: order.shippingAddress?.phone || '',
            company: order.shippingAddress?.company || ''
          },
          products: order.products?.map(product => ({
            id: product._id || Date.now(),
            productId: product.productId,
            name: product.name || '',
            sku: product.sku || '',
            quantity: product.quantity || 1,
            price: product.price || 0,
            total: (product.quantity || 1) * (product.price || 0)
          })) || [],
          notes: order.notes || '',
          paymentMethod: order.paymentMethod || 'COD',
          paymentStatus: order.paymentStatus || 'Pending',
          taxRate: order.taxRate || 0,
          shippingCost: order.shippingCost || 0,
          discountAmount: order.discountAmount || 0
        })
      } else {
        setError('Order not found')
      }
    } catch (error) {
      console.error('Error loading order:', error)
      setError('Failed to load order data')
    } finally {
      setLoading(false)
    }
  }
  
  const availableProducts = [
    { id: 1, name: 'Wireless Headphones', sku: 'WH-001', price: 99.99, stock: 50 },
    { id: 2, name: 'Bluetooth Speaker', sku: 'BS-002', price: 79.99, stock: 30 },
    { id: 3, name: 'USB-C Cable', sku: 'UC-003', price: 19.99, stock: 100 },
    { id: 4, name: 'Wireless Mouse', sku: 'WM-004', price: 49.99, stock: 75 },
    { id: 5, name: 'Laptop Stand', sku: 'LS-005', price: 89.99, stock: 25 },
    { id: 6, name: 'Phone Case', sku: 'PC-006', price: 29.99, stock: 80 }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('shippingAddress.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }))
    } else {
      let processedValue = value
      if (['taxRate', 'shippingCost', 'discountAmount'].includes(name)) {
        processedValue = value === '' ? 0 : parseFloat(value) || 0
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }))
    }
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    }
    
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedProducts[index].quantity
      const price = field === 'price' ? parseFloat(value) || 0 : updatedProducts[index].price
      updatedProducts[index].total = quantity * price
    }
    
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }))
  }

  const selectProduct = (productIndex, product) => {
    const updatedProducts = [...formData.products]
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      total: updatedProducts[productIndex].quantity * product.price
    }
    
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }))
    
    setShowProductSelector(null)
  }

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      productId: '',
      name: '',
      sku: '',
      quantity: 1,
      price: 0,
      total: 0
    }
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }))
  }

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      const productTotal = parseFloat(product.total) || 0
      return sum + productTotal
    }, 0)

    const taxRate = parseFloat(formData.taxRate) || 0
    const shippingCost = parseFloat(formData.shippingCost) || 0
    const discountAmount = parseFloat(formData.discountAmount) || 0

    const tax = (subtotal * taxRate) / 100
    const total = Math.max(0, subtotal + tax + shippingCost - discountAmount)

    return {
      subtotal: Math.max(0, subtotal),
      tax: Math.max(0, tax),
      total: Math.max(0, total)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setError('')

    try {
      const { subtotal, tax, total } = calculateTotals()

      const orderData = {
        customerName: formData.customerName,
        products: formData.products.map(product => ({
          productId: product.productId && product.productId !== '' ? product.productId : null,
          name: product.name,
          quantity: parseInt(product.quantity) || 1,
          price: parseFloat(product.price) || 0,
          sku:product.sku||"",
        })),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod || 'COD',
        paymentStatus: formData.paymentStatus || 'Pending',
        orderStatus: formData.orderStatus || 'Processing',
        totalAmount: total,
        orderDate: new Date(formData.orderDate),
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : null,
        priority: formData.priority || 'Normal',
        notes: formData.notes || '',
        taxRate: parseFloat(formData.taxRate) || 0,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        discountAmount: parseFloat(formData.discountAmount) || 0
      }

      await orderService.updateOrder(id, orderData)
      alert('Order updated successfully!')
      navigate(`/orders/details/${id}`)
    } catch (error) {
      console.error('Error updating order:', error)
      setError(error.message || 'Failed to update order. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Edit Order</h1>
            <p className="page-subtitle">Loading order data...</p>
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
          <p>Loading order...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Edit Order</h1>
          <p className="page-subtitle">Update order #{id?.slice(-8) || 'Unknown'}</p>
        </div>
        <div className="page-actions">
          <Link to="/orders/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Orders
          </Link>
          <Link to={`/orders/details/${id}`} className="btn btn-outline">
            View Details
          </Link>
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            marginBottom: '20px',
            padding: '12px 16px'
          }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>
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
                  <label>Order ID</label>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    #{id?.slice(-8) || 'Loading...'}
                  </div>
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
                <label htmlFor="orderStatus">Order Status *</label>
                <select
                  id="orderStatus"
                  name="orderStatus"
                  value={formData.orderStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="content-card">
              <h3>Customer Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerName">Customer Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="shippingAddress.company">Company</label>
                  <input
                    type="text"
                    id="shippingAddress.company"
                    name="shippingAddress.company"
                    value={formData.shippingAddress.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shippingAddress.email">Email *</label>
                  <input
                    type="email"
                    id="shippingAddress.email"
                    name="shippingAddress.email"
                    value={formData.shippingAddress.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="shippingAddress.phone">Phone</label>
                  <input
                    type="tel"
                    id="shippingAddress.phone"
                    name="shippingAddress.phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shippingAddress.address">Address</label>
                <textarea
                  id="shippingAddress.address"
                  name="shippingAddress.address"
                  value={formData.shippingAddress.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="123 Customer Street"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shippingAddress.city">City</label>
                <input
                  type="text"
                  id="shippingAddress.city"
                  name="shippingAddress.city"
                  value={formData.shippingAddress.city}
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
              <button type="button" onClick={addProduct} className="btn btn-outline">
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
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
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
                                key={availableProduct.id}
                                className="product-option"
                                onClick={() => selectProduct(index, availableProduct)}
                              >
                                <div className="product-info">
                                  <div className="product-name">{availableProduct.name}</div>
                                  <div className="product-details">
                                    SKU: {availableProduct.sku} | Stock: {availableProduct.stock} | ₹{availableProduct.price.toLocaleString()}
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
                      onChange={(e) => handleProductChange(index, 'sku', e.target.value)}
                      placeholder="SKU"
                      required
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-price">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-total">
                    <span className="total-display">₹{product.total.toLocaleString()}</span>
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
                    <span>Tax ({(parseFloat(formData.taxRate) || 0)}%):</span>
                    <span>₹{(tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>₹{(parseFloat(formData.shippingCost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>-₹{(parseFloat(formData.discountAmount) || 0).toFixed(2)}</span>
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
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="paymentStatus">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="shippingAddress">Shipping Address</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress.address}
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
            <button type="submit" className="btn btn-primary" disabled={updating}>
              <MdSave size={16} />
              {updating ? 'Updating Order...' : 'Update Order'}
            </button>
            <Link to="/orders/list" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderEdit

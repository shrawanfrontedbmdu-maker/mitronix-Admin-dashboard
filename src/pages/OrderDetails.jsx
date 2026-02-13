import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MdArrowBack, MdPrint, MdEdit, MdLocalShipping, MdCheckCircle } from 'react-icons/md'
import { orderService } from '../api/orderService.js'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
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

      // Get all orders and find the one with matching ID
      const orders = await orderService.getOrders()
      const foundOrder = orders.find(o => o._id === id)

      if (foundOrder) {
        setOrder(foundOrder)
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

  const calculateTotals = () => {
    if (!order || !order.products) return { subtotal: 0, tax: 0, total: 0 }

    const subtotal = order.products.reduce((sum, product) => {
      const productTotal = (product.quantity || 0) * (product.price || 0)
      return sum + productTotal
    }, 0)

    const taxRate = parseFloat(order.taxRate) || 0
    const shippingCost = parseFloat(order.shippingCost) || 0
    const discountAmount = parseFloat(order.discountAmount) || 0

    const tax = (subtotal * taxRate) / 100
    const total = subtotal + tax + shippingCost - discountAmount

    return {
      subtotal: Math.max(0, subtotal),
      tax: Math.max(0, tax),
      total: Math.max(0, total)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      // Order statuses
      case 'Delivered':
      case 'Completed':
      case 'Paid': return 'status-success'
      case 'Processing':
      case 'Packaging':
      case 'Pending': return 'status-warning'
      case 'Shipped':
      case 'Draft': return 'status-info'
      case 'Cancelled':
      case 'Failed':
      case 'Refunded': return 'status-danger'
      default: return 'status-secondary'
    }
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload()
  }
  const getProgressSteps = () => {
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'
    const currentStatus = order.orderStatus || 'Pending'
    const paymentStatus = order.paymentStatus || 'Pending'

    const steps = [
      {
        id: 'placed',
        title: 'Order Placed',
        date: orderDate,
        icon: MdCheckCircle,
        statuses: ['Pending', 'Processing', 'Packaging', 'Shipped', 'Delivered', 'Completed']
      },
      {
        id: 'payment',
        title: 'Payment Confirmed',
        date: paymentStatus === 'Paid' ? orderDate : (paymentStatus === 'Failed' ? 'Failed' : 'Pending'),
        icon: MdCheckCircle,
        statuses: paymentStatus === 'Paid' ? ['Processing', 'Packaging', 'Shipped', 'Delivered', 'Completed'] : []
      },
      {
        id: 'processing',
        title: 'Processing',
        date: ['Processing', 'Packaging', 'Shipped', 'Delivered', 'Completed'].includes(currentStatus) ? 'In progress' : 'Pending',
        icon: MdEdit,
        statuses: ['Processing', 'Packaging', 'Shipped', 'Delivered', 'Completed']
      },
      {
        id: 'shipped',
        title: 'Shipped',
        date: ['Shipped', 'Delivered', 'Completed'].includes(currentStatus) ? 'In transit' : 'Pending',
        icon: MdLocalShipping,
        statuses: ['Shipped', 'Delivered', 'Completed']
      },
      {
        id: 'delivered',
        title: 'Delivered',
        date: ['Delivered', 'Completed'].includes(currentStatus) ? (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Delivered') : 'Pending',
        icon: MdCheckCircle,
        statuses: ['Delivered', 'Completed']
      }
    ]

    return steps.map(step => {
      let stepClass = ''
      let isActive = false

      if (currentStatus === 'Cancelled' || currentStatus === 'Failed') {
        // Show order as placed but everything else as cancelled
        if (step.id === 'placed') {
          stepClass = 'completed'
        } else {
          stepClass = 'cancelled'
        }
      } else if (step.statuses.includes(currentStatus)) {
        if (step.id === 'payment' && paymentStatus === 'Failed') {
          stepClass = 'cancelled'
        } else if (step.id === 'payment' && paymentStatus !== 'Paid') {
          stepClass = 'pending'
        } else if (
          (step.id === 'processing' && (currentStatus === 'Processing' || currentStatus === 'Packaging')) ||
          (step.id === 'shipped' && currentStatus === 'Shipped')
        ) {
          stepClass = 'active'
          isActive = true
        } else {
          stepClass = 'completed'
        }
      } else {
        stepClass = 'pending'
      }

      return { ...step, stepClass, isActive }
    })
  }

  const { subtotal, tax, total } = calculateTotals()

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Order Details</h1>
            <p className="page-subtitle">Loading order...</p>
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
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Order Details</h1>
            <p className="page-subtitle">Error loading order</p>
          </div>
          <div className="page-actions">
            <Link to="/orders/list" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to Orders
            </Link>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            ❌ {error || 'Order not found'}
          </p>
          <Link to="/orders/list" className="btn btn-primary">
            Back to Orders List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Order Details</h1>
          <p className="page-subtitle">Order #{order._id?.slice(-8) || 'Unknown'}</p>
        </div>
        <div className="page-actions">
          <Link to="/orders/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Orders
          </Link>
          <Link to={`/orders/edit/${id}`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit Order
          </Link>
          <button className="btn btn-outline" onClick={handlePrint} >
            <MdPrint size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="order-details-container" id='printableArea' >
        {/* Order Summary Card */}
        <div className="content-card order-summary" >
          <div className="order-summary-header">
            <div className="order-info">
              <h3>Order #{order._id?.slice(-8)}</h3>
              <p className="order-date">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div className="order-status">
              <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="order-progress">
            {getProgressSteps().map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={step.id} className={`progress-step ${step.stepClass}`}>
                  <div className="step-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.date}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="order-content-grid">
          {/* Customer Information */}
          <div className="content-card">
            <h3>Customer Information</h3>
            <div className="customer-info">
              <div className="info-group">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {order.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> {order.shippingAddress?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}</p>
                <p><strong>Company:</strong> {order.shippingAddress?.company || 'N/A'}</p>
              </div>
              <div className="info-group">
                <h4>Shipping Address</h4>
                <p>{order.shippingAddress?.address || 'N/A'}</p>
                <p>{order.shippingAddress?.city || ''}</p>
              </div>
              <div className="info-group">
                <h4>Order Notes</h4>
                <p>{order.notes || 'No notes provided'}</p>
              </div>
            </div>
          </div>

          {/* Payment & Order Info */}
          <div className="content-card">
            <h3>Payment & Order Information</h3>
            <div className="payment-shipping-info">
              <div className="info-group">
                <h4>Payment Information</h4>
                <p><strong>Method:</strong> {order.paymentMethod || 'N/A'}</p>
                <p><strong>Status:</strong>
                  <span className={`status-badge ${getStatusColor(order.paymentStatus || 'Pending')}`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </p>
                <p><strong>Priority:</strong> {order.priority || 'Normal'}</p>
              </div>
              <div className="info-group">
                <h4>Order Information</h4>
                <p><strong>Shipping Cost:</strong> ₹{(parseFloat(order.shippingCost) || 0).toFixed(2)}</p>
                <p><strong>Tax Rate:</strong> {(parseFloat(order.taxRate) || 0)}%</p>
                <p><strong>Discount:</strong> ₹{(parseFloat(order.discountAmount) || 0).toFixed(2)}</p>
                {order.deliveryDate && (
                  <p><strong>Expected Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="content-card">
          <h3>Order Items ({order.products?.length || 0} items)</h3>
          <div className="order-items">
            <div className="items-table">
              <div className="table-header">
                <div className="col-product">Product</div>
                <div className="col-price">Price</div>
                <div className="col-quantity">Quantity</div>
                <div className="col-total">Total</div>
              </div>
              {(order.products || []).map((product, index) => (
                <div key={product._id || index} className="table-row">
                  <div className="col-product">
                    <div className="product-info">
                      <span className="product-name">{product.name || 'Unknown Product'}</span>
                    </div>
                  </div>
                  <div className="col-price">₹{(product.price || 0).toLocaleString()}</div>
                  <div className="col-quantity">{product.quantity || 0}</div>
                  <div className="col-total">₹{((product.quantity || 0) * (product.price || 0)).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="totals-section">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>₹{(subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Shipping:</span>
                  <span>₹{(parseFloat(order.shippingCost) || 0).toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Tax ({(parseFloat(order.taxRate) || 0)}%):</span>
                  <span>₹{(tax || 0).toFixed(2)}</span>
                </div>
                {(parseFloat(order.discountAmount) || 0) > 0 && (
                  <div className="totals-row">
                    <span>Discount:</span>
                    <span>-₹{(parseFloat(order.discountAmount) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="totals-row total">
                  <span>Total Amount:</span>
                  <span>₹{(order.totalAmount || total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails

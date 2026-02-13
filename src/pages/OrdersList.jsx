import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderService } from '../api/orderService.js';
import { invoiceService } from "../api/invoiceService.js";
import {
  MdRefresh,
  MdLocalShipping,
  MdCancel,
  MdLocalShipping as MdShipped,
  MdDeliveryDining,
  MdPending,
  MdCheckCircle,
  MdHourglassEmpty,
  MdVisibility,
  MdEdit,
  MdAdd,
  MdReceipt,
} from "react-icons/md";

function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('');
  const [monthvalue, setMonthvalue] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await orderService.getOrders()
        setOrders(ordersData || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders. Please try again.')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const thismonthordersdata = async () => {
    try {
      setLoading(true)
      const ordersData = await orderService.getOrdersThisMonth()
      setOrders(ordersData?.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load this-month orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  const lastmonthordersdata = async () => {
    try {
      setLoading(true)
      const ordersData = await orderService.getOrdersLastMonth()
      setOrders(ordersData?.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load last-month orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  const thisyearordersdata = async () => {
    try {
      setLoading(true)
      const ordersData = await orderService.getOrdersThisYear()
      setOrders(ordersData?.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load this-month orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  const handlemonthvalue = async (e) => {
    const value = e.target.value;
    setMonthvalue(value);

    if (value === "this-month") {
      await thismonthordersdata();
    } else if (value === "last-month") {
      await lastmonthordersdata();
    } else if (value === "this-year") {
      await thisyearordersdata();
    }
  };

  const calculateOrderStats = () => {
    if (!orders.length) {
      return [
        { title: "Payment Refund", count: "0", icon: <MdRefresh size={24} />, color: "orange" },
        { title: "Order Cancel", count: "0", icon: <MdCancel size={24} />, color: "orange" },
        { title: "Order Shipped", count: "0", icon: <MdShipped size={24} />, color: "orange" },
        { title: "Order Delivering", count: "0", icon: <MdDeliveryDining size={24} />, color: "orange" },
        { title: "Pending Review", count: "0", icon: <MdPending size={24} />, color: "orange" },
        { title: "Pending Payment", count: "0", icon: <MdHourglassEmpty size={24} />, color: "orange" },
        { title: "Delivered", count: "0", icon: <MdCheckCircle size={24} />, color: "orange" },
        { title: "In Progress", count: "0", icon: <MdHourglassEmpty size={24} />, color: "orange" },
      ]
    }
    const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length
    const shipped = orders.filter(o => o.orderStatus === 'Shipped').length
    const delivering = orders.filter(o => o.orderStatus === 'Delivering').length
    const delivered = orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Completed').length
    const pending = orders.filter(o => o.orderStatus === 'Pending').length
    const pendingPayment = orders.filter(o => o.paymentStatus === 'Pending').length
    const inProgress = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Packaging').length
    const refunds = orders.filter(o => o.paymentStatus === 'Refunded').length

    return [
      { title: "Payment Refund", count: refunds.toString(), icon: <MdRefresh size={24} />, color: "orange" },
      { title: "Order Cancel", count: cancelled.toString(), icon: <MdCancel size={24} />, color: "orange" },
      { title: "Order Shipped", count: shipped.toString(), icon: <MdShipped size={24} />, color: "orange" },
      { title: "Order Delivering", count: delivering.toString(), icon: <MdDeliveryDining size={24} />, color: "orange" },
      { title: "Pending Review", count: pending.toString(), icon: <MdPending size={24} />, color: "orange" },
      { title: "Pending Payment", count: pendingPayment.toString(), icon: <MdHourglassEmpty size={24} />, color: "orange" },
      { title: "Delivered", count: delivered.toString(), icon: <MdCheckCircle size={24} />, color: "orange" },
      { title: "In Progress", count: inProgress.toString(), icon: <MdHourglassEmpty size={24} />, color: "orange" },
    ]
  }
  
  const orderStats = calculateOrderStats()

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "status-paid";
      case "unpaid":
        return "status-unpaid";
      case "completed":
        return "status-completed";
      case "shipped":
        return "status-shipped";
      case "packaging":
        return "status-packaging";
      case "draft":
        return "status-draft";
      case "pending":
        return "status-pending";
      default:
        return "status-default";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "priority-high";
      case "normal":
        return "priority-normal";
      case "low":
        return "priority-low";
      default:
        return "priority-normal";
    }
  };

  const handlegenerateinvoicepdf = async (id) => {
    try {
      const response = await invoiceService.generateInvoicepdf(id);

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);

    } catch (error) {
      console.error("Invoice generate error:", error);
      alert("Invoice generate nahi ho paya ");
    }
  };

  const orderStatsbasedinvoice = () => {
    alert("Sorry Your Order is Not Delivered");
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">ORDERS LIST</h1>
        </div>
        <div className="page-actions">
          <select className="time-filter" onChange={handlemonthvalue}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
          <Link to="/orders/add" className="btn btn-primary">
            <MdAdd size={16} />
            Create Order
          </Link>
        </div>
      </div>

      {/* Order Statistics Grid */}
      <div className="orders-stats-grid">
        {orderStats.map((stat, index) => (
          <div key={index} className="order-stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-number">{stat.count}</div>
              </div>
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="content-card">
        <div className="table-header">
          <h3>All Order List ({orders.length} orders)</h3>
          <select className="table-filter" onChange={handlemonthvalue}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            marginBottom: '20px',
            padding: '12px 16px'
          }}>
            <p style={{ color: '#92400e', margin: 0, fontSize: '14px' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          monthvalue === "last-month" ? (<div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '20px' }}>No orders found.</p>
            <Link className="btn btn-primary">
              No Any Order's in last Month
            </Link>
          </div>) : null
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Created at</th>
                  <th>Customer</th>
                  <th>Mode</th>
                  <th>Priority</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Items</th>
                  <th>Delivery Number</th>
                  <th>Order Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order, index) => (
                  <tr key={order._id || index}>
                    <td>
                      <Link
                        to={`/orders/details/${order._id}`}
                        className="order-link"
                      >
                        #{order._id?.slice(-8) || `ORDER-${index + 1}`}
                      </Link>
                    </td>
                    <td>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                    <td>{order.customerName || order.customer || 'N/A'}</td>
                    <td>{order.mode || 'Online'}</td>
                    <td>
                      <span
                        className={`priority-badge ${getPriorityClass(
                          order.priority || 'Normal'
                        )}`}
                      >
                        {order.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="price-cell">₹{order.totalAmount?.toLocaleString() || '0'}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          order.paymentStatus || 'Pending'
                        )}`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td>{order.products?.length || order.items || 0}</td>
                    <td>{order.deliveryNumber || order.trackingnumber || '-'}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          order.orderStatus || 'Processing'
                        )}`}
                      >
                        {order.orderStatus || 'Processing'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/orders/details/${order._id}`}
                          className="action-btn view"
                          title="View Order"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          to={`/orders/edit/${order._id}`}
                          className="action-btn edit"
                          title="Edit Order"
                        >
                          <MdEdit size={16} />
                        </Link>
                        <button
                          className="action-btn delete"
                          title="Generate Invoice"
                          onClick={() => order.orderStatus == "Delivered" ? handlegenerateinvoicepdf(order._id) : orderStatsbasedinvoice()}
                        >
                          <MdReceipt size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersList;

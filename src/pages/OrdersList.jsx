import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { orderService } from "../api/orderService.js";
import { invoiceService } from "../api/invoiceService.js";
import {
  MdRefresh,
  MdCancel,
  MdDeliveryDining,
  MdPending,
  MdCheckCircle,
  MdHourglassEmpty,
  MdVisibility,
  MdEdit,
  MdReceipt,
  MdLocalShipping,
  MdShoppingBag,
} from "react-icons/md";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const orderStatusStyle = {
  Pending: { bg: "#fef9c3", color: "#a16207" },
  Processing: { bg: "#dbeafe", color: "#1d4ed8" },
  Packaging: { bg: "#e0e7ff", color: "#4338ca" },
  Shipped: { bg: "#cffafe", color: "#0e7490" },
  Delivering: { bg: "#ede9fe", color: "#6d28d9" },
  Delivered: { bg: "#dcfce7", color: "#15803d" },
  Completed: { bg: "#dcfce7", color: "#15803d" },
  Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
  Returned: { bg: "#fce7f3", color: "#9d174d" },
};

const paymentStatusStyle = {
  Pending: { bg: "#fef9c3", color: "#a16207" },
  Paid: { bg: "#dcfce7", color: "#15803d" },
  Failed: { bg: "#fee2e2", color: "#b91c1c" },
  COD: { bg: "#e0f2fe", color: "#0369a1" },
  Refunded: { bg: "#ede9fe", color: "#6d28d9" },
};

const priorityStyle = {
  High: { bg: "#fee2e2", color: "#b91c1c" },
  Normal: { bg: "#f1f5f9", color: "#475569" },
  Low: { bg: "#dcfce7", color: "#15803d" },
};

const Badge = ({ label, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const StatCard = ({ title, count, icon, color, bg }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
        {count}
      </p>
      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{title}</p>
    </div>
  </div>
);

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async (p = "all") => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (p === "this-month") data = await orderService.getOrdersThisMonth();
      else if (p === "last-month")
        data = await orderService.getOrdersLastMonth();
      else if (p === "this-year") data = await orderService.getOrdersThisYear();
      else data = await orderService.getOrders();

      // ✅ Handle both { orders: [] } and { data: [] } response shapes
      const list = data?.orders || data?.data || data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders("all");
  }, [fetchOrders]);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    setPeriod(val);
    fetchOrders(val);
  };

  const handleInvoice = async (order) => {
    const status = order.fulfillment?.orderStatus || order.orderStatus;
    if (status !== "Delivered" && status !== "Completed") {
      alert("Invoice sirf Delivered orders ke liye generate hoti hai.");
      return;
    }
    try {
      const response = await invoiceService.generateInvoicepdf(order._id);
      const file = new Blob([response.data], { type: "application/pdf" });
      window.open(URL.createObjectURL(file));
    } catch (err) {
      alert("Invoice generate nahi ho paya.");
    }
  };

  // ✅ Normalize order fields from backend structure
  const normalize = (o) => ({
    ...o,
    orderStatus: o.fulfillment?.orderStatus || o.orderStatus || "Pending",
    paymentStatus: o.payment?.status || o.paymentStatus || "Pending",
    paymentMethod: o.payment?.method || o.paymentMethod || "—",
    customerName: o.customer?.name || o.customerName || "N/A",
    customerEmail: o.customer?.email || o.customerEmail || "",
  });

  const normalized = orders.map(normalize);

  // Search + status filter
  const filtered = normalized.filter((o) => {
    const matchSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = [
    {
      title: "Total Orders",
      count: normalized.length,
      icon: <MdShoppingBag size={20} />,
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      title: "Delivered",
      count: normalized.filter((o) =>
        ["Delivered", "Completed"].includes(o.orderStatus),
      ).length,
      icon: <MdCheckCircle size={20} />,
      color: "#10b981",
      bg: "#d1fae5",
    },
    {
      title: "Shipped",
      count: normalized.filter((o) => o.orderStatus === "Shipped").length,
      icon: <MdLocalShipping size={20} />,
      color: "#0e7490",
      bg: "#cffafe",
    },
    {
      title: "Pending",
      count: normalized.filter((o) => o.orderStatus === "Pending").length,
      icon: <MdPending size={20} />,
      color: "#a16207",
      bg: "#fef9c3",
    },
    {
      title: "Processing",
      count: normalized.filter((o) => o.orderStatus === "Processing").length,
      icon: <MdHourglassEmpty size={20} />,
      color: "#1d4ed8",
      bg: "#dbeafe",
    },
    {
      title: "Cancelled",
      count: normalized.filter((o) => o.orderStatus === "Cancelled").length,
      icon: <MdCancel size={20} />,
      color: "#b91c1c",
      bg: "#fee2e2",
    },
    {
      title: "Delivering",
      count: normalized.filter((o) => o.orderStatus === "Delivering").length,
      icon: <MdDeliveryDining size={20} />,
      color: "#6d28d9",
      bg: "#ede9fe",
    },
    {
      title: "Payment Refunded",
      count: normalized.filter((o) => o.paymentStatus === "Refunded").length,
      icon: <MdRefresh size={20} />,
      color: "#f59e0b",
      bg: "#fef9c3",
    },
  ];

  const allStatuses = [
    "all",
    "Pending",
    "Processing",
    "Packaging",
    "Shipped",
    "Delivering",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h3 className="page-title">Orders</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            Manage and track all customer orders
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={period}
            onChange={handlePeriodChange}
            style={{
              padding: "9px 14px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 9,
              fontSize: 13,
              color: "#475569",
              background: "#fff",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
          <button
            onClick={() => fetchOrders(period)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <MdRefresh size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Table Card */}
      <div className="content-card">
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              All Orders
              <span
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  background: "#f8fafc",
                  padding: "3px 10px",
                  borderRadius: 20,
                  marginLeft: 10,
                  fontWeight: 500,
                }}
              >
                {filtered.length} of {normalized.length}
              </span>
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search by name, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 34px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 9,
                    fontSize: 13,
                    outline: "none",
                    width: 200,
                    color: "#1e293b",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: 16,
                  }}
                >
                  🔍
                </span>
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 9,
                  fontSize: 13,
                  color: "#475569",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Status" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                margin: "12px 20px",
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "#",
                    "Order ID",
                    "Customer",
                    "Date",
                    "Items",
                    "Total",
                    "Payment",
                    "Method",
                    "Priority",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(11)].map((_, j) => (
                        <td key={j} style={{ padding: "12px 14px" }}>
                          <div
                            style={{
                              height: 14,
                              borderRadius: 6,
                              background:
                                "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                              backgroundSize: "200% 100%",
                              animation: "ol-shimmer 1.4s infinite",
                              width: j === 2 ? 120 : 60,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        textAlign: "center",
                        padding: "50px 0",
                        color: "#94a3b8",
                      }}
                    >
                      <MdShoppingBag
                        size={36}
                        style={{
                          display: "block",
                          margin: "0 auto 10px",
                          opacity: 0.3,
                        }}
                      />
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, idx) => {
                    const oSt = orderStatusStyle[order.orderStatus] || {
                      bg: "#f1f5f9",
                      color: "#475569",
                    };
                    const pSt =
                      paymentStatusStyle[order.paymentStatus] ||
                      paymentStatusStyle.Pending;
                    const prSt =
                      priorityStyle[order.priority] || priorityStyle.Normal;

                    return (
                      <tr
                        key={order._id || idx}
                        style={{
                          borderBottom: "1px solid #f8fafc",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fafafa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* # */}
                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#cbd5e1",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </td>

                        {/* Order ID */}
                        <td style={{ padding: "12px 14px" }}>
                          <Link
                            to={`/admin/orders/details/${order._id}`}
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              background: "#eef2ff",
                              color: "#6366f1",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontWeight: 700,
                              textDecoration: "none",
                              letterSpacing: "0.03em",
                            }}
                          >
                            #{order._id?.slice(-8).toUpperCase()}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td style={{ padding: "12px 14px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              color: "#0f172a",
                              fontSize: 13,
                            }}
                          >
                            {order.customerName}
                          </p>
                          {order.customerEmail && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: "#94a3b8",
                              }}
                            >
                              {order.customerEmail}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#64748b",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(order.createdAt || order.orderDate)}
                        </td>

                        {/* Items */}
                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#475569",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        >
                          {order.items?.length || 0}
                        </td>

                        {/* Total */}
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: 13,
                          }}
                        >
                          ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Payment Status */}
                        <td style={{ padding: "12px 14px" }}>
                          <Badge
                            label={order.paymentStatus}
                            bg={pSt.bg}
                            color={pSt.color}
                          />
                        </td>

                        {/* Payment Method */}
                        <td
                          style={{
                            padding: "12px 14px",
                            color: "#64748b",
                            fontSize: 12,
                          }}
                        >
                          {order.paymentMethod}
                        </td>

                        {/* Priority */}
                        <td style={{ padding: "12px 14px" }}>
                          <Badge
                            label={order.priority || "Normal"}
                            bg={prSt.bg}
                            color={prSt.color}
                          />
                        </td>

                        {/* Order Status */}
                        <td style={{ padding: "12px 14px" }}>
                          <Badge
                            label={order.orderStatus}
                            bg={oSt.bg}
                            color={oSt.color}
                          />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link
                              to={`/admin/orders/details/${order._id}`}
                              title="View"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: "#eef2ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6366f1",
                                textDecoration: "none",
                                flexShrink: 0,
                              }}
                            >
                              <MdVisibility size={15} />
                            </Link>
                            <Link
                              to={`/admin/orders/edit/${order._id}`}
                              title="Edit"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: "#f0fdf4",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#10b981",
                                textDecoration: "none",
                                flexShrink: 0,
                              }}
                            >
                              <MdEdit size={15} />
                            </Link>
                            <button
                              onClick={() => handleInvoice(order)}
                              title="Invoice"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: "#fef9c3",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#a16207",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              <MdReceipt size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ol-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

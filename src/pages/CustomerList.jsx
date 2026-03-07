import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdEdit,
  MdDelete,
  MdAdd,
  MdRefresh,
  MdSearch,
  MdPeople,
  MdPersonOff,
  MdPersonAdd,
} from "react-icons/md";
import { customerService } from "../api/customerService";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Toggle = ({ checked, onChange, loading }) => (
  <label
    style={{
      position: "relative",
      display: "inline-block",
      width: 40,
      height: 22,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.6 : 1,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={loading}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <span
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: checked ? "#10b981" : "#e2e8f0",
        borderRadius: 34,
        transition: "0.3s",
      }}
    />
    <span
      style={{
        position: "absolute",
        height: 16,
        width: 16,
        left: 3,
        top: 3,
        background: "white",
        borderRadius: "50%",
        transition: "0.3s",
        transform: checked ? "translateX(18px)" : "translateX(0)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    />
  </label>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "cl-popup 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px 0" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <MdDelete size={24} color="#ef4444" />
          </div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 17,
              color: "#0f172a",
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "20px 24px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 18px",
              background: "#ef4444",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#fff",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const PointsModal = ({ customer, onClose, onSuccess }) => {
  const [mode, setMode] = useState("add");
  const [points, setPoints] = useState("");
  const [remark, setRemark] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const num = Number(points);
    if (!num || num <= 0) return setError("Points must be greater than 0");
    setLoading(true);
    try {
      if (mode === "add") {
        await customerService.addRewardPoints(customer._id, {
          points: num,
          remark,
          expiryDate: expiryDate || null,
        });
      } else {
        await customerService.deductRewardPoints(customer._id, {
          points: num,
          remark,
        });
      }
      onSuccess(
        `${num} points ${mode === "add" ? "added to" : "deducted from"} ${customer.name}`,
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "cl-popup 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Reward Points
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
              {customer?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#f8fafc",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {["add", "deduct"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  background:
                    mode === m
                      ? m === "add"
                        ? "#10b981"
                        : "#ef4444"
                      : "transparent",
                  color: mode === m ? "#fff" : "#94a3b8",
                  transition: "0.2s",
                }}
              >
                {m === "add" ? "＋ Add Points" : "－ Deduct Points"}
              </button>
            ))}
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: 5,
              }}
            >
              Points *
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g. 100"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 9,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {mode === "add" && (
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#475569",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Expiry Date (optional)
              </label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 9,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: 5,
              }}
            >
              Remarks (optional)
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 9,
                fontSize: 14,
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
        <div
          style={{
            padding: "0 24px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "9px 20px",
              background: mode === "add" ? "#10b981" : "#ef4444",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Saving..."
              : mode === "add"
                ? "Add Points"
                : "Deduct Points"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const [pointsCustomer, setPointsCustomer] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const menuRef = useRef(null);
  const [toggleLoading, setToggleLoading] = useState({});
  const MENU_WIDTH = 160,
    MENU_HEIGHT = 170;

  const fetchCustomers = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await customerService.getAllCustomers(p, LIMIT);
      setCustomers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuPos(null);
    };
    const closeAll = () => setMenuPos(null);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeAll);
    window.addEventListener("resize", closeAll);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeAll);
      window.removeEventListener("resize", closeAll);
    };
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMenuOpen = (e, cust) => {
    e.stopPropagation();
    setActiveCustomer(cust);
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.right + window.scrollX - MENU_WIDTH + 10;
    let top = rect.bottom + window.scrollY + 6;
    if (left + MENU_WIDTH > window.innerWidth)
      left = window.innerWidth - MENU_WIDTH - 10;
    if (left < 10) left = 10;
    if (rect.bottom + MENU_HEIGHT > window.innerHeight)
      top = rect.top + window.scrollY - MENU_HEIGHT - 6;
    setMenuPos({ top, left });
  };

  const handleToggle = async (cust) => {
    setToggleLoading((p) => ({ ...p, [cust._id]: true }));
    try {
      await customerService.toggleCustomerStatus(cust._id);
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === cust._id
            ? { ...c, status: c.status === "active" ? "blocked" : "active" }
            : c,
        ),
      );
      showToast(
        `${cust.name} is now ${cust.status === "active" ? "blocked" : "active"}`,
      );
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setToggleLoading((p) => ({ ...p, [cust._id]: false }));
    }
  };

  const handleDelete = async () => {
    const cust = confirmState?.customer;
    if (!cust) return;
    try {
      await customerService.deleteCustomer(cust._id);
      setCustomers((prev) => prev.filter((c) => c._id !== cust._id));
      setTotal((t) => t - 1);
      showToast(`${cust.name} deleted successfully`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirmState(null);
    }
  };

  const activeCount = customers.filter((c) => c.status === "active").length;
  const blockedCount = customers.filter((c) => c.status === "blocked").length;

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h3 className="page-title">Customers</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            Manage and monitor all registered customers
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(page)}
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

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total Customers",
            value: total,
            icon: <MdPeople size={20} />,
            color: "#6366f1",
            bg: "#eef2ff",
          },
          {
            label: "Active",
            value: activeCount,
            icon: <MdPersonAdd size={20} />,
            color: "#10b981",
            bg: "#d1fae5",
          },
          {
            label: "Blocked",
            value: blockedCount,
            icon: <MdPersonOff size={20} />,
            color: "#ef4444",
            bg: "#fee2e2",
          },
        ].map(({ label, value, icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
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
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {loading ? "—" : value}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="content-card" style={{ marginBottom: 16 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "18px 20px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Filter Customers
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "Customer ID", type: "text", ph: "Enter Customer ID" },
              { label: "Name", type: "text", ph: "Enter Name" },
              { label: "Email", type: "email", ph: "Enter Email" },
              { label: "Phone", type: "number", ph: "Enter Mobile" },
              { label: "Sign Up From", type: "date" },
              { label: "Sign Up To", type: "date" },
            ].map(({ label, type, ph }) => (
              <div key={label}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={ph}
                  style={{
                    width: "100%",
                    padding: "8px 11px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#1e293b",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 14,
            }}
          >
            <button
              style={{
                padding: "8px 16px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                color: "#475569",
              }}
            >
              Reset
            </button>
            <button
              style={{
                padding: "8px 16px",
                background: "#6366f1",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MdSearch size={14} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
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
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              Customer Profiles
            </h3>
            {!loading && (
              <span
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  background: "#f8fafc",
                  padding: "4px 10px",
                  borderRadius: 20,
                }}
              >
                Page {page} of {totalPages} · {total} total
              </span>
            )}
          </div>

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
              {error}
            </div>
          )}

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
                    "Customer ID",
                    "Customer",
                    "Phone",
                    "Joined",
                    "Wallet",
                    "Points",
                    "Status",
                    "Action",
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
                      {[...Array(9)].map((_, j) => (
                        <td key={j} style={{ padding: "12px 14px" }}>
                          <div
                            style={{
                              height: 14,
                              borderRadius: 6,
                              background:
                                "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                              backgroundSize: "200% 100%",
                              animation: "cl-shimmer 1.4s infinite",
                              width: j === 2 ? 140 : 70,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "50px 0",
                        color: "#94a3b8",
                      }}
                    >
                      <MdPeople
                        size={36}
                        style={{
                          display: "block",
                          margin: "0 auto 10px",
                          opacity: 0.3,
                        }}
                      />
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((cust, idx) => (
                    <tr
                      key={cust._id}
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
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          onClick={() =>
                            navigate(`/admin/customers/detail/${cust._id}`)
                          }
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            background: "#eef2ff",
                            color: "#6366f1",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontWeight: 700,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
                          }}
                        >
                          #{cust._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {cust.profileImage ? (
                            <img
                              src={cust.profileImage}
                              alt=""
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                                border: "2px solid #f1f5f9",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: `hsl(${((cust.name?.charCodeAt(0) || 65) * 10) % 360},55%,55%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                                flexShrink: 0,
                              }}
                            >
                              {cust.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#0f172a",
                              }}
                            >
                              {cust.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: "#94a3b8",
                              }}
                            >
                              {cust.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#475569",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {cust.phone}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(cust.createdAt)}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: 13,
                        }}
                      >
                        ₹{cust.walletBalance ?? 0}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            background: "#fef9c3",
                            color: "#a16207",
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {cust.rewardPoints ?? 0} pts
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Toggle
                          checked={cust.status === "active"}
                          onChange={() => handleToggle(cust)}
                          loading={!!toggleLoading[cust._id]}
                        />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            cursor: "pointer",
                            fontSize: 18,
                            color: "#94a3b8",
                            padding: "4px 8px",
                            borderRadius: 6,
                            userSelect: "none",
                            display: "inline-block",
                          }}
                          onClick={(e) => handleMenuOpen(e, cust)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#475569")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#94a3b8")
                          }
                        >
                          •••
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                disabled={page === 1}
                onClick={() => fetchCustomers(page - 1)}
                style={{
                  padding: "7px 14px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#475569",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                ← Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchCustomers(i + 1)}
                  style={{
                    width: 34,
                    height: 34,
                    background: page === i + 1 ? "#6366f1" : "#f1f5f9",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    color: page === i + 1 ? "#fff" : "#64748b",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => fetchCustomers(page + 1)}
                style={{
                  padding: "7px 14px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#475569",
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {menuPos &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
              width: MENU_WIDTH,
              background: "#fff",
              border: "1px solid #f1f5f9",
              borderRadius: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              zIndex: 9999,
              padding: "6px",
              overflow: "hidden",
            }}
          >
            {[
              {
                icon: <MdVisibility size={15} />,
                label: "View Details",
                action: () => {
                  navigate(`/admin/customers/detail/${activeCustomer._id}`)
                  setMenuPos(null);
                },
              },
              {
                icon: <MdAdd size={15} />,
                label: "Reward Points",
                action: () => {
                  setPointsCustomer(activeCustomer);
                  setMenuPos(null);
                },
              },
              {
                icon: <MdEdit size={15} />,
                label: "Edit",
                action: () => {
                  setMenuPos(null);
                },
              },
              {
                icon: <MdDelete size={15} />,
                label: "Delete",
                color: "#ef4444",
                action: () => {
                  setConfirmState({ customer: activeCustomer });
                  setMenuPos(null);
                },
              },
            ].map(({ icon, label, color, action }) => (
              <div
                key={label}
                onClick={action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: color || "#374151",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = color
                    ? "#fef2f2"
                    : "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {icon} {label}
              </div>
            ))}
          </div>,
          document.body,
        )}

      {pointsCustomer && (
        <PointsModal
          customer={pointsCustomer}
          onClose={() => setPointsCustomer(null)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchCustomers(page);
          }}
        />
      )}
      <ConfirmModal
        isOpen={!!confirmState}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmState?.customer?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmState(null)}
      />

      {toast &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 99999,
              padding: "12px 20px",
              borderRadius: 10,
              background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
              color: toast.type === "error" ? "#b91c1c" : "#15803d",
              border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontSize: 13,
              fontWeight: 600,
              animation: "cl-slidein 0.3s ease",
            }}
          >
            {toast.msg}
          </div>,
          document.body,
        )}

      <style>{`
                @keyframes cl-popup { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes cl-slidein { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes cl-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
    </>
  );
}

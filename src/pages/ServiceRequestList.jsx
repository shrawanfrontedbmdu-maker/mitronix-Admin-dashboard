import { useState, useEffect } from "react";
import {
  MdEdit,
  MdAssignment,
  MdVisibility,
  MdPriorityHigh,
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdFilterList,
  MdRefresh,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdClose,
  MdSave,
} from "react-icons/md";
import serviceRequestService from "../api/serviceRequestService";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["open", "in progress", "completed", "cancelled"];
const TYPE_OPTIONS = [
  "demo",
  "repair",
  "relocation",
  "installation",
  "warranty",
];
const PRIORITY_OPTIONS = ["high", "medium", "low"];

const STATUS_STYLES = {
  open: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  "in progress": { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  completed: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  cancelled: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};
const PRIORITY_STYLES = {
  high: { bg: "#FEF2F2", color: "#B91C1C" },
  medium: { bg: "#FFFBEB", color: "#B45309" },
  low: { bg: "#F0FDF4", color: "#15803D" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ServiceRequestList() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    completed: 0,
    high: 0,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    type: "",
    priority: "",
  });

  // Modals
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null); // { id, data }
  const [assignModal, setAssignModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [assignTo, setAssignTo] = useState("");

  useEffect(() => {
    fetchServiceRequests();
  }, [filters]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      const response = await serviceRequestService.getAll(cleanParams);
      const data = response.data || [];
      setServiceRequests(data);
      setPagination({
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
      });
      setStats({
        open: data.filter((r) => r.status === "open").length,
        inProgress: data.filter((r) => r.status === "in progress").length,
        completed: data.filter((r) => r.status === "completed").length,
        high: data.filter((r) => r.priority === "high").length,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch service requests");
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));

  const clearFilters = () =>
    setFilters({ page: 1, limit: 10, status: "", type: "", priority: "" });

  // ── Inline status change ───────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      await serviceRequestService.updateStatus(id, newStatus);
      fetchServiceRequests();
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  // ── Open Edit Modal ────────────────────────────────────────────────────────
  const openEdit = async (id) => {
    try {
      const data = await serviceRequestService.getById(id);
      setEditData({
        status: data.status || "open",
        priority: data.priority || "medium",
        type: data.type || "",
        description: data.description || "",
        adminRemarks: data.adminRemarks || "",
        preferredDate: data.preferredDate
          ? data.preferredDate.split("T")[0]
          : "",
        phone: data.phone || "",
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
        },
        paymentdetails: {
          method: data.paymentdetails?.method || "cash",
          amount: data.paymentdetails?.amount || "",
          status: data.paymentdetails?.status || "pending",
          transactionId: data.paymentdetails?.transactionId || "",
        },
      });
      setEditModal({ id, productname: data.productname });
    } catch (err) {
      setError("Failed to load request details");
    }
  };

  // ── Save Edit ──────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      await serviceRequestService.update(editModal.id, editData);
      setEditModal(null);
      fetchServiceRequests();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Assign ─────────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignTo.trim()) return;
    try {
      await serviceRequestService.assign(assignModal._id, assignTo.trim());
      setAssignModal(null);
      setAssignTo("");
      fetchServiceRequests();
    } catch (err) {
      setError(err.message || "Failed to assign");
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
  const activeFilterCount = [
    filters.status,
    filters.type,
    filters.priority,
  ].filter(Boolean).length;

  const setAddr = (key, val) =>
    setEditData((p) => ({ ...p, address: { ...p.address, [key]: val } }));
  const setPay = (key, val) =>
    setEditData((p) => ({
      ...p,
      paymentdetails: { ...p.paymentdetails, [key]: val },
    }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Service Requests</h1>
          <p style={s.subtitle}>{pagination.total} requests from users</p>
        </div>
        <div style={s.headerActions}>
          <button
            onClick={fetchServiceRequests}
            style={s.iconBtn}
            title="Refresh"
          >
            <MdRefresh size={18} />
          </button>
          <button
            onClick={() => setShowFilters((p) => !p)}
            style={{
              ...s.filterBtn,
              ...(activeFilterCount > 0 ? s.filterBtnActive : {}),
            }}
          >
            <MdFilterList size={18} /> Filters
            {activeFilterCount > 0 && (
              <span style={s.filterBadge}>{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={s.statsRow}>
        {[
          {
            label: "Open",
            value: stats.open,
            icon: <MdAccessTime size={20} />,
            color: "#3B82F6",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: <MdAssignment size={20} />,
            color: "#F97316",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <MdCheckCircle size={20} />,
            color: "#22C55E",
          },
          {
            label: "High Priority",
            value: stats.high,
            icon: <MdPriorityHigh size={20} />,
            color: "#EF4444",
          },
        ].map((st) => (
          <div key={st.label} style={s.statCard}>
            <div
              style={{
                ...s.statIcon,
                color: st.color,
                background: st.color + "15",
              }}
            >
              {st.icon}
            </div>
            <div>
              <div style={s.statValue}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div style={s.filtersPanel}>
          <div style={s.filtersRow}>
            {[
              { label: "Status", key: "status", options: STATUS_OPTIONS },
              { label: "Type", key: "type", options: TYPE_OPTIONS },
              { label: "Priority", key: "priority", options: PRIORITY_OPTIONS },
            ].map((f) => (
              <div key={f.key} style={s.filterField}>
                <label style={s.filterLabel}>{f.label}</label>
                <select
                  style={s.select}
                  value={filters[f.key]}
                  onChange={(e) => handleFilterChange(f.key, e.target.value)}
                >
                  <option value="">All {f.label}s</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {cap(o)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div style={s.filterField}>
              <label style={s.filterLabel}>Per Page</label>
              <select
                style={s.select}
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", Number(e.target.value))
                }
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} rows
                  </option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={s.clearBtn}>
                <MdCancel size={14} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={s.errorBox}>
          {error}
          <button onClick={() => setError("")} style={s.errorClose}>
            ✕
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div style={s.tableCard}>
        {loading ? (
          <div style={s.emptyState}>
            <p>Loading service requests…</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <div style={s.emptyState}>
            <MdAssignment
              size={40}
              style={{ color: "#CBD5E1", marginBottom: 8 }}
            />
            <p style={{ color: "#64748B", margin: 0 }}>
              No service requests found.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                style={{ ...s.clearBtn, marginTop: 12 }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {[
                    "Ticket",
                    "Product",
                    "User",
                    "Type",
                    "Priority",
                    "Status",
                    "Order",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {serviceRequests.map((req, i) => (
                  <tr
                    key={req._id}
                    style={{
                      ...s.tr,
                      background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    }}
                  >
                    {/* Ticket */}
                    <td style={s.td}>
                      <span style={s.ticketId}>
                        #{String(req._id).slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Product */}
                    <td style={s.td}>
                      <div style={s.productName}>{req.productname || "—"}</div>
                      <div style={s.subText}>{cap(req.type)}</div>
                    </td>

                    {/* User — fullName, email, mobile */}
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.userAvatar}>
                          {(req.user?.fullName || req.user?.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div style={s.userName}>
                            {req.user?.fullName || req.user?.name || "—"}
                          </div>
                          <div style={s.userMeta}>
                            <MdEmail size={10} style={{ marginRight: 3 }} />
                            {req.user?.email || "—"}
                          </div>
                          <div style={s.userMeta}>
                            <MdPhone size={10} style={{ marginRight: 3 }} />
                            {req.user?.mobile ||
                              req.user?.phone ||
                              req.phone ||
                              "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={s.td}>
                      <span style={s.typeBadge}>{req.type || "—"}</span>
                    </td>

                    {/* Priority */}
                    <td style={s.td}>
                      {req.priority ? (
                        <span
                          style={{
                            ...s.badge,
                            background: PRIORITY_STYLES[req.priority]?.bg,
                            color: PRIORITY_STYLES[req.priority]?.color,
                          }}
                        >
                          {req.priority}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status — inline quick-change dropdown */}
                    <td style={s.td}>
                      <div style={s.statusCell}>
                        <span
                          style={{
                            ...s.statusDot,
                            background:
                              STATUS_STYLES[req.status]?.dot || "#94A3B8",
                          }}
                        />
                        <select
                          value={req.status || ""}
                          onChange={(e) =>
                            handleStatusChange(req._id, e.target.value)
                          }
                          style={{
                            ...s.statusSelect,
                            background:
                              STATUS_STYLES[req.status]?.bg || "#F1F5F9",
                            color:
                              STATUS_STYLES[req.status]?.color || "#475569",
                          }}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {cap(st)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Order */}
                    <td style={s.td}>
                      <span style={s.orderId}>
                        {req.orderId?.orderNumber
                          ? `#${req.orderId.orderNumber}`
                          : req.orderId?._id
                            ? `#${String(req.orderId._id).slice(-4)}`
                            : "—"}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={s.td}>
                      <span style={s.dateText}>
                        {formatDate(req.createdAt)}
                      </span>
                    </td>

                    {/* Actions — View, Edit, Assign only (no Create, no Delete) */}
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button
                          onClick={() => setViewModal(req)}
                          style={{ ...s.actionBtn, ...s.viewBtn }}
                          title="View Details"
                        >
                          <MdVisibility size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(req._id)}
                          style={{ ...s.actionBtn, ...s.editBtn }}
                          title="Edit"
                        >
                          <MdEdit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setAssignModal(req);
                            setAssignTo(req.assignedTo || "");
                          }}
                          style={{ ...s.actionBtn, ...s.assignBtn }}
                          title="Assign Technician"
                        >
                          <MdPerson size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={s.pagination}>
            <button
              style={{
                ...s.pageBtn,
                ...(pagination.page === 1 ? s.pageBtnDisabled : {}),
              }}
              disabled={pagination.page === 1}
              onClick={() => handleFilterChange("page", pagination.page - 1)}
            >
              ← Previous
            </button>
            <span style={s.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}{" "}
              <span style={{ color: "#94A3B8" }}>
                ({pagination.total} records)
              </span>
            </span>
            <button
              style={{
                ...s.pageBtn,
                ...(pagination.page === pagination.totalPages
                  ? s.pageBtnDisabled
                  : {}),
              }}
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handleFilterChange("page", pagination.page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ════════ VIEW MODAL ════════ */}
      {viewModal && (
        <div style={s.overlay} onClick={() => setViewModal(null)}>
          <div
            style={{ ...s.modal, maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <div>
                <h2 style={s.modalTitle}>Service Request Details</h2>
                <span style={s.ticketId}>
                  #{String(viewModal._id).slice(-6).toUpperCase()}
                </span>
              </div>
              <button onClick={() => setViewModal(null)} style={s.closeBtn}>
                <MdClose size={20} />
              </button>
            </div>

            <div
              style={{ ...s.modalBody, overflowY: "auto", maxHeight: "70vh" }}
            >
              {/* Status + Priority */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <span
                  style={{
                    ...s.badge,
                    background: STATUS_STYLES[viewModal.status]?.bg,
                    color: STATUS_STYLES[viewModal.status]?.color,
                    fontSize: 13,
                    padding: "5px 14px",
                  }}
                >
                  ● {cap(viewModal.status)}
                </span>
                <span
                  style={{
                    ...s.badge,
                    background: PRIORITY_STYLES[viewModal.priority]?.bg,
                    color: PRIORITY_STYLES[viewModal.priority]?.color,
                    fontSize: 13,
                    padding: "5px 14px",
                  }}
                >
                  {cap(viewModal.priority)} Priority
                </span>
              </div>

              {/* Grid details */}
              <div style={s.detailGrid}>
                <DetailRow label="Product" value={viewModal.productname} />
                <DetailRow label="Type" value={cap(viewModal.type)} />
                <DetailRow
                  label="Preferred Date"
                  value={formatDate(viewModal.preferredDate)}
                />
                <DetailRow
                  label="Created"
                  value={formatDate(viewModal.createdAt)}
                />
                <DetailRow
                  label="Order"
                  value={viewModal.orderId?.orderNumber || "—"}
                />
                <DetailRow
                  label="Assigned To"
                  value={viewModal.assignedTo || "Not assigned"}
                />
                <DetailRow label="Phone" value={viewModal.phone || "—"} />
                <DetailRow
                  label="Resolved At"
                  value={formatDate(viewModal.resolvedAt)}
                />
              </div>

              <div style={s.divider} />

              {/* Description */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Description</div>
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                  {viewModal.description || "—"}
                </p>
              </div>

              <div style={s.divider} />

              {/* User Details */}
              <div style={s.section}>
                <div style={s.sectionTitle}>
                  <MdPerson size={15} style={{ marginRight: 6 }} />
                  User Details
                </div>
                <div style={s.userDetailCard}>
                  <div style={s.userAvatarLg}>
                    {(viewModal.user?.fullName || viewModal.user?.name || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#0F172A",
                        marginBottom: 6,
                      }}
                    >
                      {viewModal.user?.fullName || viewModal.user?.name || "—"}
                    </div>
                    <div style={s.userDetailRow}>
                      <MdEmail size={14} />
                      {viewModal.user?.email || "—"}
                    </div>
                    <div style={s.userDetailRow}>
                      <MdPhone size={14} />
                      {viewModal.user?.mobile || viewModal.user?.phone || "—"}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span
                        style={{
                          ...s.badge,
                          background: "#F1F5F9",
                          color: "#475569",
                          fontSize: 11,
                        }}
                      >
                        {viewModal.user?.role || "user"}
                      </span>
                      {viewModal.user?.isVerified && (
                        <span
                          style={{
                            ...s.badge,
                            background: "#F0FDF4",
                            color: "#15803D",
                            fontSize: 11,
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              {/* Address */}
              <div style={s.section}>
                <div style={s.sectionTitle}>
                  <MdLocationOn size={15} style={{ marginRight: 6 }} />
                  Address
                </div>
                {viewModal.address ? (
                  <p style={{ margin: 0, color: "#475569" }}>
                    {[
                      viewModal.address.street,
                      viewModal.address.city,
                      viewModal.address.state,
                      viewModal.address.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : (
                  <p style={{ margin: 0, color: "#94A3B8" }}>—</p>
                )}
              </div>

              <div style={s.divider} />

              {/* Payment */}
              <div style={s.section}>
                <div style={s.sectionTitle}>Payment Details</div>
                <div style={s.detailGrid}>
                  <DetailRow
                    label="Method"
                    value={cap(viewModal.paymentdetails?.method)}
                  />
                  <DetailRow
                    label="Amount"
                    value={
                      viewModal.paymentdetails?.amount
                        ? `₹${viewModal.paymentdetails.amount}`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Payment Status"
                    value={cap(viewModal.paymentdetails?.status)}
                  />
                  <DetailRow
                    label="Transaction ID"
                    value={viewModal.paymentdetails?.transactionId || "—"}
                  />
                </div>
              </div>

              {/* Admin Remarks */}
              {viewModal.adminRemarks && (
                <>
                  <div style={s.divider} />
                  <div style={s.section}>
                    <div style={s.sectionTitle}>Admin Remarks</div>
                    <p style={{ margin: 0, color: "#475569" }}>
                      {viewModal.adminRemarks}
                    </p>
                  </div>
                </>
              )}

              {/* Issue Images */}
              {viewModal.issueImages?.length > 0 && (
                <>
                  <div style={s.divider} />
                  <div style={s.section}>
                    <div style={s.sectionTitle}>Issue Images</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {viewModal.issueImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Issue ${i + 1}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #E2E8F0",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={s.modalFooter}>
              <button
                onClick={() => {
                  setViewModal(null);
                  openEdit(viewModal._id);
                }}
                style={s.primaryBtn}
              >
                <MdEdit size={16} /> Edit Request
              </button>
              <button onClick={() => setViewModal(null)} style={s.secondaryBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ EDIT MODAL — admin fields only ════════ */}
      {editModal && (
        <div style={s.overlay} onClick={() => setEditModal(null)}>
          <div
            style={{ ...s.modal, maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <div>
                <h2 style={s.modalTitle}>Edit Request</h2>
                <span style={{ fontSize: 13, color: "#64748B" }}>
                  {editModal.productname}
                </span>
              </div>
              <button onClick={() => setEditModal(null)} style={s.closeBtn}>
                <MdClose size={20} />
              </button>
            </div>

            <div
              style={{ ...s.modalBody, maxHeight: "65vh", overflowY: "auto" }}
            >
              {/* Status & Priority */}
              <div style={s.formRow}>
                <div style={s.formField}>
                  <label style={s.formLabel}>Status</label>
                  <select
                    style={s.input}
                    value={editData.status}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {cap(st)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Priority</label>
                  <select
                    style={s.input}
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, priority: e.target.value }))
                    }
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {cap(p)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Type</label>
                  <select
                    style={s.input}
                    value={editData.type}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {cap(t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Remarks */}
              <div style={{ marginBottom: 14 }}>
                <label style={s.formLabel}>Admin Remarks</label>
                <textarea
                  style={{
                    ...s.input,
                    height: 70,
                    resize: "vertical",
                    marginTop: 5,
                  }}
                  value={editData.adminRemarks}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, adminRemarks: e.target.value }))
                  }
                  placeholder="Internal notes for this request..."
                />
              </div>

              {/* Preferred Date & Phone */}
              <div style={s.formRow}>
                <div style={s.formField}>
                  <label style={s.formLabel}>Preferred Date</label>
                  <input
                    type="date"
                    style={s.input}
                    value={editData.preferredDate}
                    onChange={(e) =>
                      setEditData((p) => ({
                        ...p,
                        preferredDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Phone</label>
                  <input
                    style={s.input}
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 14 }}>
                <label style={s.formLabel}>Description</label>
                <textarea
                  style={{
                    ...s.input,
                    height: 70,
                    resize: "vertical",
                    marginTop: 5,
                  }}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              {/* Address */}
              <div style={{ ...s.sectionTitle, marginBottom: 10 }}>Address</div>
              <div style={s.formRow}>
                <div style={{ ...s.formField, flex: 2 }}>
                  <label style={s.formLabel}>Street</label>
                  <input
                    style={s.input}
                    value={editData.address?.street || ""}
                    onChange={(e) => setAddr("street", e.target.value)}
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>City</label>
                  <input
                    style={s.input}
                    value={editData.address?.city || ""}
                    onChange={(e) => setAddr("city", e.target.value)}
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formField}>
                  <label style={s.formLabel}>State</label>
                  <input
                    style={s.input}
                    value={editData.address?.state || ""}
                    onChange={(e) => setAddr("state", e.target.value)}
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Pincode</label>
                  <input
                    style={s.input}
                    value={editData.address?.pincode || ""}
                    onChange={(e) => setAddr("pincode", e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Payment */}
              <div style={{ ...s.sectionTitle, marginBottom: 10 }}>
                Payment Details
              </div>
              <div style={s.formRow}>
                <div style={s.formField}>
                  <label style={s.formLabel}>Method</label>
                  <select
                    style={s.input}
                    value={editData.paymentdetails?.method || "cash"}
                    onChange={(e) => setPay("method", e.target.value)}
                  >
                    {["cash", "online", "card", "upi"].map((m) => (
                      <option key={m} value={m}>
                        {cap(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Amount (₹)</label>
                  <input
                    type="number"
                    style={s.input}
                    value={editData.paymentdetails?.amount || ""}
                    onChange={(e) => setPay("amount", e.target.value)}
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.formLabel}>Payment Status</label>
                  <select
                    style={s.input}
                    value={editData.paymentdetails?.status || "pending"}
                    onChange={(e) => setPay("status", e.target.value)}
                  >
                    {["pending", "paid", "failed"].map((ps) => (
                      <option key={ps} value={ps}>
                        {cap(ps)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.formLabel}>Transaction ID</label>
                <input
                  style={{ ...s.input, marginTop: 5 }}
                  value={editData.paymentdetails?.transactionId || ""}
                  onChange={(e) => setPay("transactionId", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button
                onClick={handleEditSave}
                style={s.primaryBtn}
                disabled={editLoading}
              >
                <MdSave size={16} /> {editLoading ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditModal(null)} style={s.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ASSIGN MODAL ════════ */}
      {assignModal && (
        <div style={s.overlay} onClick={() => setAssignModal(null)}>
          <div
            style={{ ...s.modal, maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Assign Technician</h2>
              <button onClick={() => setAssignModal(null)} style={s.closeBtn}>
                <MdClose size={20} />
              </button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: "#64748B", marginTop: 0 }}>
                Product: <strong>{assignModal.productname}</strong>
              </p>
              <label style={s.formLabel}>Technician User ID</label>
              <input
                style={{ ...s.input, marginTop: 6 }}
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                placeholder="Enter technician's user ID"
                autoFocus
              />
              {assignModal.assignedTo && (
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
                  Currently: <strong>{assignModal.assignedTo}</strong>
                </p>
              )}
            </div>
            <div style={s.modalFooter}>
              <button onClick={handleAssign} style={s.primaryBtn}>
                <MdPerson size={16} /> Assign
              </button>
              <button
                onClick={() => setAssignModal(null)}
                style={s.secondaryBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 11,
          color: "#94A3B8",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#1E293B", fontWeight: 500 }}>
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "24px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#1E293B",
    maxWidth: 1400,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: 700, margin: 0, color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", margin: "4px 0 0" },
  headerActions: { display: "flex", gap: 10, alignItems: "center" },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    cursor: "pointer",
    color: "#475569",
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    cursor: "pointer",
    color: "#475569",
    fontSize: 14,
    fontWeight: 500,
  },
  filterBtnActive: {
    borderColor: "#3B82F6",
    color: "#3B82F6",
    background: "#EFF6FF",
  },
  filterBadge: {
    background: "#3B82F6",
    color: "#fff",
    borderRadius: 99,
    fontSize: 11,
    padding: "0 6px",
    marginLeft: 2,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: { fontSize: 24, fontWeight: 700, color: "#0F172A", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 3 },
  filtersPanel: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 20,
  },
  filtersRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  select: {
    padding: "8px 10px",
    borderRadius: 7,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    color: "#1E293B",
    background: "#fff",
    cursor: "pointer",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "8px 12px",
    borderRadius: 7,
    border: "1px solid #FCA5A5",
    background: "#FEF2F2",
    color: "#B91C1C",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 16,
    color: "#B91C1C",
    fontSize: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#B91C1C",
    cursor: "pointer",
    fontSize: 16,
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94A3B8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead: { background: "#F8FAFC" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: 600,
    color: "#64748B",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F1F5F9" },
  td: { padding: "11px 14px", verticalAlign: "middle" },
  ticketId: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 700,
    color: "#2563EB",
    background: "#EFF6FF",
    padding: "2px 7px",
    borderRadius: 5,
  },
  productName: { fontWeight: 600, color: "#1E293B", fontSize: 13 },
  subText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    textTransform: "capitalize",
  },
  userCell: { display: "flex", alignItems: "flex-start", gap: 8 },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 99,
    background: "#E0E7FF",
    color: "#3730A3",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: { fontWeight: 600, color: "#1E293B", fontSize: 13 },
  userMeta: {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  typeBadge: {
    background: "#F1F5F9",
    color: "#475569",
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 500,
    textTransform: "capitalize",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  statusCell: { display: "flex", alignItems: "center", gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 99, flexShrink: 0 },
  statusSelect: {
    border: "none",
    borderRadius: 6,
    padding: "3px 7px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    textTransform: "capitalize",
  },
  orderId: { fontSize: 12, color: "#64748B", fontFamily: "monospace" },
  dateText: { fontSize: 12, color: "#64748B", whiteSpace: "nowrap" },
  actions: { display: "flex", gap: 5 },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  viewBtn: { background: "#EFF6FF", color: "#2563EB" },
  editBtn: { background: "#F0FDF4", color: "#15803D" },
  assignBtn: { background: "#FFF7ED", color: "#C2410C" },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderTop: "1px solid #E2E8F0",
  },
  pageBtn: {
    padding: "7px 16px",
    borderRadius: 7,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#1E293B",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  pageBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pageInfo: { fontSize: 13, color: "#475569" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #E2E8F0",
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94A3B8",
    padding: 4,
    display: "flex",
  },
  modalBody: { padding: "20px 24px" },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #E2E8F0",
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px 20px",
  },
  divider: { height: 1, background: "#F1F5F9", margin: "16px 0" },
  section: { marginBottom: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
  },
  userDetailCard: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    background: "#F8FAFC",
    borderRadius: 10,
    padding: "14px 16px",
  },
  userAvatarLg: {
    width: 48,
    height: 48,
    borderRadius: 99,
    background: "#E0E7FF",
    color: "#3730A3",
    fontWeight: 700,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userDetailRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#475569",
    marginBottom: 5,
  },
  formRow: { display: "flex", gap: 12, marginBottom: 14 },
  formField: { flex: 1, display: "flex", flexDirection: "column", gap: 5 },
  formLabel: { fontSize: 12, fontWeight: 600, color: "#64748B" },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    color: "#1E293B",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 8,
    background: "#2563EB",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
  },
};

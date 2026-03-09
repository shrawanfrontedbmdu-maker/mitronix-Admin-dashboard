import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdEdit,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdPriorityHigh,
  MdPayment,
  MdAssignment,
  MdSave,
  MdClose,
  MdDelete,
  MdBuild,
  MdImage,
  MdNotes,
  MdInfo,
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

const STATUS_META = {
  open: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", label: "Open" },
  "in progress": {
    bg: "#FFF7ED",
    color: "#C2410C",
    dot: "#F97316",
    label: "In Progress",
  },
  completed: {
    bg: "#F0FDF4",
    color: "#15803D",
    dot: "#22C55E",
    label: "Completed",
  },
  cancelled: {
    bg: "#FEF2F2",
    color: "#B91C1C",
    dot: "#EF4444",
    label: "Cancelled",
  },
};
const PRIORITY_META = {
  high: { bg: "#FEF2F2", color: "#B91C1C", label: "High" },
  medium: { bg: "#FFFBEB", color: "#B45309", label: "Medium" },
  low: { bg: "#F0FDF4", color: "#15803D", label: "Low" },
};
const TYPE_ICONS = {
  demo: "🎯",
  repair: "🔧",
  relocation: "📦",
  installation: "⚙️",
  warranty: "🛡️",
};

export default function ServiceRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignTo, setAssignTo] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [remarkSaving, setRemarkSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await serviceRequestService.getById(id);
        setData(res);
        setAssignTo(res.assignedTo || "");
        setRemarkText(res.adminRemarks || "");
      } catch (err) {
        setError(err.message || "Failed to load service request");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = () => {
    setEditData({
      status: data.status || "open",
      priority: data.priority || "medium",
      type: data.type || "repair",
      description: data.description || "",
      preferredDate: data.preferredDate ? data.preferredDate.split("T")[0] : "",
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
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await serviceRequestService.update(id, editData);
      setData(updated.data || { ...data, ...editData });
      setEditMode(false);
      showToast("Request updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Save failed",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status change ────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    try {
      await serviceRequestService.updateStatus(id, newStatus);
      setData((p) => ({ ...p, status: newStatus }));
      showToast("Status updated");
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // ── Assign ─────────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignTo.trim()) return;
    try {
      setAssignSaving(true);
      await serviceRequestService.assign(id, assignTo.trim());
      setData((p) => ({ ...p, assignedTo: assignTo.trim() }));
      showToast("Technician assigned");
    } catch (err) {
      showToast(err.message || "Assign failed", "error");
    } finally {
      setAssignSaving(false);
    }
  };

  // ── Remark ─────────────────────────────────────────────────────────────────
  const handleRemark = async () => {
    try {
      setRemarkSaving(true);
      await serviceRequestService.addRemark(id, remarkText);
      setData((p) => ({ ...p, adminRemarks: remarkText }));
      showToast("Remark saved");
    } catch (err) {
      showToast(err.message || "Failed to save remark", "error");
    } finally {
      setRemarkSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await serviceRequestService.delete(id);
      navigate("/admin/service-requests");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
  const fmtDate = (d) =>
    !d
      ? "—"
      : new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  const fmtTime = (d) =>
    !d
      ? "—"
      : new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

  const setAddr = (k, v) =>
    setEditData((p) => ({ ...p, address: { ...p.address, [k]: v } }));
  const setPay = (k, v) =>
    setEditData((p) => ({
      ...p,
      paymentdetails: { ...p.paymentdetails, [k]: v },
    }));

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (loading)
    return (
      <div style={s.centerScreen}>
        <div style={s.spinner} />
        <p style={{ color: "#64748B", marginTop: 16 }}>
          Loading request details…
        </p>
      </div>
    );

  if (error)
    return (
      <div style={s.centerScreen}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: "#B91C1C", fontWeight: 600 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          ← Go Back
        </button>
      </div>
    );

  if (!data) return null;

  const statusMeta = STATUS_META[data.status] || STATUS_META.open;
  const priorityMeta = PRIORITY_META[data.priority] || PRIORITY_META.medium;
  const ticketId = `#${String(data._id).slice(-6).toUpperCase()}`;
  const userName = data.user?.fullName || data.user?.name || "Unknown User";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            ...s.toast,
            background: toast.type === "error" ? "#B91C1C" : "#15803D",
          }}
        >
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      {/* ── Top Bar ── */}
      <div style={s.topBar}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          <MdArrowBack size={16} /> Back to Requests
        </button>
        <div style={s.topBarRight}>
          <button onClick={openEdit} style={s.editTopBtn}>
            <MdEdit size={15} /> Edit
          </button>
          <button onClick={() => setDeleteConfirm(true)} style={s.deleteTopBtn}>
            <MdDelete size={15} /> Delete
          </button>
        </div>
      </div>

      {/* ── Hero Header ── */}
      <div style={s.heroCard}>
        <div style={s.heroLeft}>
          <div style={s.typeEmoji}>{TYPE_ICONS[data.type] || "📋"}</div>
          <div>
            <div style={s.heroTicket}>{ticketId}</div>
            <h1 style={s.heroTitle}>{data.productname || "Service Request"}</h1>
            <div style={s.heroBadges}>
              <span
                style={{
                  ...s.heroBadge,
                  background: statusMeta.bg,
                  color: statusMeta.color,
                }}
              >
                <span style={{ ...s.dot, background: statusMeta.dot }} />
                {statusMeta.label}
              </span>
              <span
                style={{
                  ...s.heroBadge,
                  background: priorityMeta.bg,
                  color: priorityMeta.color,
                }}
              >
                {priorityMeta.label} Priority
              </span>
              <span style={s.typeBadge}>{cap(data.type)}</span>
            </div>
          </div>
        </div>
        <div style={s.heroRight}>
          <div style={s.heroMeta}>
            <MdCalendarToday size={14} style={{ color: "#94A3B8" }} />
            <span style={s.heroMetaText}>
              Created {fmtTime(data.createdAt)}
            </span>
          </div>
          {data.preferredDate && (
            <div style={s.heroMeta}>
              <MdAccessTime size={14} style={{ color: "#94A3B8" }} />
              <span style={s.heroMetaText}>
                Preferred: {fmtDate(data.preferredDate)}
              </span>
            </div>
          )}
          {data.resolvedAt && (
            <div style={s.heroMeta}>
              <MdCheckCircle size={14} style={{ color: "#22C55E" }} />
              <span style={{ ...s.heroMetaText, color: "#15803D" }}>
                Resolved: {fmtTime(data.resolvedAt)}
              </span>
            </div>
          )}
          {/* Quick Status Changer */}
          <div style={{ marginTop: 12 }}>
            <label style={s.quickLabel}>Quick Status</label>
            <select
              value={data.status || ""}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                ...s.quickSelect,
                background: statusMeta.bg,
                color: statusMeta.color,
              }}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {cap(st)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={s.grid}>
        {/* ── LEFT COLUMN ── */}
        <div style={s.leftCol}>
          {/* Description */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdNotes size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Description</span>
            </div>
            <p style={s.descText}>
              {data.description || "No description provided."}
            </p>
          </div>

          {/* User Details */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdPerson size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Customer Details</span>
            </div>
            <div style={s.userHero}>
              <div style={s.avatarLg}>{userName.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={s.userNameLg}>{userName}</div>
                <div style={s.userRole}>
                  {cap(data.user?.role || "user")}
                  {data.user?.isVerified && (
                    <span style={s.verifiedBadge}>✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
            <div style={s.infoGrid}>
              <InfoRow
                icon={<MdEmail size={14} />}
                label="Email"
                value={data.user?.email || "—"}
              />
              <InfoRow
                icon={<MdPhone size={14} />}
                label="Phone"
                value={
                  data.user?.mobile || data.user?.phone || data.phone || "—"
                }
              />
              <InfoRow
                icon={<MdLocationOn size={14} />}
                label="Address"
                value={
                  data.address
                    ? [
                        data.address.street,
                        data.address.city,
                        data.address.state,
                        data.address.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "—"
                }
              />
            </div>
          </div>

          {/* Payment Details */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdPayment size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Payment Details</span>
            </div>
            <div style={s.payGrid}>
              <PayCell
                label="Method"
                value={cap(data.paymentdetails?.method)}
              />
              <PayCell
                label="Amount"
                value={
                  data.paymentdetails?.amount
                    ? `₹${data.paymentdetails.amount}`
                    : "—"
                }
              />
              <PayCell
                label="Status"
                value={cap(data.paymentdetails?.status)}
                highlight={
                  data.paymentdetails?.status === "paid"
                    ? "#15803D"
                    : data.paymentdetails?.status === "failed"
                      ? "#B91C1C"
                      : "#B45309"
                }
              />
              <PayCell
                label="Transaction ID"
                value={data.paymentdetails?.transactionId || "—"}
                mono
              />
            </div>
          </div>

          {/* Issue Images */}
          {data.issueImages?.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <MdImage size={16} style={s.cardIcon} />
                <span style={s.cardTitle}>
                  Issue Images ({data.issueImages.length})
                </span>
              </div>
              <div style={s.imgGrid}>
                {data.issueImages.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer">
                    <img src={img} alt={`Issue ${i + 1}`} style={s.issueImg} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={s.rightCol}>
          {/* Request Info */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdInfo size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Request Info</span>
            </div>
            <div style={s.infoList}>
              <InfoRow label="Ticket ID" value={ticketId} mono />
              <InfoRow
                label="Type"
                value={`${TYPE_ICONS[data.type] || ""} ${cap(data.type)}`}
              />
              <InfoRow
                label="Priority"
                value={cap(data.priority)}
                color={priorityMeta.color}
              />
              <InfoRow
                label="Status"
                value={statusMeta.label}
                color={statusMeta.color}
              />
              <InfoRow
                label="Order"
                value={
                  data.orderId?.orderNumber
                    ? `#${data.orderId.orderNumber}`
                    : data.orderId?._id
                      ? `#${String(data.orderId._id).slice(-4)}`
                      : "—"
                }
                mono
              />
              <InfoRow
                label="Product ID"
                value={
                  data.productId?._id
                    ? String(data.productId._id).slice(-8)
                    : "—"
                }
                mono
              />
              <InfoRow label="Created At" value={fmtTime(data.createdAt)} />
              <InfoRow label="Updated At" value={fmtTime(data.updatedAt)} />
              <InfoRow
                label="Resolved At"
                value={fmtTime(data.resolvedAt)}
                color={data.resolvedAt ? "#15803D" : undefined}
              />
            </div>
          </div>

          {/* Assign Technician */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdBuild size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Assigned Technician</span>
            </div>
            {data.assignedTo ? (
              <div style={s.assignedBox}>
                <div style={s.assignedAvatar}>
                  <MdPerson size={20} />
                </div>
                <div>
                  <div style={s.assignedName}>{data.assignedTo}</div>
                  <div style={s.assignedSub}>Technician ID</div>
                </div>
              </div>
            ) : (
              <div style={s.unassignedBox}>Not yet assigned</div>
            )}
            <div style={{ marginTop: 14 }}>
              <label style={s.fieldLabel}>Assign / Reassign</label>
              <div style={s.assignRow}>
                <input
                  style={s.assignInput}
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  placeholder="Enter technician user ID"
                />
                <button
                  onClick={handleAssign}
                  style={s.assignBtn}
                  disabled={assignSaving}
                >
                  {assignSaving ? "…" : "Assign"}
                </button>
              </div>
            </div>
          </div>

          {/* Admin Remarks */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <MdAssignment size={16} style={s.cardIcon} />
              <span style={s.cardTitle}>Admin Remarks</span>
            </div>
            <textarea
              style={s.remarkArea}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Add internal notes here…"
              rows={4}
            />
            <button
              onClick={handleRemark}
              style={s.saveRemarkBtn}
              disabled={remarkSaving}
            >
              <MdSave size={14} /> {remarkSaving ? "Saving…" : "Save Remark"}
            </button>
          </div>
        </div>
      </div>

      {/* ════════ EDIT MODAL ════════ */}
      {editMode && (
        <div style={s.overlay} onClick={() => setEditMode(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <h2 style={s.modalTitle}>Edit Request</h2>
                <span style={{ fontSize: 13, color: "#64748B" }}>
                  {data.productname}
                </span>
              </div>
              <button onClick={() => setEditMode(false)} style={s.closeBtn}>
                <MdClose size={20} />
              </button>
            </div>
            <div
              style={{ ...s.modalBody, maxHeight: "65vh", overflowY: "auto" }}
            >
              <div style={s.formRow}>
                <Field label="Status">
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
                </Field>
                <Field label="Priority">
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
                </Field>
                <Field label="Type">
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
                </Field>
              </div>
              <div style={s.formRow}>
                <Field label="Preferred Date">
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
                </Field>
                <Field label="Phone">
                  <input
                    style={s.input}
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  style={{ ...s.input, height: 80, resize: "vertical" }}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </Field>
              <div style={s.sectionLabel}>Address</div>
              <div style={s.formRow}>
                <Field label="Street" style={{ flex: 2 }}>
                  <input
                    style={s.input}
                    value={editData.address?.street || ""}
                    onChange={(e) => setAddr("street", e.target.value)}
                  />
                </Field>
                <Field label="City">
                  <input
                    style={s.input}
                    value={editData.address?.city || ""}
                    onChange={(e) => setAddr("city", e.target.value)}
                  />
                </Field>
              </div>
              <div style={s.formRow}>
                <Field label="State">
                  <input
                    style={s.input}
                    value={editData.address?.state || ""}
                    onChange={(e) => setAddr("state", e.target.value)}
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    style={s.input}
                    value={editData.address?.pincode || ""}
                    onChange={(e) => setAddr("pincode", e.target.value)}
                    maxLength={6}
                  />
                </Field>
              </div>
              <div style={s.sectionLabel}>Payment</div>
              <div style={s.formRow}>
                <Field label="Method">
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
                </Field>
                <Field label="Amount (₹)">
                  <input
                    type="number"
                    style={s.input}
                    value={editData.paymentdetails?.amount || ""}
                    onChange={(e) => setPay("amount", e.target.value)}
                  />
                </Field>
                <Field label="Payment Status">
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
                </Field>
              </div>
              <Field label="Transaction ID">
                <input
                  style={s.input}
                  value={editData.paymentdetails?.transactionId || ""}
                  onChange={(e) => setPay("transactionId", e.target.value)}
                  placeholder="Optional"
                />
              </Field>
            </div>
            <div style={s.modalFooter}>
              <button
                onClick={handleSave}
                style={s.primaryBtn}
                disabled={saving}
              >
                <MdSave size={16} /> {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditMode(false)} style={s.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRM ════════ */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(false)}>
          <div
            style={{ ...s.modal, maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, color: "#B91C1C" }}>
                Delete Request
              </h2>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={s.closeBtn}
              >
                <MdClose size={20} />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🗑️</div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#0F172A",
                    margin: "0 0 8px",
                  }}
                >
                  Delete this service request?
                </p>
                <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
                  <strong>{data.productname}</strong> — {ticketId}
                </p>
                <p style={{ color: "#EF4444", fontSize: 12, marginTop: 10 }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...s.primaryBtn, background: "#DC2626" }}
              >
                <MdDelete size={16} /> {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
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

// ─── Small helper components ──────────────────────────────────────────────────
function InfoRow({ icon, label, value, mono, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "9px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: "#94A3B8",
          fontSize: 12,
          fontWeight: 600,
          minWidth: 110,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: color || "#1E293B",
          fontWeight: 500,
          fontFamily: mono ? "monospace" : undefined,
          textAlign: "right",
          maxWidth: 220,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function PayCell({ label, value, highlight, mono }) {
  return (
    <div
      style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94A3B8",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: highlight || "#0F172A",
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        ...style,
      }}
    >
      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "24px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#1E293B",
    maxWidth: 1300,
    margin: "0 auto",
  },
  centerScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 8,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #E2E8F0",
    borderTop: "3px solid #2563EB",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // Top bar
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  topBarRight: { display: "flex", gap: 10 },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  editTopBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#2563EB",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteTopBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Hero
  heroCard: {
    background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    borderRadius: 16,
    padding: "28px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 20,
    flexWrap: "wrap",
  },
  heroLeft: { display: "flex", alignItems: "flex-start", gap: 18 },
  typeEmoji: { fontSize: 42, lineHeight: 1, marginTop: 4 },
  heroTicket: {
    fontSize: 12,
    fontWeight: 700,
    color: "#94A3B8",
    letterSpacing: "0.1em",
    fontFamily: "monospace",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#F8FAFC",
    margin: "0 0 12px",
    lineHeight: 1.2,
  },
  heroBadges: { display: "flex", gap: 8, flexWrap: "wrap" },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 12px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
  },
  typeBadge: {
    background: "#334155",
    color: "#CBD5E1",
    padding: "4px 12px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  dot: { width: 7, height: 7, borderRadius: 99, display: "inline-block" },
  heroRight: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 220,
  },
  heroMeta: { display: "flex", alignItems: "center", gap: 7 },
  heroMetaText: { fontSize: 12, color: "#94A3B8" },
  quickLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: 5,
  },
  quickSelect: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
  },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 },
  leftCol: { display: "flex", flexDirection: "column", gap: 20 },
  rightCol: { display: "flex", flexDirection: "column", gap: 20 },

  // Cards
  card: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "20px 22px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #F1F5F9",
  },
  cardIcon: { color: "#2563EB" },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  // Description
  descText: { margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.7 },

  // User
  userHero: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    padding: "14px 16px",
    background: "#F8FAFC",
    borderRadius: 10,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 99,
    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userNameLg: { fontWeight: 700, fontSize: 16, color: "#0F172A" },
  userRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  verifiedBadge: {
    background: "#F0FDF4",
    color: "#15803D",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 99,
  },
  infoGrid: { display: "flex", flexDirection: "column" },
  infoList: { display: "flex", flexDirection: "column" },

  // Payment
  payGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  // Images
  imgGrid: { display: "flex", gap: 10, flexWrap: "wrap" },
  issueImg: {
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 10,
    border: "2px solid #E2E8F0",
    cursor: "pointer",
    transition: "transform 0.15s",
  },

  // Request Info
  assignedBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#F0FDF4",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 4,
  },
  assignedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 99,
    background: "#DCFCE7",
    color: "#15803D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  assignedName: {
    fontWeight: 700,
    color: "#0F172A",
    fontSize: 13,
    fontFamily: "monospace",
  },
  assignedSub: { fontSize: 11, color: "#64748B" },
  unassignedBox: {
    background: "#F8FAFC",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    display: "block",
    marginBottom: 6,
  },
  assignRow: { display: "flex", gap: 8 },
  assignInput: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    color: "#1E293B",
    outline: "none",
  },
  assignBtn: {
    padding: "9px 16px",
    borderRadius: 8,
    background: "#2563EB",
    color: "#fff",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // Remarks
  remarkArea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    color: "#1E293B",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
  },
  saveRemarkBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    borderRadius: 8,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#1E293B",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Toast
  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    padding: "12px 20px",
    borderRadius: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
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
    maxWidth: 600,
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
  formRow: { display: "flex", gap: 12, marginBottom: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 10,
    marginTop: 4,
  },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    fontSize: 13,
    color: "#1E293B",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
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

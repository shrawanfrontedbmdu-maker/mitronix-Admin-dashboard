import { useEffect, useState } from 'react'
import { MdEmail, MdPhone, MdVerified, MdArrowBack, MdEdit, MdAccessTime, MdPerson } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import adminProfileService from '../api/adminprofileService.js'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await adminProfileService.getProfile()
        setProfile(res.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
    </div>
  )

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: "#ef4444", fontSize: "15px" }}>{error}</p>
    </div>
  )

  if (!profile) return (
    <div style={styles.centered}>
      <p style={{ color: "#6b7280" }}>Profile not found</p>
    </div>
  )

  const name     = profile.userId?.fullName || profile.userId?.name || "Admin"
  const email    = profile.userId?.email || "—"
  const initials = name.charAt(0).toUpperCase()
  const isActive = profile.isActive

  return (
    <div style={styles.page}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.breadcrumb}>Dashboard / Profile</p>
          <h1 style={styles.pageTitle}>My Profile</h1>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <MdArrowBack size={16} />
            Back
          </button>
          <Link to="/profile/edit" style={{ textDecoration: "none" }}>
            <button style={styles.editBtn}>
              <MdEdit size={16} />
              Edit Profile
            </button>
          </Link>
        </div>
      </div>

      <div style={styles.layout}>

        {/* ── Left Card — Avatar & Name ────────────── */}
        <div style={styles.leftCard}>

          {/* Avatar */}
          <div style={styles.avatarWrapper}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <span style={styles.avatarInitials}>{initials}</span>
              </div>
            )}
            <span style={{ ...styles.statusDot, background: isActive ? "#22c55e" : "#ef4444" }} />
          </div>

          {/* Name */}
          <div style={styles.nameSection}>
            <h2 style={styles.name}>
              {name}
              {isActive && <MdVerified size={18} style={{ color: "#6366f1", marginLeft: "6px", verticalAlign: "middle" }} />}
            </h2>
            <p style={styles.emailText}>{email}</p>
            <span style={{ ...styles.statusBadge, background: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#16a34a" : "#dc2626" }}>
              {isActive ? "● Active" : "● Inactive"}
            </span>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Quick Info */}
          <div style={styles.quickInfo}>
            <div style={styles.quickItem}>
              <MdPerson size={15} style={{ color: "#9ca3af" }} />
              <span style={styles.quickLabel}>Role</span>
              <span style={styles.quickValue}>Administrator</span>
            </div>
            <div style={styles.quickItem}>
              <MdAccessTime size={15} style={{ color: "#9ca3af" }} />
              <span style={styles.quickLabel}>Joined</span>
              <span style={styles.quickValue}>
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Side ───────────────────────────── */}
        <div style={styles.rightSide}>

          {/* Personal Info Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Personal Information</h3>
            <div style={styles.infoGrid}>

              <InfoRow icon={<MdEmail size={16} style={{ color: "#6366f1" }} />} label="Email">
                <a href={`mailto:${email}`} style={styles.link}>{email}</a>
              </InfoRow>

              <InfoRow icon={<MdPhone size={16} style={{ color: "#6366f1" }} />} label="Phone">
                <span style={styles.infoVal}>{profile.phone || "—"}</span>
              </InfoRow>

              <InfoRow icon={<MdAccessTime size={16} style={{ color: "#6366f1" }} />} label="Last Login">
                <span style={styles.infoVal}>
                  {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "—"}
                </span>
              </InfoRow>

              <InfoRow icon={<MdAccessTime size={16} style={{ color: "#6366f1" }} />} label="Last Seen">
                <span style={styles.infoVal}>
                  {profile.lastSeen ? new Date(profile.lastSeen).toLocaleString() : "—"}
                </span>
              </InfoRow>

            </div>
          </div>

          {/* Bio Card */}
          {profile.bio && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>About</h3>
              <div style={styles.bioText}>
                {profile.bio.split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: "12px", lineHeight: "1.7" }}>{para.trim()}</p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Info Row Component ──────────────────────────────────
function InfoRow({ icon, label, children }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoIcon}>{icon}</div>
      <span style={styles.infoLabel}>{label}</span>
      <div style={styles.infoValue}>{children}</div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────
const styles = {
  page: {
    padding: "24px",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Segoe UI', sans-serif",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // Header
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "28px",
  },
  breadcrumb: {
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "4px",
    letterSpacing: "0.5px",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "500",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "#6366f1",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },

  // Layout
  layout: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  // Left Card
  leftCard: {
    width: "260px",
    background: "#fff",
    borderRadius: "16px",
    padding: "28px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: "16px",
  },
  avatarImg: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #e5e7eb",
  },
  avatarPlaceholder: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#fff",
  },
  statusDot: {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "2px solid #fff",
  },
  nameSection: {
    textAlign: "center",
  },
  name: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px",
  },
  emailText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 10px",
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
    display: "inline-block",
  },
  divider: {
    width: "100%",
    height: "1px",
    background: "#f3f4f6",
    margin: "20px 0",
  },
  quickInfo: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  quickItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  quickLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    flex: 1,
  },
  quickValue: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },

  // Right Side
  rightSide: {
    flex: 1,
    minWidth: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoIcon: {
    width: "32px",
    height: "32px",
    background: "#f0f0ff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: "13px",
    color: "#6b7280",
    width: "100px",
    flexShrink: 0,
  },
  infoValue: {
    flex: 1,
  },
  infoVal: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#111827",
  },
  link: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6366f1",
    textDecoration: "none",
  },
  bioText: {
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: "1.7",
  },
}

export default Profile
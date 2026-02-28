import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { customerService } from '../api/customerService'
import {
    MdArrowBack, MdPhone, MdEmail, MdVerified,
    MdShoppingBag, MdAccountBalanceWallet, MdStar,
    MdCheckCircle, MdCancel, MdRefresh, MdLocationOn,
    MdPerson, MdBlock
} from 'react-icons/md'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const orderStatusStyle = {
    Pending:    { bg: '#fef9c3', color: '#a16207' },
    Processing: { bg: '#dbeafe', color: '#1d4ed8' },
    Shipped:    { bg: '#e0e7ff', color: '#4338ca' },
    Delivered:  { bg: '#dcfce7', color: '#15803d' },
    Cancelled:  { bg: '#fee2e2', color: '#b91c1c' },
    Returned:   { bg: '#fce7f3', color: '#9d174d' },
}
const paymentStatusStyle = {
    Pending: { bg: '#fef9c3', color: '#a16207' },
    Paid:    { bg: '#dcfce7', color: '#15803d' },
    Failed:  { bg: '#fee2e2', color: '#b91c1c' },
}

const Badge = ({ label, bg, color }) => (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
)

const StatCard = ({ icon, label, value, color, bg }) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1, minWidth: 130 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{value}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{label}</p>
        </div>
    </div>
)

const Tab = ({ label, active, onClick, count }) => (
    <button onClick={onClick} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: active ? '#6366f1' : 'transparent', color: active ? '#fff' : '#64748b', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        {label}
        {count !== undefined && <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: active ? '#fff' : '#64748b', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{count}</span>}
    </button>
)

export default function CustomerDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('overview')

    const fetchCustomer = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await customerService.getCustomerById(id)
            setCustomer(res.data || res)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }, [id])

    useEffect(() => { fetchCustomer() }, [fetchCustomer])

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'cd-spin 0.7s linear infinite' }} />
            <style>{`@keyframes cd-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error) return (
        <div style={{ padding: 24 }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 20px', color: '#b91c1c', fontSize: 14 }}>{error}</div>
        </div>
    )

    if (!customer) return null

    const orders = customer.orders || []
    const delivered = orders.filter(o => o.orderStatus === 'Delivered').length
    const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length
    const totalSpent = orders.filter(o => o.orderStatus === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0)

    return (
        <>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate(-1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
                        <MdArrowBack size={18} />
                    </button>
                    <div>
                        <h3 className="page-title" style={{ margin: 0 }}>Customer Detail</h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>#{id?.slice(-12).toUpperCase()}</p>
                    </div>
                </div>
                <button onClick={fetchCustomer} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    <MdRefresh size={16} /> Refresh
                </button>
            </div>

            {/* Profile Card */}
            <div className="content-card">
                <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        {customer.profileImage
                            ? <img src={customer.profileImage} alt="" style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0', flexShrink: 0 }} />
                            : <div style={{ width: 76, height: 76, borderRadius: '50%', background: `hsl(${(customer.name?.charCodeAt(0) || 65) * 10 % 360},55%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 30, flexShrink: 0 }}>
                                {customer.name?.[0]?.toUpperCase()}
                            </div>
                        }

                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a', fontWeight: 700 }}>{customer.name}</h2>
                                <Badge label={customer.status === 'active' ? '● Active' : '● ' + (customer.status || 'Unknown')} bg={customer.status === 'active' ? '#dcfce7' : '#fee2e2'} color={customer.status === 'active' ? '#15803d' : '#b91c1c'} />
                                <Badge label={customer.role || 'customer'} bg="#eef2ff" color="#6366f1" />
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginBottom: 10 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                                    <MdEmail size={14} color="#94a3b8" /> {customer.email}
                                    {customer.emailVerified && <MdVerified size={13} color="#6366f1" title="Verified" />}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                                    <MdPhone size={14} color="#94a3b8" /> {customer.phone}
                                    {customer.phoneVerified && <MdVerified size={13} color="#6366f1" title="Verified" />}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Joined: <b style={{ color: '#475569' }}>{formatDate(customer.createdAt)}</b></span>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Updated: <b style={{ color: '#475569' }}>{formatDate(customer.updatedAt)}</b></span>
                                {customer.referralCode && <span style={{ fontSize: 12, color: '#94a3b8' }}>Referral: <b style={{ color: '#6366f1', fontFamily: 'monospace' }}>{customer.referralCode}</b></span>}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        <StatCard icon={<MdShoppingBag size={20} />} label="Total Orders" value={orders.length} color="#6366f1" bg="#eef2ff" />
                        <StatCard icon={<MdCheckCircle size={20} />} label="Delivered" value={delivered} color="#10b981" bg="#d1fae5" />
                        <StatCard icon={<MdCancel size={20} />} label="Cancelled" value={cancelled} color="#ef4444" bg="#fee2e2" />
                        <StatCard icon={<MdAccountBalanceWallet size={20} />} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} color="#f59e0b" bg="#fef9c3" />
                        <StatCard icon={<MdAccountBalanceWallet size={20} />} label="Wallet" value={`₹${customer.walletBalance ?? 0}`} color="#06b6d4" bg="#cffafe" />
                        <StatCard icon={<MdStar size={20} />} label="Reward Points" value={customer.rewardPoints ?? 0} color="#8b5cf6" bg="#ede9fe" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="content-card">
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 4, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' }}>
                        <Tab label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <Tab label="Addresses" active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} count={customer.addresses?.length || 0} />
                        <Tab label="Wallet & Points" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
                        <Tab label="Reviews" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} count={customer.reviews?.length || 0} />
                    </div>

                    <div style={{ padding: 22 }}>

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 24px' }}>
                                {[
                                    ['Customer ID', <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6366f1' }}>#{customer._id?.slice(-12).toUpperCase()}</span>],
                                    ['Full Name', customer.name],
                                    ['Email', customer.email],
                                    ['Phone', customer.phone],
                                    ['Status', <Badge label={customer.status} bg={customer.status === 'active' ? '#dcfce7' : '#fee2e2'} color={customer.status === 'active' ? '#15803d' : '#b91c1c'} />],
                                    ['Role', <Badge label={customer.role || 'customer'} bg="#eef2ff" color="#6366f1" />],
                                    ['Email Verified', customer.emailVerified ? <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Yes</span> : <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ No</span>],
                                    ['Phone Verified', customer.phoneVerified ? <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Yes</span> : <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ No</span>],
                                    ['Wallet Balance', `₹ ${customer.walletBalance ?? 0}`],
                                    ['Reward Points', `${customer.rewardPoints ?? 0} pts`],
                                    ['Referral Code', customer.referralCode || '—'],
                                    ['Total Orders', orders.length],
                                    ['Delivered', delivered],
                                    ['Cancelled', cancelled],
                                    ['Registered On', formatDateTime(customer.createdAt)],
                                    ['Last Updated', formatDateTime(customer.updatedAt)],
                                ].map(([label, val]) => (
                                    <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                                        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ADDRESSES */}
                        {activeTab === 'addresses' && (
                            !customer.addresses?.length
                                ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}><MdLocationOn size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />No addresses saved</div>
                                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                                    {customer.addresses.map((addr, i) => (
                                        <div key={i} style={{ border: `1.5px solid ${addr.isDefault ? '#6366f1' : '#e2e8f0'}`, borderRadius: 12, padding: 16, background: addr.isDefault ? '#fafafe' : '#fafafa', position: 'relative' }}>
                                            {addr.isDefault && <span style={{ position: 'absolute', top: 10, right: 10, background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>DEFAULT</span>}
                                            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{addr.fullName}</p>
                                            <p style={{ margin: '0 0 2px', fontSize: 12, color: '#64748b' }}>{addr.phone}</p>
                                            <p style={{ margin: '0 0 2px', fontSize: 12, color: '#64748b' }}>{addr.addressLine1}</p>
                                            {addr.addressLine2 && <p style={{ margin: '0 0 2px', fontSize: 12, color: '#64748b' }}>{addr.addressLine2}</p>}
                                            {addr.landmark && <p style={{ margin: '0 0 2px', fontSize: 12, color: '#94a3b8' }}>Near: {addr.landmark}</p>}
                                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569', fontWeight: 600 }}>{addr.city}, {addr.state} — {addr.pincode}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{addr.country}</p>
                                        </div>
                                    ))}
                                </div>
                        )}

                        {/* WALLET & POINTS */}
                        {activeTab === 'wallet' && (
                            <div>
                                <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 180, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 14, padding: 20, color: '#fff' }}>
                                        <p style={{ margin: 0, fontSize: 11, opacity: 0.8, letterSpacing: '0.06em' }}>WALLET BALANCE</p>
                                        <p style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 800 }}>₹ {customer.walletBalance ?? 0}</p>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 180, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 14, padding: 20, color: '#fff' }}>
                                        <p style={{ margin: 0, fontSize: 11, opacity: 0.8, letterSpacing: '0.06em' }}>REWARD POINTS</p>
                                        <p style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 800 }}>{customer.rewardPoints ?? 0} <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.8 }}>pts</span></p>
                                    </div>
                                </div>

                                <h4 style={{ margin: '0 0 14px', color: '#0f172a', fontSize: 14, fontWeight: 700 }}>Reward History</h4>
                                {!customer.rewardHistory?.length
                                    ? <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>No reward history yet</div>
                                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {customer.rewardHistory.map((h, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: h.type === 'credit' ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: h.type === 'credit' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: 18 }}>
                                                        {h.type === 'credit' ? '+' : '−'}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{h.remark || (h.type === 'credit' ? 'Points Added' : 'Points Deducted')}</p>
                                                        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{formatDateTime(h.createdAt)}</p>
                                                        {h.expiryDate && <p style={{ margin: 0, fontSize: 11, color: '#f59e0b' }}>Expires: {formatDate(h.expiryDate)}</p>}
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: h.type === 'credit' ? '#10b981' : '#ef4444' }}>
                                                    {h.type === 'credit' ? '+' : '−'}{Math.abs(h.points)} pts
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                        )}

                        {/* REVIEWS */}
                        {activeTab === 'reviews' && (
                            !customer.reviews?.length
                                ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}><MdStar size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />No reviews yet</div>
                                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {customer.reviews.map((rev, i) => (
                                        <div key={i} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div style={{ display: 'flex', gap: 2 }}>
                                                    {[1, 2, 3, 4, 5].map(s => <MdStar key={s} size={16} color={s <= rev.rating ? '#f59e0b' : '#e2e8f0'} />)}
                                                </div>
                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(rev.reviewedAt)}</span>
                                            </div>
                                            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#475569' }}>{rev.comment || 'No comment'}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>Product: {rev.productId}</p>
                                        </div>
                                    ))}
                                </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    )
}
import React from 'react'
import { Link } from 'react-router-dom'

export default function UserProfile() {
    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <h3 className='page-title'><strong>User Profile</strong></h3>
                </div>
                <div className="page-actions">
                    <Link to="/customer/list" className="btn btn-primary">
                        <h5>Back To List</h5>
                    </Link>
                </div>
            </div>
            <div className="content-card profile-card">
                <div className="profile-header">
                    <img
                        src="https://i.pravatar.cc/80"
                        alt="avatar"
                        className="profile-avatar"
                    />
                    <div>
                        <h2 className="profile-name">Khush Alam</h2>
                        <p className="">Khush735265@gmail.com</p>
                        <p className="">91-8092492943</p>
                    </div>
                </div>

                {/* STATS */}
                <div className="profile-stats">
                    <div className="stat-box">
                        <p>Points</p>
                        <h3>0</h3>
                    </div>
                    <div className="stat-box">
                        <p>Age Group</p>
                        <h3>6–9 years</h3>
                    </div>
                    <div className="stat-box">
                        <p>Total Orders</p>
                        <h3>N/A</h3>
                    </div>
                    <div className="stat-box">
                        <p>Total Spent</p>
                        <h3>N/A</h3>
                    </div>
                </div>

                {/* TAGS */}
                <div className="section">
                    <h4 className="section-title">User Tags</h4>
                    <div className="tags">
                        <span className="tag">Low Spender</span>
                        <span className="tag">New Customer</span>
                    </div>
                </div>

                {/* ADDRESSES */}
                <div className="section">
                    <h4 className="section-title"> Saved Addresses</h4>
                    <div className="address-grid">
                        <div className="address-card">
                            <strong>Khush Alam</strong>
                            <p>46 Office Rd, Suite 100</p>
                            <p>Metro City, Noida</p>
                            <p>Another State, India – 67890</p>
                        </div>
                        <div className="address-card">
                            <strong>Work</strong>
                            <p>b41 Bmdu, Suite 100</p>
                            <p>Metro City, Noida</p>
                            <p>Another State, India – 67890</p>
                        </div>
                    </div>
                </div>

                <div className="profile-meta">
                    <p>Joined: 9/8/2025</p>
                    <p>Last Updated: 1/29/2026</p>
                </div>

                <div className="section">
                    <h4 className="section-title">Order History</h4>
                    <p className="no-orders">No orders found</p>
                </div>
                <style>{`
                .profile-card {
                 padding: 20px;
                 }
                 .profile-header {
                 display: flex;
                 gap: 16px;
                 align-items: center;
                 margin-bottom: 20px;
                 }
                 .profile-avatar {
                   margin-top: 2px;     /* ⬇ thoda niche */
                   margin-left: 7px;
                   width: 100px;
                   height: 100px;
                   border-radius: 50%;
                   object-fit: cover;
                   border: 2px solid black;
                   transform: translate(6px, 8px); /* (right, down) */
                   }

                  .profile-name {
                   margin: 0;
                   }
                   .profile-info {
                    margin: 2px 0;
                    color: #555;
                    font-size: 14px;
                    }

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-box {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}

.stat-box p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.stat-box h3 {
  margin: 4px 0 0;
}

.section {
  margin-bottom: 22px;
}

.section-title {
  margin-bottom: 10px;
}

.tags {
  display: flex;
  gap: 10px;
}

.tag {
  background: #e0edff;
  color: #2563eb;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.address-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  background: #fafafa;
}

.profile-meta {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  font-size: 13px;
  color: #666;
}

.no-orders {
  color: #888;
  font-size: 14px;
}
`}</style>
            </div>

        </>
    )
}

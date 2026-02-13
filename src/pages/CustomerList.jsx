import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md'
import { customerService } from '../api/customerService'

export default function CustomerList() {
    const [menuPos, setMenuPos] = useState(null)
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("")
    const menuRef = useRef(null)

    const MENU_WIDTH = 100
    const MENU_HEIGHT = 130

    const handleMenuOpen = (e, cust) => {
        e.stopPropagation();
        setSelectedCustomer(cust);

        const rect = e.currentTarget.getBoundingClientRect();
        let left = rect.right + window.scrollX - MENU_WIDTH + 10;
        let top = rect.bottom + window.scrollY + 10;

        if (left + MENU_WIDTH > window.innerWidth) {
            left = window.innerWidth - MENU_WIDTH - 10;
        }
        if (left < 10) left = 10;

        if (rect.bottom + MENU_HEIGHT > window.innerHeight) {
            top = rect.top + window.scrollY - MENU_HEIGHT - 10;
        }

        setMenuPos({ top, left });
    };



    useEffect(() => {
        const handleOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuPos(null);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        window.addEventListener("scroll", () => setMenuPos(null));
        window.addEventListener("resize", () => setMenuPos(null));

        return () => {
            document.removeEventListener("mousedown", handleOutside);
        };
    }, []);



    const dropdownStyle = {
        position: "absolute",
        top: menuPos?.top,
        left: menuPos?.left,
        width: MENU_WIDTH,
        background: "rgba(255,255,255,0.75)",   // 👈 transparent glass look
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "10px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        zIndex: 9999,
        padding: "4px 0"
    }

    const itemStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "14px"
    }
    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <h3 className='page-title'>Filter</h3>
                </div>
            </div>

            {/* FILTER SECTION */}
            <div className="content-card">
                <div className="customer-page">
                    <div className="card filter-card">
                        <div className="card-body">
                            <div className="filter-grid">
                                <div className="form-group"><label>Customer ID</label><input type="text" placeholder='Enter Customer ID' /></div>
                                <div className="form-group"><label>Name</label><input type="text" placeholder='Enter Name' /></div>
                                <div className="form-group"><label>Email</label><input type="email" placeholder='Enter Email Address' /></div>
                                <div className="form-group"><label>Phone</label><input type="number" placeholder='Enter mobile Number' /></div>
                                <div className="form-group"><label>Sign Up From</label><input type="date" /></div>
                                <div className="form-group"><label>Sign Up To</label><input type="date" /></div>
                                <div className="form-group"><label>State</label><select><option>Another State</option></select></div>
                                <div className="form-group"><label>City</label><select><option>Metro City</option></select></div>
                                <div className="form-group"><label>Pincode</label><input type="number" placeholder='Enter Pin Code' /></div>
                            </div>

                            <div className="filter-actions">
                                <button className="btn btn-primary">Apply Filter</button>
                                <button className="btn btn-light">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* TABLE SECTION */}
            <div className="content-card">
                <div className="table-container">
                    <div className="card table-card">
                        <div className="card-header">
                            <h3 className="card-title">Customer Profiles</h3>
                        </div>

                        <div className="table-responsive" style={{ cursor: "pointer" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Customer ID</th>
                                        <th>Customer Name</th>
                                        <th>Phone</th>
                                        <th>Registration Date</th>
                                        <th>Total Orders</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: 1, custId: "CUST-001", name: "Tarun Chauhan", phone: "865777446", date: "2025-09-08", orders: 0, active: true },
                                        { id: 2, custId: "CUST-002", name: "Anjali Verma", phone: "9123456780", date: "2025-08-21", orders: 3, active: true },
                                        { id: 3, custId: "CUST-003", name: "Rohit Sharma", phone: "9988776655", date: "2025-07-14", orders: 5, active: false },
                                    ].map((cust) => (
                                        <tr key={cust.id}>
                                            <td>{cust.id}</td>
                                            <td><strong>{cust.custId}</strong></td>
                                            <td>{cust.name}</td>
                                            <td>{cust.phone}</td>
                                            <td>{cust.date}</td>
                                            <td>{cust.orders}</td>
                                            <td>
                                                <label style={{
                                                    position: "relative",
                                                    display: "inline-block",
                                                    width: "40px",
                                                    height: "22px"
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={cust?.active}
                                                        readOnly
                                                        style={{
                                                            opacity: 0,
                                                            width: 0,
                                                            height: 0
                                                        }}
                                                    />

                                                    {/* Background Track */}
                                                    <span style={{
                                                        position: "absolute",
                                                        cursor: "pointer",
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: cust?.active ? "#22c55e" : "#ef4444", // 🟢 Green | 🔴 Red
                                                        transition: "0.3s",
                                                        borderRadius: "34px"
                                                    }}></span>

                                                    {/* Knob */}
                                                    <span style={{
                                                        position: "absolute",
                                                        height: "16px",
                                                        width: "16px",
                                                        left: "3px",
                                                        top: "3px",
                                                        backgroundColor: "white",
                                                        transition: "0.3s",
                                                        borderRadius: "50%",
                                                        transform: cust?.active ? "translateX(18px)" : "translateX(0px)" // right if active, left if inactive
                                                    }}></span>
                                                </label>
                                            </td>

                                            <td>
                                                <span
                                                    style={{ cursor: "pointer", fontSize: "20px" }}
                                                    onClick={(e) => handleMenuOpen(e, cust)}
                                                >
                                                    •••
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* DROPDOWN */}
            {menuPos &&
                ReactDOM.createPortal(
                    <div ref={menuRef} style={dropdownStyle}>
                        <div style={itemStyle}><MdVisibility size={16} /> View</div>

                        <div
                            style={itemStyle}
                            onClick={() => {
                                setShowPointsModal(true);
                                setMenuPos(null);
                            }}
                        >
                            <MdAdd size={18} /> Point
                        </div>

                        <div style={itemStyle}><MdEdit size={16} /> Edit</div>
                        <div style={{ ...itemStyle, color: "#ef4444" }}><MdDelete size={16} /> Delete</div>
                    </div>,
                    document.body
                )}

            {/* ADD POINTS MODAL */}
            {showPointsModal &&
                ReactDOM.createPortal(
                    <div className="points-modal-overlay" onClick={() => setShowPointsModal(false)}>
                        <div className="points-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="points-modal-header">
                                <h3>Add Points for {selectedCustomer?.name}</h3>
                                <button onClick={() => setShowPointsModal(false)}>✕</button>
                            </div>

                            <div className="points-modal-body">
                                <div className="form-group">
                                    <label>Points</label>
                                    <input type="number" placeholder="Enter points" />
                                </div>

                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input type="datetime-local" />
                                </div>

                                <div className="form-group">
                                    <label>Remarks</label>
                                    <textarea placeholder="Enter remarks (optional)" rows="3"></textarea>
                                </div>
                            </div>

                            <div className="points-modal-footer">
                                <button className="btn btn-light" onClick={() => setShowPointsModal(false)}>Cancel</button>
                                <button className="btn btn-primary">Save</button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}




            {/* STYLES */}
            <style>{`
              .filter-grid { display:grid; grid-template-columns:repeat(1,1fr); gap:16px; }
              @media (min-width:768px){ .filter-grid{ grid-template-columns:repeat(2,1fr);} }
              @media (min-width:1200px){ .filter-grid{ grid-template-columns:repeat(3,1fr);} }
              .filter-actions{ display:flex; justify-content:flex-end; gap:12px; margin-top:10px; }
              .points-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .points-modal {
          width: 420px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          animation: popup 0.25s ease;
        }

        @keyframes popup {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .points-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }

        .points-modal-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .points-modal-body input,
        .points-modal-body textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
        }

        .points-modal-footer {
          padding: 14px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #eee;

            `}</style>
        </>
    )
}


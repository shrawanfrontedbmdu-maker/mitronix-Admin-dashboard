import React, { useEffect, useState } from "react";
import CouponesAnalyticscard from "../components/CouponesAnalyticscard";
import couponsService from "../api/couponsService";

export default function CopunsAnalytics() {
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, Setcoupons] = useState([]);
    const [error, setError] = useState("")
    const [loading, Setloading] = useState(false)
    const [ordersv, setOrders] = useState([]);


    const loadOrdersbycoupones = async (code) => {
        try {
            Setloading(true);
            setError("");

            const response = await couponsService.getOrderbyCoupon(code);

            setOrders(response?.data?.data || []); // always array

        } catch (error) {
            console.error(error);
            setOrders([]); // UI safe
        } finally {
            Setloading(false);
        }
    };


    const orders = [
        { id: "ORD001", user: "John Doe", phone: "+91-9876543210" },
        { id: "ORD002", user: "Jane Smith", phone: "+91-9123456780" },
        { id: "ORD003", user: "Alice Johnson", phone: "+91-9988776655" },
    ];  
    useEffect(() => {
        loadCoupones()
    }, [])

    useEffect(() => {
        if (selectedCoupon) {
            loadOrdersbycoupones(selectedCoupon.code);
        }
    }, [selectedCoupon]);
    const loadCoupones = async () => {
        try {
            Setloading(true);
            setError("")

            const responce = await couponsService.getAllCoupons()
            if (responce) {
                Setcoupons(responce?.data)
            }
        } catch (error) {
            setError(error.message || "Feild to load Coupones");
        } finally {
            Setloading(false)
        }
    }

    return (
        <>
            <div style={{ padding: "20px 30px" }}>
                <h1 style={{ marginBottom: "20px" }}>Coupon Analytics</h1>

                <div style={gridStyles.container}>
                    {coupons.map((c, i) => (
                        <CouponesAnalyticscard
                            key={i}
                            code={c.code}
                            used={c.usedCount}
                            onClick={() => setSelectedCoupon(c)}
                        />
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {selectedCoupon && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <div style={modalStyles.header}>
                            <h2 style={{ margin: 0 }}>
                                Orders Using <span style={{ fontWeight: "700" }}>{selectedCoupon.code}</span>
                            </h2>
                            <span
                                style={modalStyles.close}
                                onClick={() => setSelectedCoupon(null)}
                            >
                                ✕
                            </span>
                        </div>

                        <table style={modalStyles.table}>
                            <thead>
                                <tr>
                                    <th style={modalStyles.th}>#</th>
                                    <th style={modalStyles.th}>Order ID</th>
                                    <th style={modalStyles.th}>User</th>
                                    <th style={modalStyles.th}>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : ordersv.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                                            No orders have used this coupon yet
                                        </td>
                                    </tr>
                                ) : (
                                    ordersv.map((order, index) => (
                                        <tr key={order._id || index}>
                                            <td style={modalStyles.td}>{index + 1}</td>
                                            <td style={modalStyles.td}>{order.orderId}</td>
                                            <td style={modalStyles.td}>{order.userId?.name}</td>
                                            <td style={modalStyles.td}>{order.userId?.phone}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>

                    </div>
                </div>
            )}
        </>
    );
}

const gridStyles = {
    container: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
    },
};

const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingTop: "70px",
        paddingLeft: "200px",
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        width: "720px",
        maxWidth: "95%",
        borderRadius: "14px",
        padding: "22px 26px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
        animation: "slideIn 0.25s ease-out",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
    },
    close: {
        fontSize: "22px",
        cursor: "pointer",
        fontWeight: "bold",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
    },
    th: {
        textAlign: "left",
        padding: "12px 10px",
        backgroundColor: "#f5f6f8",
        fontWeight: "600",
        fontSize: "14px",
        borderBottom: "1px solid #e0e0e0",
    },
    td: {
        padding: "12px 10px",
        fontSize: "14px",
        borderBottom: "1px solid #f0f0f0",
    },
};


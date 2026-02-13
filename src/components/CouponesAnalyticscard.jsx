import React from 'react'

export default function CouponesAnalyticscard({ code, used, onClick }) {
    return (
        <div style={styles.card} onClick={onClick}>
            <div style={styles.topRow}>
                <h2 style={styles.code}>{code}</h2>
                <span style={styles.used}>Used: {used}</span>
            </div>
            <p style={styles.linkText}>Click to see orders and user details</p>
        </div>
    );
}


const styles = {
    card: {
        background: "#fff",
        borderRadius: "14px",
        padding: "18px 22px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    code: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "700",
    },
    used: {
        fontSize: "14px",
        color: "#555",
        fontWeight: "500",
    },
    linkText: {
        margin: 0,
        fontSize: "14px",
        color: "#8a8a8a",
    },
};

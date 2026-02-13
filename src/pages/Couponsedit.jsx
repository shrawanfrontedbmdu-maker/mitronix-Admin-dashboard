import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { couponsService } from "../api/couponsService.js"
export default function Couponsedit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setloading] = useState(false);
    const [existData, setExistdata] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        startDate: "",
        expiryDate: "",
        totalUsage: "",
        perCustomerLimit: "",
        visibility: "public",
        platform: "both",
        firstPurchaseOnly: false,
    });
    const [errors, setErrors] = useState({});

    const toLocalDatetime = (utcDate) => {
        const d = new Date(utcDate);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.title.trim()) newErrors.title = "Title is required";

        if (!formData.code.trim()) {
            newErrors.code = "Coupon code is required";
        } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
            newErrors.code = "Code must be uppercase letters & numbers only";
        }

        if (formData.code.length < 5 || formData.code.length > 16) {
            newErrors.code = "Coupon code must be 5–16 characters";
        }


        if (!formData.discountValue || formData.discountValue <= 0)
            newErrors.discountValue = "Enter valid discount value";

        if (formData.discountType === "percentage" && formData.discountValue > 100)
            newErrors.discountValue = "Percentage cannot be more than 100";

        if (!formData.minOrderValue || formData.minOrderValue < 0)
            newErrors.minOrderValue = "Enter valid minimum order value";

        if (formData.maxDiscount && formData.maxDiscount < 0)
            newErrors.maxDiscount = "Max discount cannot be negative";

        if (!formData.startDate) newErrors.startDate = "Start date required";
        if (!formData.expiryDate) newErrors.expiryDate = "Expiry date required";

        if (formData.startDate && formData.expiryDate && formData.startDate >= formData.expiryDate)
            newErrors.expiryDate = "Expiry must be after start date";

        if (!formData.totalUsage || formData.totalUsage <= 0)
            newErrors.totalUsage = "Enter valid total usage limit";

        if (!formData.perCustomerLimit || formData.perCustomerLimit <= 0)
            newErrors.perCustomerLimit = "Enter valid per customer limit";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === "checkbox" ? checked : value;

        if (name === "code") newValue = newValue.toUpperCase();

        setFormData(prev => ({ ...prev, [name]: newValue }));

        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        try {
            setloading(true);
            const res = await couponsService.updateCoupon(id, formData);
            alert(" Coupon Updated successfully!");
            navigate("/coupons/list")
        } catch (error) {
            console.error("Coupon creation error:", error);
            alert(error.message || " Failed to create coupon");
        } finally {
            setloading(false);
        }
    };
    useEffect(() => {
        loaddata()
    }, [])

    const loaddata = async () => {
        setloading(true);
        setErrors({});

        try {
            if (!id) return;

            const response = await couponsService.getCouponById(id);
            const coupon = response?.data;

            if (coupon) {
                setExistdata(coupon);

                setFormData({
                    title: coupon.title || "",
                    code: coupon.code || "",
                    description: coupon.description || "",
                    discountType: coupon.discountType || "percentage",
                    discountValue: coupon.discountValue ?? "",
                    minOrderValue: coupon.minOrderValue ?? "",
                    maxDiscount: coupon.maxDiscount ?? "",
                    startDate: coupon.startDate ? toLocalDatetime(coupon.startDate) : "",
                    expiryDate: coupon.expiryDate ? toLocalDatetime(coupon.expiryDate) : "",
                    totalUsage: coupon.totalUsage ?? "",
                    perCustomerLimit: coupon.perCustomerLimit ?? "",
                    visibility: coupon.visibility || "public",
                    platform: coupon.platform || "both",
                    firstPurchaseOnly: coupon.firstPurchaseOnly ?? false,
                });
            }

        } catch (error) {
            setErrors({ api: error.message || "Failed to fetch coupon" });
            console.log(error);
        } finally {
            setloading(false);
        }
    };

    return (
        <>
            <div className="content-card">
                <div
                    className="section-header"
                    style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        padding: "12px 0",
                        borderBottom: "2px solid #eee"
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: "600",
                            color: "#333",
                            letterSpacing: "0.5px"
                        }}
                    >
                        Edit Coupon
                    </h3>
                </div>

                <form className="form-container" onSubmit={handleSubmit}>
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "16px",
                        }}
                    >
                        <h4
                            style={{
                                margin: 0,
                                display: "inline-block",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                fontWeight: 500,
                                letterSpacing: "0.3px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                            }}
                        >
                            Editing Coupon:{" "}
                            <strong style={{ fontWeight: 700 }}>{formData.code}</strong>
                        </h4>
                    </div>


                    <div className="form-grid">
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={errors.title ? "input-error" : ""}
                                placeholder="Festive Offer"
                            />
                            {errors.title && <span className="error-text">{errors.title}</span>}
                        </div>


                        <div className="form-group">
                            <label>Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={errors.code ? "input-error" : ""}
                                placeholder="FLAT10"
                            />
                            {errors.code && <span className="error-text">{errors.code}</span>}
                        </div>
                        <div className="form-group">
                            <label>Discount Type</label>
                            <select name="discountType" onChange={handleChange}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Discount Value</label>
                            <input type="number" name="discountValue" value={formData.discountValue} placeholder="e.g., 10 for 10%" onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Minimum Order Value</label>
                            <input
                                type="number"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                className={errors.minOrderValue ? "input-error" : ""}
                            />
                            {errors.minOrderValue && <span className="error-text">{errors.minOrderValue}</span>}
                        </div>


                        <div className="form-group">
                            <label>Max Discount (Optional)</label>
                            <input type="number" name="maxDiscount" value={formData.maxDiscount} placeholder="e.g. 500" onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={errors.startDate ? "input-error" : ""}
                            />
                            {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Expiry Date & Time</label>
                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className={errors.expiryDate ? "input-error" : ""}
                            />
                            {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Total Usage Limit</label>
                            <input type="number" name="totalUsage" placeholder="e.g., 100" value={formData.totalUsage} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Usage Per Customer</label>
                            <input type="number" name="perCustomerLimit" placeholder="e.g., 1" value={formData.perCustomerLimit} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea type="text" name="description" value={formData.description} placeholder="e.g., about offer discription" onChange={handleChange} rows={2} />
                        </div>

                        <div className="form-group">
                            <label>Visibility</label>
                            <select name="visibility" onChange={handleChange} value={formData.visibility}>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Platform</label>
                            <select name="platform" onChange={handleChange} value={formData.platform}>
                                <option value="web">Web</option>
                                <option value="app">App</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label className="checkbox-label">
                                <input type="checkbox" name="firstPurchaseOnly" onChange={handleChange} value={formData.firstPurchaseOnly} />
                                <span className="checkbox-text">Only for first purchase</span>
                            </label>
                        </div>

                    </div>
                    <div className="page-actions" style={{ marginTop: "20px" }}>
                        <button type="submit" className="btn btn-primary">{loading ? "Update Coupon..." : "Update Coupon"}</button>
                        <button type="button" className="btn" onClick={() => { navigate(-1) }}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    )
}

import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { couponsService } from "../api/couponsService.js"
export default function CouponsAdd() {
  const navigate = useNavigate();
  const [loading, setloading] = useState(false);
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
      setErrors({});

      const res = await couponsService.createCoupon(formData);

      alert("Coupon created successfully!");
      console.log("Created coupon:", res);

      navigate("/coupons/list");

    } catch (error) {
      console.error("Coupon creation error:", error);
      setErrors({ api: error.response?.data?.message || error.message });
      alert(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setloading(false);
    }
  };


  if (loading) return <div>Loading...</div>

  return (
    <>
      <div className="page-header">
        <div className="section-header">
          <h3>Create New Coupon</h3>
        </div>
      </div>
      <div className="content-card">
        <div className="error">
          <p>{errors ? errors.message : null}</p>
        </div>
        <form className="form-container" onSubmit={handleSubmit}>
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
              <input type="number" name="discountValue" placeholder="e.g., 10 for 10%" onChange={handleChange} />
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
              <input type="number" name="maxDiscount" placeholder="e.g. 500" onChange={handleChange} />
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
              <input type="number" name="totalUsage" placeholder="e.g., 100" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Usage Per Customer</label>
              <input type="number" name="perCustomerLimit" placeholder="e.g., 1" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea type="text" name="discription" placeholder="e.g., about offer discription" onChange={handleChange} rows={2} />
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <select name="visibility" onChange={handleChange}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label>Platform</label>
              <select name="platform" onChange={handleChange}>
                <option value="web">Web</option>
                <option value="app">App</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input type="checkbox" name="firstPurchaseOnly" onChange={handleChange} />
                <span className="checkbox-text">Only for first purchase</span>
              </label>
            </div>

          </div>
          <div className="page-actions" style={{ marginTop: "20px" }}>
            <button type="submit" className="btn btn-primary">{loading ? "Creating Coupon..." : "Create Coupon"}</button>
            <button type="button" className="btn" onClick={() => { navigate(-1) }}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}

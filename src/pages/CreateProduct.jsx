import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdCloudUpload, MdClose, MdSave, MdArrowBack } from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

const BACKEND_URL = "https://miltronix-backend-1.onrender.com";

function CreateProduct() {
  const navigate = useNavigate();

  const initialFormState = {
    name: "",
    slug: "",
    category: "",
    sku: "",
    price: "",
    mrp: "",
    discountPrice: "",
    stockQuantity: 0,
    stockStatus: "in-stock",
    description: "",
    specification: "",
    variants: [{ color: "", size: "", price: "", stock: "", sku: "" }],
    brand: "",
    tags: "",
    warranty: "",
    returnPolicy: "",
    barcode: "",
    hsnCode: "",
    productKey: "",
    supplier: { name: "", contact: "", email: "" },
    shipping: { charges: "", deliveryTime: "", restrictions: "" },
    weight: "",
    dimensions: "",
    resolution: "",
    screenSize: "",
    isActive: true,
    status: "Active",
    isRecommended: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [priceValidationMessage, setPriceValidationMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        const categoryList = res.data || res;
        setCategories(categoryList);
        if (categoryList.length > 0) {
          setFormData((prev) => ({ ...prev, category: categoryList[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please create categories first.");
      }
    };
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setError("");
    setSuccess("");
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const validatePricing = (price, mrp) => {
    if (price && mrp && parseFloat(price) > parseFloat(mrp)) {
      setPriceValidationMessage("⚠️ Selling price cannot be higher than MRP");
    } else {
      setPriceValidationMessage("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return { ...prev, [parent]: { ...prev[parent], [child]: val } };
      }

      const newData = { ...prev, [name]: val };
      if (name === "name") newData.slug = generateSlug(val);
      if (name === "price" || name === "mrp") {
        const currentPrice = name === "price" ? val : newData.price;
        const currentMrp = name === "mrp" ? val : newData.mrp;
        validatePricing(currentPrice, currentMrp);
      }
      return newData;
    });
  };

  // ================= VARIANT FUNCTIONS =================
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: "", size: "", price: "", stock: "", sku: "" },
      ],
    }));
  };

  const removeVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  // ================= IMAGE FUNCTIONS =================
  const handleImageUpload = (files) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxImages = 5; // 🔥 change here
    const remaining = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    const validFiles = filesToProcess.filter((file) => {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid type: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFileSelect = (e) => handleImageUpload(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  // ================= SUBMIT =================
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    // Required fields check
    if (
      !formData.name ||
      (!formData.price && formData.variants.length === 0) ||
      !formData.description ||
      !formData.category ||
      !formData.brand ||
      !formData.warranty ||
      !formData.returnPolicy ||
      !formData.hsnCode
    ) {
      setError("Please fill all required fields");
      return;
    }

    // Price validations
    if (formData.price && parseFloat(formData.price) <= 0) {
      setError("Selling price must be greater than 0");
      return;
    }

    if (
      formData.mrp &&
      formData.price &&
      parseFloat(formData.price) > parseFloat(formData.mrp)
    ) {
      setError("Selling price cannot be higher than MRP");
      return;
    }

    if (formData.stockQuantity && parseInt(formData.stockQuantity) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    // HSN code validation
    if (!/^\d{2}(\d{2})?(\d{2})?$/.test(formData.hsnCode)) {
      setError("HSN must be 2, 4, or 6 digits");
      return;
    }

    if (images.length === 0) {
      setError("Upload at least one product image");
      return;
    }

    setLoading(true);

    const slug = generateSlug(formData.name);
    const productKey = formData.productKey || slug + "-" + Date.now();

    // Filter empty variants
    const cleanedVariants = formData.variants.filter(
      (v) => v.color || v.size || v.price || v.stock
    );

    // Generate SKU for main product if no variants
    const mainProductSKU =
      cleanedVariants.length === 0
        ? `${productKey}-main-${Date.now()}`
        : undefined;

    const productData = {
      ...formData,
      slug,
      productKey,
      sku: mainProductSKU, // <-- main product SKU
      sellingPrice:
        cleanedVariants.length === 0 && formData.price
          ? parseFloat(formData.price)
          : undefined,
      mrp:
        cleanedVariants.length === 0 && formData.mrp
          ? parseFloat(formData.mrp)
          : undefined,
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : undefined,
      variants: cleanedVariants.map((v) => ({
        color: v.color,
        size: v.size,
        price: v.price ? parseFloat(v.price) : 0,
        stock: v.stock ? parseInt(v.stock) : 0,
        sku:
          v.sku ||
          `${productKey}-${v.color || "NA"}-${v.size || "NA"}-${Date.now()}`,
      })),
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim())
        : [],
      images: images.map((img) => img.file),
      weight: formData.weight || "",
      dimensions: formData.dimensions || "",
      resolution: formData.resolution || "",
      screenSize: formData.screenSize ? parseFloat(formData.screenSize) : undefined,
      supplier: [formData.supplier],
      shipping: [formData.shipping],
      status: formData.isActive ? "active" : "inactive",
      isRecommended: !!formData.isRecommended,
    };

    console.log("Submitting product data:", productData);

    const result = await productService.createProduct(productData);
    setSuccess("Product created successfully!");
    console.log("Backend response:", result);

    images.forEach((img) => URL.revokeObjectURL(img.preview));
    resetForm();
    setTimeout(() => navigate("/products/grid"), 1500);
  } catch (err) {
    console.error("Submit error:", err);
    setError(err.response?.message || err.message || "Failed to create product");
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Create Product</h1>
          <p className="page-subtitle">Add a new product to your inventory</p>
        </div>
        <div className="page-actions">
          <Link to="/products/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to List
          </Link>
        </div>
      </div>
      <div className="form-container">
        {error && (
          <div
            className="error-message"
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="success-message"
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{success}</span>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/products/list")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#166534",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                View Products
              </button>
              <button
                type="button"
                onClick={() => setSuccess("")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="product-form"
          style={{ position: "relative" }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 10px",
                  }}
                ></div>
                <div>Creating product...</div>
              </div>
            </div>
          )}
          <div className="form-grid">
            <div className="form-section">
              <div className="content-card">
                <h3>Product Images</h3>
                <div className="image-upload-section">
                  <div
                    className={`image-upload-area ${dragOver ? "dragover" : ""}`}
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="upload-icon">
                      <MdCloudUpload />
                    </div>
                    <div className="upload-text">
                      Drop your images here, or click to browse
                    </div>
                    <div className="upload-hint">
                      PNG, JPG, GIF and WebP files are allowed (Max 5 images,
                      5MB each)
                      {images.length > 0 && (
                        <div style={{ marginTop: "4px", fontWeight: "bold" }}>
                          {images.length}/5 images selected
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden-file-input"
                  />

                  {images.length > 0 && (
                    <div className="image-preview-grid">
                      {images.map((image) => (
                        <div key={image.id} className="image-preview-item">
                          <img
                            src={image.preview}
                            alt="Product preview"
                            className="image-preview"
                          />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => removeImage(image.id)}
                          >
                            <MdClose />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="content-card">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">URL Slug *</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="product-url-slug"
                    disabled={loading}
                  />
                  <small className="form-hint">
                    URL-friendly version of the product name. Automatically
                    generated from product name.
                  </small>
                </div>

                {/* <div className="form-group">
                  <label htmlFor="sku">SKU / Product Code *</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Enter unique product SKU"
                    required
                  />
                  <small className="form-hint">
                    Unique identifier for this product
                  </small>
                </div> */}

                <div className="form-group">
                  <label htmlFor="brand">Brand / Manufacturer</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter product brand"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>

                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.pageTitle ||
                            category.title ||
                            category.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories found</option>
                    )}
                  </select>

                  {(!categories || categories.length === 0) && (
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No categories available. Please create categories first.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="stockStatus">Stock Status</label>
                  <select
                    id="stockStatus"
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleInputChange}
                  >
                    <option key="in-stock" value="in-stock">
                      In Stock
                    </option>
                    <option key="out-of-stock" value="out-of-stock">
                      Out of Stock
                    </option>
                  </select>
                </div>

                <div className="content-card">
                  <h3>Product Variants</h3>

                  {formData.variants.map((variant, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ddd",
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="form-row">
                        <div className="form-group">
                          <label>Color</label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "color",
                                e.target.value,
                              )
                            }
                            placeholder="Red"
                          />
                        </div>

                        <div className="form-group">
                          <label>Size</label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(index, "size", e.target.value)
                            }
                            placeholder="M / L / XL"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Variant Price</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            placeholder="Enter price"
                          />
                        </div>

                        <div className="form-group">
                          <label>Variant Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "stock",
                                e.target.value,
                              )
                            }
                            placeholder="Stock qty"
                          />
                        </div>

                        <div className="form-group">
                          <label>Variant SKU *</label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(index, "sku", e.target.value)
                            }
                            placeholder="Enter variant SKU"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Remove Variant
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVariant}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Variant
                  </button>
                </div>
              </div>

              <div className="content-card">
                <h3>Pricing & Inventory</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mrp">MRP (Maximum Retail Price)</label>
                    <input
                      type="number"
                      id="mrp"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Selling Price *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      style={{
                        borderColor: priceValidationMessage
                          ? "#dc2626"
                          : undefined,
                      }}
                    />
                    {priceValidationMessage && (
                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "14px",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {priceValidationMessage}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="discountPrice">
                      Discount / Offer Price
                    </label>
                    <input
                      type="number"
                      id="discountPrice"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <small className="form-hint">
                      Special promotional price (if different from selling
                      price)
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="content-card">
                <h3>Description</h3>
                <div className="form-group">
                  <label htmlFor="description">Product Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>

              <div className="content-card">
                <h3>Specifications</h3>
                <div className="form-group">
                  <label htmlFor="specification">Product Specifications</label>
                  <textarea
                    id="specification"
                    name="specification"
                    value={formData.specification}
                    onChange={handleInputChange}
                    rows="8"
                    placeholder="Enter specifications..."
                  />
                </div>
              </div>

              <div className="content-card">
                <h3>Physical Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="weight">Weight</label>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.5 kg"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dimensions">Dimensions</label>
                    <input
                      type="text"
                      id="dimensions"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 30 x 20 x 15 cm"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="productKey">Product Key *</label>
                <input
                  type="text"
                  id="productKey"
                  name="productKey"
                  value={formData.productKey}
                  onChange={handleInputChange}
                  placeholder="Enter unique product key"
                  required
                  disabled={loading}
                />
                <small className="form-hint">
                  Unique identifier for recommendations or internal use
                </small>
              </div>

              <div className="content-card">
                <h3>Warranty & Returns</h3>
                <div className="form-group">
                  <label htmlFor="warranty">
                    Warranty / Guarantee Information
                  </label>
                  <textarea
                    id="warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g., 1 year manufacturer warranty + 2 years extended warranty available"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="returnPolicy">
                    Return Policy Information
                  </label>
                  <textarea
                    id="returnPolicy"
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g., 30 days return policy. Product must be in original condition."
                  />
                </div>
              </div>

              <div className="content-card">
                <h3>Advanced (for eCommerce)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="barcode">Barcode / QR Code</label>
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Enter barcode or QR code"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="hsnCode">HSN / GST Code</label>
                    <input
                      type="text"
                      id="hsnCode"
                      name="hsnCode"
                      value={formData.hsnCode}
                      onChange={handleInputChange}
                      placeholder="Enter HSN code"
                    />
                  </div>
                </div>
              </div>

              <div className="content-card">
                <h3>Supplier / Vendor Details</h3>
                <div className="form-group">
                  <label htmlFor="supplier.name">Supplier Name</label>
                  <input
                    type="text"
                    id="supplier.name"
                    name="supplier.name"
                    value={formData.supplier.name}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="supplier.contact">Supplier Contact</label>
                    <input
                      type="text"
                      id="supplier.contact"
                      name="supplier.contact"
                      value={formData.supplier.contact}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="supplier.email">Supplier Email</label>
                    <input
                      type="email"
                      id="supplier.email"
                      name="supplier.email"
                      value={formData.supplier.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              <div className="content-card">
                <h3>Shipping Information</h3>
                <div className="form-group">
                  <label htmlFor="shipping.charges">Shipping Charges</label>
                  <input
                    type="text"
                    id="shipping.charges"
                    name="shipping.charges"
                    value={formData.shipping.charges}
                    onChange={handleInputChange}
                    placeholder="e.g., Free delivery, ₹50, etc."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shipping.deliveryTime">Delivery Time</label>
                    <input
                      type="text"
                      id="shipping.deliveryTime"
                      name="shipping.deliveryTime"
                      value={formData.shipping.deliveryTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-5 business days"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shipping.restrictions">
                      Shipping Restrictions
                    </label>
                    <input
                      type="text"
                      id="shipping.restrictions"
                      name="shipping.restrictions"
                      value={formData.shipping.restrictions}
                      onChange={handleInputChange}
                      placeholder="e.g., No cash on delivery"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add inside the second form-section or wherever suitable */}
          <div className="content-card">
            <h3>Additional Product Details</h3>

            <div className="form-group">
              <label htmlFor="resolution">Resolution</label>
              <input
                type="text"
                id="resolution"
                name="resolution"
                value={formData.resolution}
                onChange={handleInputChange}
                placeholder="e.g., HD, Full-HD, 4K"
              />
            </div>

            <div className="form-group">
              <label htmlFor="screenSize">Screen Size</label>
              <input
                type="number"
                id="screenSize"
                name="screenSize"
                value={formData.screenSize}
                onChange={handleInputChange}
                placeholder="Enter screen size in inches"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Product Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter comma-separated tags for SEO"
              />
              <small className="form-hint">
                Example: electronics, smart-tv, 4k
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="isRecommended">
                <input
                  type="checkbox"
                  id="isRecommended"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleInputChange}
                />
                Mark as Recommended
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <MdSave size={16} />
              {loading ? "Creating..." : "Create Product"}
            </button>
            <Link to="/products/list" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;

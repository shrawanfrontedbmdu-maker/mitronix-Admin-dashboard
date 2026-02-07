import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdCloudUpload, MdClose, MdSave, MdArrowBack } from "react-icons/md";
import { productService } from "../api/productService.js";
import { categoryService } from "../api/categoryService.js";

const BACKEND_URL = "https://miltronix-backend-1.onrender.com";

function CreateProduct() {
  const navigate = useNavigate();

  const [productCode, setProductcode] = useState([]);
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
    colour: "",
    size: "",
    variants: "",
    brand: "",
    weight: "",
    dimensions: "",
    tags: "",
    warranty: "",
    returnPolicy: "",
    barcode: "",
    supplier: {
      name: "",
      contact: "",
      email: "",
    },
    hsnCode: "",
    shipping: {
      charges: "",
      deliveryTime: "",
      restrictions: "",
    },
    isActive: true,
    status: "Active",
    isRecommended: false,
    resolution: "",
    screenSize: "",
    productKey: "",
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

        console.log("Categories API Response:", res); // debug

        // ✅ handle both response types
        const categoryList = res.data || res;

        setCategories(categoryList);

        if (categoryList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: categoryList[0]._id,
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(
          "Failed to load categories. Please try creating some categories first.",
        );
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

  // Function to validate pricing
  const validatePricing = (price, mrp) => {
    if (price && mrp && parseFloat(price) > parseFloat(mrp)) {
      setPriceValidationMessage("⚠️ Selling price cannot be higher than MRP");
    } else {
      setPriceValidationMessage("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Handle nested objects (supplier, shipping)
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
        return newData;
      }

      const newData = {
        ...prev,
        [name]: value,
      };

      if (name === "name") {
        newData.slug = generateSlug(value);
      }

      // Real-time price validation
      if (name === "price" || name === "mrp") {
        const currentPrice = name === "price" ? value : newData.price;
        const currentMrp = name === "mrp" ? value : newData.mrp;
        validatePricing(currentPrice, currentMrp);
      }

      return newData;
    });
  };

  const handleImageUpload = (files) => {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const currentImageCount = images.length;
    const maxImages = 6;

    if (currentImageCount >= maxImages) {
      setError(
        `Maximum ${maxImages} images allowed. Please remove some images first.`,
      );
      return;
    }

    const remainingSlots = maxImages - currentImageCount;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more images can be added (${maxImages} total allowed).`,
      );
    }

    const validFiles = filesToProcess.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        setError(
          `Invalid file type: ${file.name}. Please upload only JPG, PNG, GIF, or WebP images.`,
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(
          `File too large: ${file.name}. Please upload images smaller than 5MB.`,
        );
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

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
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
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ===== BASIC VALIDATIONS =====
    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      !formData.category ||
      !formData.sku ||
      !formData.brand ||
      !formData.colour ||
      !formData.warranty ||
      !formData.returnPolicy ||
      !formData.hsnCode
    ) {
      setError(
        "Please fill in all required fields (Name, SKU, Price, Description, Category, Brand, Colour, Warranty, Return Policy, HSN Code)",
      );
      return;
    }

    // SKU numeric check
    if (isNaN(formData.sku)) {
      setError("SKU must be a number");
      return;
    }

    // Slug and Product Key
    const slug = generateSlug(formData.name);
    const productKey = slug + "-" + Date.now(); // unique key

    // Price validations
    if (parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (formData.mrp && parseFloat(formData.price) > parseFloat(formData.mrp)) {
      setError("Selling price cannot be higher than MRP");
      return;
    }

    if (
      formData.discountPrice &&
      parseFloat(formData.discountPrice) > parseFloat(formData.price)
    ) {
      setError("Discount price cannot be more than selling price");
      return;
    }

    // Stock Quantity
    if (formData.stockQuantity && parseInt(formData.stockQuantity) < 0) {
      setError("Stock quantity cannot be negative");
      return;
    }

    // Supplier validation
    if (
      !formData.supplier.name ||
      formData.supplier.name.length < 3 ||
      !formData.supplier.contact ||
      !/^[6-9]\d{9}$/.test(formData.supplier.contact) ||
      !formData.supplier.email ||
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.supplier.email)
    ) {
      setError(
        "Please enter valid supplier details (name, 10-digit number, Gmail email)",
      );
      return;
    }

    // Shipping validation
    if (
      !formData.shipping.charges ||
      !formData.shipping.deliveryTime ||
      !formData.shipping.restrictions ||
      isNaN(formData.shipping.charges) ||
      formData.shipping.charges < 0
    ) {
      setError("Please enter valid shipping details");
      return;
    }

    // HSN Code
    if (!/^\d{2}(\d{2})?(\d{2})?$/.test(formData.hsnCode)) {
      setError("HSN must be 2, 4, or 6 digits");
      return;
    }

    // Images check
    if (images.length === 0) {
      setError("Please upload at least one product image");
      return;
    }

    // ===== BUILD PRODUCT DATA OBJECT =====
    const productData = {
      ...formData,
      slug,
      productKey,
      sellingPrice: parseFloat(formData.price),
      mrp: formData.mrp ? parseFloat(formData.mrp) : null,
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : null,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      supplier: { ...formData.supplier },
      shipping: { ...formData.shipping },
      variants: formData.variants
        ? formData.variants.split(",").map((v) => v.trim())
        : [],
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      images: images.map((img) => img.file),
      status: formData.status.toLowerCase(),
      isRecommended: !!formData.isRecommended,
      isActive: !!formData.isActive,
    };

    console.log("Submitting product data:", {
      ...productData,
      images: `${productData.images.length} images`,
    });

    setLoading(true);

    try {
      const result = await productService.createProduct(productData);

      console.log("Product creation result:", result);

      setSuccess("Product created successfully!");
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      resetForm();

      setTimeout(() => navigate("/products/grid"), 1500);
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
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

                <div className="form-group">
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
                </div>

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

                <div className="form-group">
                  <label htmlFor="colour">Color</label>
                  <input
                    type="text"
                    id="colour"
                    name="colour"
                    value={formData.colour}
                    onChange={handleInputChange}
                    placeholder="Enter product color"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="Enter product size"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="variants">Color / Size / Variants</label>
                  <input
                    type="text"
                    id="variants"
                    name="variants"
                    value={formData.variants}
                    onChange={handleInputChange}
                    placeholder="e.g., Red, Blue, Green OR S, M, L, XL"
                  />
                  <small className="form-hint">
                    Separate multiple variants with commas
                  </small>
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

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSave, MdDelete, MdClose } from 'react-icons/md';
// Mock services - replace with your actual API calls
import { productService } from '../api/productService.js';
import { categoryService } from '../api/categoryService.js';

/**
 * A component to edit product details, including managing multiple product images.
 */
function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main state for all form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: '',
    cost: '',
    mrp: '',
    sku: '',
    stockQuantity: '',
    stockStatus: 'InStock',
    description: '',
    specification: '',
    colour: '',
    brand: '',
    isActive: true,
    existingImages: [], // Holds URLs of images already on the server
    imagesToDelete: [],  // Tracks URLs of existing images marked for deletion
    newImageFiles: [],   // Holds new image File objects for upload
  });

  // State specifically for showing previews of new images
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial product and category data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Assuming these services fetch all data, then we find the specific product
        const [products, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories()
        ]);

        const product = products.find(p => p._id === id);
        console.log(product);
        if (product) {
          // Populate form with data from the fetched product
          setFormData(prev => ({
            ...prev,
            name: product.name || '',
            slug: product.slug || '',
            category: product.categories || '',
            price: product.price || '',
            mrp: product.mrp || '',
            cost: product.cost || '',
            sku: product.sku || '',
            stockQuantity: product.stockQuantity || '',
            stockStatus: product.stockStatus || 'InStock',
            description: product.description || '',
            specification: product.specification || '',
            colour: product.colour || '',
            brand: product.brand || '',
            isActive: product.isActive !== undefined ? product.isActive : true,
            // Assuming the product object has an 'images' array of URLs
            existingImages: product.images || [],
          }));
        } else {
          setError('Product not found');
        }
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Cleanup effect to revoke object URLs and prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Generates a URL-friendly slug from a string
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  };

  // Handles changes for all form inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const fileArray = Array.from(files);
      // Add new files to the state
      setFormData(prev => ({
        ...prev,
        newImageFiles: [...prev.newImageFiles, ...fileArray]
      }));
      // Create and add new preview URLs
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } else {
      // Handle standard text inputs, selects, and checkboxes
      setFormData(prev => {
        const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
        // Auto-generate slug when the name changes
        if (name === 'name') {
          newData.slug = generateSlug(value);
        }
        return newData;
      });
    }
  };

  // Marks an existing image for deletion upon form submission
  const handleDeleteExistingImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      // Remove from the display list
      existingImages: prev.existingImages.filter(img => img !== imageUrl),
      // Add to the deletion list
      imagesToDelete: [...prev.imagesToDelete, imageUrl]
    }));
  };

  // Removes a newly selected image from the upload queue before submission
  const handleRemoveNewImage = (index) => {
    // Revoke the specific object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    // Remove the file and its preview
    setFormData(prev => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handles the main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price || !formData.category) {
      setError('Please fill in all required fields (Name, Price, Category).');
      return;
    }

    if (formData.mrp && parseFloat(formData.price) > parseFloat(formData.mrp)) {
      setError('Selling price cannot be higher than MRP');
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();

      // Append all standard form fields
      Object.keys(formData).forEach(key => {
        if (!['newImageFiles', 'existingImages', 'imagesToDelete'].includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append the list of images to delete (as a JSON string for easy parsing on the backend)
      formDataToSend.append('imagesToDelete', JSON.stringify(formData.imagesToDelete));

      // Append each new image file
      formData.newImageFiles.forEach(file => {
        formDataToSend.append('newImages', file); // Backend will receive an array of files under 'newImages'
      });

      // Your API service must be configured to handle FormData
      await productService.updateProduct(id, formDataToSend);

      alert('Product updated successfully!');
      navigate(`/products/details/${id}`);

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handles the product deletion action
  const handleDeleteProduct = () => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      // productService.deleteProduct(id)...
      console.log('Deleting product:', id);
      navigate('/products/list');
    }
  };

  if (loading) return <div>Loading product...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update product information and images</p>
        </div>
        <div className="page-actions">
          <Link to={`/products/details/${id}`} className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Details
          </Link>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-section">
              <div className="content-card">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">URL Slug *</label>
                  <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="sku">SKU *</label>
                  <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="content-card">
                <h3>Pricing & Inventory</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mrp">MRP (Maximum Retail Price)</label>
                    <input type="number" id="mrp" name="mrp" value={formData.mrp} onChange={handleInputChange} min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Selling Price *</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} min="0" step="0.01" required placeholder="0.00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cost">Cost Price</label>
                    <input type="number" id="cost" name="cost" value={formData.cost} onChange={handleInputChange} min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <input type="number" id="stockQuantity" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} min="0" />
                  </div>
                </div>
              </div>

              <div className="content-card">
                <h3>Product Images</h3>
                <div className="form-group">
                  <label>Existing Images</label>
                  <div className="image-preview-grid">
                    {formData.existingImages.map((imageUrl) => (
                      <div key={imageUrl._id} className="image-preview-item">
                        <img src={imageUrl.url} alt="Existing product" />
                        <button type="button" className="delete-image-btn" onClick={() => handleDeleteExistingImage(imageUrl)}>
                          <MdClose />
                        </button>
                      </div>
                    ))}
                  </div>
                  {formData.existingImages.length === 0 && <small>No existing images.</small>}
                </div>

                {imagePreviews.length > 0 && (
                  <div className="form-group">
                    <label>New Images to Upload</label>
                    <div className="image-preview-grid">
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={previewUrl} className="image-preview-item">
                          <img src={previewUrl} alt={`New preview ${index + 1}`} />
                          <button type="button" className="delete-image-btn" onClick={() => handleRemoveNewImage(index)}>
                            <MdClose />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="newImageFiles">Add New Images</label>
                  <input type="file" id="newImageFiles" name="newImageFiles" multiple onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-section">
              <div className="content-card">
                <h3>Description</h3>
                <div className="form-group">
                  <label htmlFor="description">Product Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="6" />
                </div>
              </div>
              <div className="content-card">
                <h3>Specifications</h3>
                <div className="form-group">
                  <label htmlFor="specification">Product Specifications</label>
                  <textarea id="specification" name="specification" value={formData.specification} onChange={handleInputChange} rows="8" />
                </div>
              </div>
              <div className="content-card danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete a product, this action cannot be undone. Please be certain.</p>
                <button type="button" onClick={handleDeleteProduct} className="btn btn-danger">
                  <MdDelete size={16} />
                  Delete Product
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <MdSave size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to={`/products/details/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Basic styling for the image management UI */}
      <style>{`
        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .image-preview-item {
          position: relative;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
        }
        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .delete-image-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background-color 0.2s;
        }
        .delete-image-btn:hover {
          background: rgba(255, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}

export default ProductEdit;

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    MdSave,
    MdCancel,
    MdArrowBack,
    MdDrafts,
    MdPublish,
    MdClose,
    MdAdd
} from 'react-icons/md';
import blogService from '../api/blogService';

function BlogEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Technology',
        tags: [],
        featuredImage: { url: '', alt: '' },
        status: 'draft',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        isCommentEnabled: true,
        isFeatured: false
    });

    const [newTag, setNewTag] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        if (id) {
            loadBlog();
        }
    }, [id]);

    const loadBlog = async () => {
        try {
            setFetchLoading(true);
            setError('');
            const data = await blogService.getById(id);

            // 🟢 Extract ONLY TEXT blocks for textarea
            const textContent = data.contentBlocks
                ?.filter(block => block.type === "text" && block.content)
                .map(block => block.content)
                .join("\n\n") || '';

            setFormData({
                title: data.title || '',
                excerpt: data.excerpt || '',
                content: textContent, // ✅ textarea me show hoga
                category: data.category || 'Technology',
                tags: data.tags || [],
                featuredImage: {
                    url: data.featuredImage?.url || '',
                    alt: data.featuredImage?.alt || ''
                },
                status: data.status || 'draft',
                seoTitle: data.seoTitle || '',
                seoDescription: data.seoDescription || '',
                seoKeywords: data.seoKeywords || [],
                isCommentEnabled: data.isCommentEnabled ?? true,
                isFeatured: data.isFeatured || false
            });

        } catch (error) {
            setError(error.message || 'Failed to load blog');
        } finally {
            setFetchLoading(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !formData.seoKeywords.includes(newKeyword.trim())) {
            setFormData(prev => ({
                ...prev,
                seoKeywords: [...prev.seoKeywords, newKeyword.trim()]
            }));
            setNewKeyword('');
        }
    };

    const removeKeyword = (keywordToRemove) => {
        setFormData(prev => ({
            ...prev,
            seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
        }));
    };

    const handleSubmit = async (e, status = null) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
            setError('Title, excerpt, and content are required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const contentBlocks = [
                {
                    type: "text",
                    content: formData.content,
                    order: 0
                }
            ];

            const submitData = {
                title: formData.title,
                excerpt: formData.excerpt,
                category: formData.category,
                tags: formData.tags,
                status: status || formData.status,
                contentBlocks, 
                featuredImage: formData.featuredImage.url,
                featuredImageAlt: formData.featuredImage.alt,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                seoKeywords: formData.seoKeywords,
                isCommentEnabled: formData.isCommentEnabled,
                isFeatured: formData.isFeatured
            };

            await blogService.update(id, submitData);
            navigate(`/blogs/${id}`);

        } catch (error) {
            setError(error.message || 'Failed to update blog');
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => {
        navigate(`/blogs/${id}`);
    };

    if (fetchLoading) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Blog</h1>
                        <p className="page-subtitle">Loading...</p>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading blog details...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Blog</h1>
                        <p className="page-subtitle">Error loading data</p>
                    </div>
                    <div className="page-actions">
                        <Link to="/blogs" className="btn btn-secondary">
                            <MdArrowBack size={16} />
                            Back to Blogs
                        </Link>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#dc2626', marginBottom: '20px' }}>
                        ❌ {error}
                    </p>
                    <Link to="/blogs" className="btn btn-primary">
                        Back to Blogs List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Edit Blog</h1>
                    <p className="page-subtitle">{formData.title}</p>
                </div>
                <div className="page-actions">
                    <Link to={`/blogs/${id}`} className="btn btn-secondary">
                        <MdArrowBack size={16} />
                        Back to Details
                    </Link>
                </div>
            </div>

            <div className="content-card">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e)} className="form-layout">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label htmlFor="title">Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter blog title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="excerpt">Excerpt *</label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                placeholder="Brief description of the blog (max 300 characters)"
                                maxLength={300}
                                rows={3}
                                required
                            />
                            <small>{formData.excerpt.length}/300 characters</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Technology">Technology</option>
                                    <option value="Business">Business</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Health">Health</option>
                                    <option value="Education">Education</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Food">Food</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status *</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                    />
                                    Mark as Featured
                                </label>
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isCommentEnabled"
                                        checked={formData.isCommentEnabled}
                                        onChange={handleInputChange}
                                    />
                                    Enable Comments
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="form-section">
                        <h3>Content</h3>
                        <div className="form-group">
                            <label htmlFor="content">Blog Content *</label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Write your blog content here..."
                                rows={15}
                                required
                                style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
                            />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="form-section">
                        <h3>Featured Image</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="featuredImageUrl">Image URL</label>
                                <input
                                    type="url"
                                    id="featuredImageUrl"
                                    value={formData.featuredImage.url}
                                    onChange={(e) => handleNestedInputChange('featuredImage', 'url', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="featuredImageAlt">Alt Text</label>
                                <input
                                    type="text"
                                    id="featuredImageAlt"
                                    value={formData.featuredImage.alt}
                                    onChange={(e) => handleNestedInputChange('featuredImage', 'alt', e.target.value)}
                                    placeholder="Image description"
                                />
                            </div>
                        </div>

                        {formData.featuredImage.url && (
                            <div className="featured-image-preview">
                                <img
                                    src={formData.featuredImage.url}
                                    alt={formData.featuredImage.alt}
                                    className="featured-image"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="form-section">
                        <h3>Tags</h3>

                        <div className="tag-input-row">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a tag"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="tag-input"
                            />
                            <button type="button" onClick={addTag} className="btn btn-secondary">
                                <MdAdd size={16} />
                                Add Tag
                            </button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="tag-list">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="tag-remove"
                                        >
                                            <MdClose size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SEO Settings */}
                    <div className="form-section">
                        <h3>SEO Settings</h3>

                        <div className="form-group">
                            <label htmlFor="seoTitle">SEO Title</label>
                            <input
                                type="text"
                                id="seoTitle"
                                name="seoTitle"
                                value={formData.seoTitle}
                                onChange={handleInputChange}
                                placeholder="SEO optimized title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="seoDescription">SEO Description</label>
                            <textarea
                                id="seoDescription"
                                name="seoDescription"
                                value={formData.seoDescription}
                                onChange={handleInputChange}
                                placeholder="SEO meta description"
                                rows={3}
                            />
                        </div>

                        <div className="keyword-input-row">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Add SEO keyword"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                className="keyword-input"
                            />
                            <button type="button" onClick={addKeyword} className="btn btn-secondary">
                                <MdAdd size={16} />
                                Add Keyword
                            </button>
                        </div>

                        {formData.seoKeywords.length > 0 && (
                            <div className="keyword-list">
                                {formData.seoKeywords.map((keyword, index) => (
                                    <span key={index} className="keyword">
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(keyword)}
                                            className="keyword-remove"
                                        >
                                            <MdClose size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            <MdDrafts size={20} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'published')}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <MdPublish size={20} />
                            {loading ? 'Publishing...' : 'Update & Publish'}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            <MdCancel size={20} />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .form-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .form-group input, .form-group select, .form-group textarea {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .tag-input-row, .keyword-input-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }

                .tag-input, .keyword-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .tag-input:focus, .keyword-input:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .tag-list, .keyword-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }

                .tag, .keyword {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffc007;
                    color: #333;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .tag-remove, .keyword-remove {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    border-radius: 2px;
                    transition: background-color 0.2s;
                }

                .tag-remove:hover, .keyword-remove:hover {
                    background-color: rgba(0,0,0,0.1);
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 32px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid #f5c6cb;
                    border-left: 4px solid #dc3545;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .tag-input-row, .keyword-input-row {
                        flex-direction: column;
                        gap: 8px;
                        align-items: stretch;
                    }

                    .form-actions {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    );
}

export default BlogEdit;

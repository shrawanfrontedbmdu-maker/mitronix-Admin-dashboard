import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdSave,
    MdCancel,
    MdImage,
    MdClose,
    MdAdd,
    MdDrafts,
    MdPublish,
    MdTextFields,
    MdFormatQuote,
    MdCode,
    MdList,
    MdDragIndicator,
    MdArrowUpward,
    MdArrowDownward,
    MdDelete
} from 'react-icons/md';
import blogService from '../api/blogService';

const SECTION_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    QUOTE: 'quote',
    CODE: 'code',
    LIST: 'list',
    HEADING: 'heading'
};

function CreateBlog() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        category: 'Technology',
        tags: '',
        featuredImage: { file: null, preview: '', alt: '' },
        status: 'draft',
        author: [],   // <-- author field
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        isCommentEnabled: true,
        isFeatured: false
    });


    const [contentSections, setContentSections] = useState([
        {
            id: Date.now(),
            type: SECTION_TYPES.TEXT,
            content: '',
            order: 0
        }
    ]);

    const [newTag, setNewTag] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

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

    const addContentSection = (type) => {
        const newSection = {
            id: Date.now(),
            type,
            content: '',
            order: contentSections.length,
            ...(type === SECTION_TYPES.IMAGE && {
                file: null,
                preview: '',
                alt: '',
                caption: '',
                alignment: 'center'
            }),
            ...(type === SECTION_TYPES.QUOTE && {
                author: '',
                source: ''
            }),
            ...(type === SECTION_TYPES.CODE && {
                language: 'javascript'
            }),
            ...(type === SECTION_TYPES.LIST && {
                items: [''],
                listType: 'bullet'
            }),
            ...(type === SECTION_TYPES.HEADING && {
                level: 'h2'
            })
        };
        setContentSections(prev => [...prev, newSection]);
    };

    const updateContentSection = (id, field, value) => {
        setContentSections(prev =>
            prev.map(section =>
                section.id === id
                    ? { ...section, [field]: value }
                    : section
            )
        );
    };

    const deleteContentSection = (id) => {
        if (contentSections.length > 1) {
            setContentSections(prev => prev.filter(section => section.id !== id));
        }
    };

    const moveSection = (id, direction) => {
        const currentIndex = contentSections.findIndex(section => section.id === id);
        if (
            (direction === 'up' && currentIndex > 0) ||
            (direction === 'down' && currentIndex < contentSections.length - 1)
        ) {
            const newSections = [...contentSections];
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            [newSections[currentIndex], newSections[targetIndex]] =
                [newSections[targetIndex], newSections[currentIndex]];
            setContentSections(newSections);
        }
    };

    const updateListItem = (sectionId, itemIndex, value) => {
        setContentSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        items: section.items.map((item, index) =>
                            index === itemIndex ? value : item
                        )
                    }
                    : section
            )
        );
    };

    const addListItem = (sectionId) => {
        setContentSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? { ...section, items: [...section.items, ''] }
                    : section
            )
        );
    };

    const removeListItem = (sectionId, itemIndex) => {
        setContentSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        items: section.items.filter((_, index) => index !== itemIndex)
                    }
                    : section
            )
        );
    };

    const renderContentSection = (section, index) => {
        const isFirst = index === 0;
        const isLast = index === contentSections.length - 1;

        return (
            <div key={section.id} className="content-section-wrapper">
                <div className="content-section-header">
                    <div className="section-controls">
                        <button
                            type="button"
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={isFirst}
                            className="btn btn-sm btn-ghost"
                            title="Move up"
                        >
                            <MdArrowUpward size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={isLast}
                            className="btn btn-sm btn-ghost"
                            title="Move down"
                        >
                            <MdArrowDownward size={16} />
                        </button>
                        <MdDragIndicator className="drag-handle" />
                        <span className="section-type-label">{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</span>
                    </div>
                    {contentSections.length > 1 && (
                        <button
                            type="button"
                            onClick={() => deleteContentSection(section.id)}
                            className="btn btn-sm btn-ghost text-red"
                            title="Delete section"
                        >
                            <MdDelete size={16} />
                        </button>
                    )}
                </div>

                <div className="content-section-body">
                    {renderSectionContent(section)}
                </div>
            </div>
        );
    };

    const renderSectionContent = (section) => {
        switch (section.type) {
            case SECTION_TYPES.TEXT:
                return (
                    <textarea
                        value={section.content}
                        onChange={(e) => updateContentSection(section.id, 'content', e.target.value)}
                        placeholder="Write your content here..."
                        rows={6}
                        className="section-textarea"
                    />
                );

            case SECTION_TYPES.HEADING:
                return (
                    <div className="heading-section">
                        <div className="form-row">
                            <select
                                value={section.level}
                                onChange={(e) => updateContentSection(section.id, 'level', e.target.value)}
                                className="heading-level-select"
                            >
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            value={section.content}
                            onChange={(e) => updateContentSection(section.id, 'content', e.target.value)}
                            placeholder="Enter heading text..."
                            className="heading-input"
                        />
                    </div>
                );

            case SECTION_TYPES.IMAGE:
                return (
                    <div className="image-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Upload Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            updateContentSection(section.id, 'file', file); // store file
                                            updateContentSection(section.id, 'preview', URL.createObjectURL(file)); // show preview
                                        }
                                    }}
                                />

                            </div>
                            <div className="form-group">
                                <label>Alignment</label>
                                <select
                                    value={section.alignment || 'center'}
                                    onChange={(e) => updateContentSection(section.id, 'alignment', e.target.value)}
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Alt Text</label>
                                <input
                                    type="text"
                                    value={section.alt || ''}
                                    onChange={(e) => updateContentSection(section.id, 'alt', e.target.value)}
                                    placeholder="Image description"
                                />
                            </div>
                            <div className="form-group">
                                <label>Caption</label>
                                <input
                                    type="text"
                                    value={section.caption || ''}
                                    onChange={(e) => updateContentSection(section.id, 'caption', e.target.value)}
                                    placeholder="Image caption (optional)"
                                />
                            </div>
                        </div>
                        {section.preview && (
                            <div className="image-preview-container">
                                <img
                                    src={section.preview}
                                    alt={section.alt}
                                    className={`image-preview align-${section.alignment}`}
                                />
                                {section.caption && (
                                    <p className="image-caption">{section.caption}</p>
                                )}
                            </div>
                        )}
                    </div>
                );

            case SECTION_TYPES.QUOTE:
                return (
                    <div className="quote-section">
                        <textarea
                            value={section.content}
                            onChange={(e) => updateContentSection(section.id, 'content', e.target.value)}
                            placeholder="Enter quote text..."
                            rows={4}
                            className="quote-textarea"
                        />
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={section.author || ''}
                                    onChange={(e) => updateContentSection(section.id, 'author', e.target.value)}
                                    placeholder="Quote author (optional)"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={section.source || ''}
                                    onChange={(e) => updateContentSection(section.id, 'source', e.target.value)}
                                    placeholder="Source (optional)"
                                />
                            </div>
                        </div>
                    </div>
                );

            case SECTION_TYPES.CODE:
                return (
                    <div className="code-section">
                        <div className="form-group">
                            <label>Programming Language</label>
                            <select
                                value={section.language || 'javascript'}
                                onChange={(e) => updateContentSection(section.id, 'language', e.target.value)}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="sql">SQL</option>
                                <option value="bash">Bash</option>
                                <option value="json">JSON</option>
                                <option value="xml">XML</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <textarea
                            value={section.content}
                            onChange={(e) => updateContentSection(section.id, 'content', e.target.value)}
                            placeholder="Enter your code here..."
                            rows={8}
                            className="code-textarea"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                );

            case SECTION_TYPES.LIST:
                return (
                    <div className="list-section">
                        <div className="form-group">
                            <label>List Type</label>
                            <select
                                value={section.listType || 'bullet'}
                                onChange={(e) => updateContentSection(section.id, 'listType', e.target.value)}
                            >
                                <option value="bullet">Bullet Points</option>
                                <option value="numbered">Numbered List</option>
                            </select>
                        </div>
                        <div className="list-items">
                            {(section.items || ['']).map((item, index) => (
                                <div key={index} className="list-item-row">
                                    <span className="list-item-number">
                                        {section.listType === 'numbered' ? `${index + 1}.` : '•'}
                                    </span>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem(section.id, index, e.target.value)}
                                        placeholder={`List item ${index + 1}`}
                                        className="list-item-input"
                                    />
                                    {section.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeListItem(section.id, index)}
                                            className="btn btn-sm btn-ghost text-red"
                                        >
                                            <MdClose size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem(section.id)}
                                className="btn btn-sm btn-secondary"
                            >
                                <MdAdd size={16} />
                                Add Item
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // const handleSubmit = async (e, status = 'draft') => {
    //     e.preventDefault();

    //     if (!formData.title.trim() || !formData.excerpt.trim()) {
    //         setError('Title and excerpt are required');
    //         return;
    //     }

    //     if (contentSections.length === 0 || !contentSections[0].content.trim()) {
    //         setError('At least one content section with content is required');
    //         return;
    //     }

    //     try {
    //         setLoading(true);
    //         setError('');

    //         const structuredContent = contentSections.map((section, index) => ({
    //             ...section,
    //             order: index
    //         }));

    //         const submitData = {
    //             ...formData,
    //             content: JSON.stringify(structuredContent),
    //             status: status.toLowerCase(),
    //             author: {
    //                 id: '60f7b3b3b3b3b3b3b3b3b3b3',
    //                 name: 'Admin User'
    //             }
    //         };

    //         await blogService.create(submitData);
    //         navigate('/blogs');
    //     } catch (error) {
    //         setError(error.message || 'Failed to create blog');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleSubmit = async (e, submitStatus = 'draft') => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const form = new FormData();

            // Basic Fields
            form.append("title", formData.title);
            form.append("excerpt", formData.excerpt);
            form.append("category", formData.category);
            form.append("status", submitStatus.toLowerCase()); // 'draft' or 'published'
            form.append("seoTitle", formData.seoTitle);
            form.append("seoDescription", formData.seoDescription);
            form.append("isFeatured", formData.isFeatured);
            form.append("isCommentEnabled", formData.isCommentEnabled);
            form.append("tags", JSON.stringify(formData.tags));
            form.append("seoKeywords", JSON.stringify(formData.seoKeywords));
            form.append("author", JSON.stringify(formData.author)); // author object



            if (formData.featuredImage.file) {
                form.append("images", formData.featuredImage.file);
            }

            const cleanSections = contentSections.map((section, index) => {
                const { file, preview, ...rest } = section; // remove file/preview
                return { ...rest, order: index };
            });

            // ✅ ContentBlocks as array (JSON string)
            form.append("contentBlocks", JSON.stringify(cleanSections));

            // Section images
            contentSections.forEach(section => {
                if (section.type === "image" && section.file) {
                    form.append("images", section.file); // backend can map images by order
                }
            });

            await blogService.create(form); // your axios call
            navigate('/blogs');

        } catch (err) {
            setError('Failed to create blog');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Create New Blog</h1>
                    <p className="page-subtitle">Build your blog with dynamic content sections</p>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/blogs')}
                        className="btn btn-secondary"
                    >
                        <MdCancel size={20} />
                        Cancel
                    </button>
                </div>
            </div>

            <div className="content-card">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e, 'Draft')} className="form-layout">
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

                    {/* Featured Image */}
                    <div className="form-section">
                        <h3>Featured Image</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="featuredImageUrl">Image URL</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setFormData(prev => ({
                                                ...prev,
                                                featuredImage: {
                                                    ...prev.featuredImage,
                                                    file,
                                                    preview: URL.createObjectURL(file)
                                                }
                                            }));
                                        }
                                    }}
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

                        {formData.featuredImage.preview && (
                            <div className="featured-image-preview">
                                <img
                                    src={formData.featuredImage.preview}
                                    alt={formData.featuredImage.alt}
                                    className="featured-image"
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Sections */}
                    <div className="form-section">
                        <div className="content-header">
                            <h3>Content Sections</h3>
                            <div className="content-actions">
                                <div className="section-type-buttons">
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.TEXT)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add Text Section"
                                    >
                                        <MdTextFields size={16} />
                                        Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.HEADING)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add Heading"
                                    >
                                        <MdTextFields size={16} />
                                        Heading
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.IMAGE)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add Image"
                                    >
                                        <MdImage size={16} />
                                        Image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.QUOTE)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add Quote"
                                    >
                                        <MdFormatQuote size={16} />
                                        Quote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.CODE)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add Code Block"
                                    >
                                        <MdCode size={16} />
                                        Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addContentSection(SECTION_TYPES.LIST)}
                                        className="btn btn-sm btn-secondary"
                                        title="Add List"
                                    >
                                        <MdList size={16} />
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="content-sections">
                            {contentSections.map((section, index) => renderContentSection(section, index))}
                        </div>
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
                                    <span key={`create-blog-tag-${index}-${tag.replace(/[^a-zA-Z0-9]/g, '')}`} className="tag">
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
                                    <span key={`create-blog-keyword-${index}-${keyword.replace(/[^a-zA-Z0-9]/g, '')}`} className="keyword">
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
                            onClick={(e) => handleSubmit(e, 'draft')}
                        >
                            <MdDrafts size={20} />
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'published')}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <MdPublish size={20} />
                            {loading ? 'Publishing...' : 'Publish Now'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .section-type-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .content-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .content-section-wrapper {
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .content-section-header {
                    background: #f8f9fa;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e9ecef;
                }

                .section-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .drag-handle {
                    color: #6c757d;
                    cursor: grab;
                }

                .section-type-label {
                    font-weight: 500;
                    color: #333;
                    text-transform: capitalize;
                }

                .content-section-body {
                    padding: 16px;
                    background: white;
                }

                .section-textarea, .code-textarea, .quote-textarea {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 12px;
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                }

                .section-textarea:focus, .code-textarea:focus, .quote-textarea:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .heading-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .heading-level-select {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                    font-size: 14px;
                }

                .heading-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                }

                .heading-input:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .image-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .image-preview-container {
                    margin-top: 16px;
                    text-align: center;
                }

                .image-preview {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .image-preview.align-left {
                    text-align: left;
                }

                .image-preview.align-right {
                    text-align: right;
                }

                .image-caption {
                    margin-top: 8px;
                    font-style: italic;
                    color: #666;
                    font-size: 14px;
                }

                .quote-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .quote-textarea {
                    font-style: italic;
                    background: #f8f9fa;
                    border-left: 4px solid #ffc007;
                }

                .code-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .code-textarea {
                    background: #1a1a1a;
                    color: #f8f9fa;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    border: 1px solid #333;
                }

                .list-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .list-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .list-item-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .list-item-number {
                    min-width: 24px;
                    font-weight: 500;
                    color: #ffc007;
                }

                .list-item-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }

                .list-item-input:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .featured-image-preview {
                    margin-top: 16px;
                    text-align: center;
                }

                .featured-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

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

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .btn-primary {
                    background: #ffc007;
                    color: #333;
                }

                .btn-primary:hover {
                    background: #e6ac06;
                }

                .btn-secondary {
                    background: #74b9ff;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #0984e3;
                }

                .btn-ghost {
                    background: transparent;
                    color: #6c757d;
                    border: 1px solid #dee2e6;
                }

                .btn-ghost:hover {
                    background: #f8f9fa;
                    color: #333;
                }

                .btn-sm {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                .text-red {
                    color: #dc3545;
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

                /* Responsive Design */
                @media (max-width: 768px) {
                    .section-type-buttons {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                    }

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

                    .content-section-header {
                        padding: 8px 12px;
                    }

                    .content-section-body {
                        padding: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .section-type-buttons {
                        grid-template-columns: 1fr;
                    }

                    .btn {
                        justify-content: center;
                        width: 100%;
                    }

                    .section-controls {
                        gap: 4px;
                    }

                    .btn-sm {
                        padding: 4px 8px;
                    }
                }
            `}</style>
        </div>
    );
}

export default CreateBlog;

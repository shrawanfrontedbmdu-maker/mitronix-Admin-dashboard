import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdArrowBack, MdEdit, MdVisibility, MdAccessTime, MdPerson, MdCategory, MdTag } from 'react-icons/md'
import blogService from '../api/blogService'

function BlogDetails() {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadBlogData()
    }
  }, [id])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await blogService.getById(id)
      setBlog(data)
    } catch (error) {
      console.error('Error loading blog:', error)
      setError('Failed to load blog data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'status-success'
      case 'draft': return 'status-warning'
      case 'archived': return 'status-secondary'
      default: return 'status-secondary'
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Blog Details</h1>
            <p className="page-subtitle">Loading blog...</p>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading blog details...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Blog Details</h1>
            <p className="page-subtitle">Error loading blog</p>
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
            ❌ {error || 'Blog not found'}
          </p>
          <Link to="/blogs" className="btn btn-primary">
            Back to Blogs List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Blog Details</h1>
          <p className="page-subtitle">{blog.title}</p>
        </div>
        <div className="page-actions">
          <Link to="/blogs" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Blogs
          </Link>
          <Link to={`/blogs/${id}/edit`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit
          </Link>
        </div>
      </div>

      <div className="blog-details-container">
        {/* Blog Header */}
        <div className="content-card">
          <div className="blog-header">
            {blog.featuredImage && (
              <div className="featured-image">
                <img src={blog.featuredImage.url} alt={blog.title} />
              </div>
            )}
            <div className="blog-meta">
              <div className="meta-primary">
                <h1 className="blog-title">{blog.title}</h1>
                <p className="blog-excerpt">{blog.excerpt}</p>
              </div>
              <div className="meta-badges">
                <span className={`status-badge ${getStatusColor(blog.status)}`}>
                  {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </span>
                {blog.isFeatured && (
                  <span className="featured-badge">Featured</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="blog-content-grid">
          {/* Blog Content */}
          {/* <div className="content-card blog-content">
            <h3>Content</h3>
            <div
              className="blog-content-html"
            />
            {blog.contentBlocks?.map((block, index) => (
              <div
                key={index}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            ))}
          </div> */}
          <div className="content-card blog-content">
            <h3>Content</h3>

            {blog.contentBlocks
              ?.sort((a, b) => a.order - b.order)
              .map((block, index) => {
                switch (block.type) {
                  case "text":
                  case "heading":
                  case "quote":
                  case "code":
                  case "list":
                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom: "16px",
                          lineHeight: "1.7",
                          fontSize: "16px",
                          color: "#333"
                        }}
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                    );

                  case "image":
                    return (
                      <div
                        key={index}
                        style={{
                          margin: "20px 0",
                          textAlign: "center"
                        }}
                      >
                        <img
                          src={block.url}
                          alt={block.alt || "Blog image"}
                          style={{
                            width: "100%",
                            maxHeight: "500px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
                          }}
                        />
                        {block.caption && (
                          <p
                            style={{
                              marginTop: "8px",
                              fontSize: "14px",
                              color: "#666"
                            }}
                          >
                            {block.caption}
                          </p>
                        )}
                      </div>
                    );

                  default:
                    return null;
                }
              })}
          </div>
          {/* Blog Metadata */}
          <div className="content-card blog-sidebar">
            <h3>Blog Information</h3>

            <div className="blog-info-section">
              <h4><MdPerson size={16} /> Author</h4>
              <div className="author-info">
                <img src={blog.author || null} alt={blog.author || null} className="author-avatar" />
                <div>
                  <p className="author-name">{blog.author}</p>
                  <p className="author-email">{blog.author}</p>
                </div>
              </div>
            </div>

            <div className="blog-info-section">
              <h4><MdCategory size={16} /> Category</h4>
              <p>{blog.category}</p>
            </div>

            <div className="blog-info-section">
              <h4><MdTag size={16} /> Tags</h4>
              <div className="tags-list">
                {blog.tags.map((tag, index) => (
                  <span key={`blog-tag-${blog.id || 'default'}-${index}-${tag.replace(/[^a-zA-Z0-9]/g, '')}`} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>

            <div className="blog-info-section">
              <h4><MdAccessTime size={16} /> Publishing Info</h4>
              <p><strong>Created:</strong> {new Date(blog.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(blog.updatedAt).toLocaleDateString()}</p>
              {blog.publishedAt && (
                <p><strong>Published:</strong> {new Date(blog.publishedAt).toLocaleDateString()}</p>
              )}
              <p><strong>Read Time:</strong> {blog.readTime} min</p>
            </div>

            <div className="blog-info-section">
              <h4><MdVisibility size={16} /> Statistics</h4>
              <p><strong>Views:</strong> {blog.views?.toLocaleString()}</p>
              <p><strong>Likes:</strong> {blog.likes?.toLocaleString()}</p>
              <p><strong>Comments:</strong> {blog.comments?.toLocaleString()}</p>
            </div>

            <div className="blog-info-section">
              <h4>Settings</h4>
              <p><strong>Comments:</strong> {blog.isCommentEnabled ? 'Enabled' : 'Disabled'}</p>
              <p><strong>Featured:</strong> {blog.isFeatured ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetails

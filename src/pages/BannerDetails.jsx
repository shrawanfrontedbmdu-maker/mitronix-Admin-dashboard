import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdArrowBack, MdEdit, MdImage, MdLocationOn, MdTrendingUp } from 'react-icons/md'
import bannerService from '../api/bannerService'

function BannerDetails() {
  const { id } = useParams()
  const [banner, setBanner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadBannerData()
    }
  }, [id])

  const loadBannerData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await bannerService.getById(id)
      setBanner(data)
    } catch (error) {
      console.error('Error loading banner:', error)
      setError(error.message || 'Failed to load banner data from server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Banner Details</h1>
            <p className="page-subtitle">Loading banner...</p>
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
          <p>Loading banner details...</p>
        </div>
      </div>
    )
  }

  if (error || !banner) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Banner Details</h1>
            <p className="page-subtitle">Error loading banner</p>
          </div>
          <div className="page-actions">
            <Link to="/banners" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to Banners
            </Link>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            ❌ {error || 'Banner not found'}
          </p>
          <Link to="/banners" className="btn btn-primary">
            Back to Banners List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Banner Details</h1>
          <p className="page-subtitle">{typeof banner.title === 'object' ? banner.title?.name || banner.title?.value || 'N/A' : (banner.title || 'N/A')}</p>
        </div>
        <div className="page-actions">
          <Link to="/banners" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Banners
          </Link>
          <Link to={`/banners/${id}/edit`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit
          </Link>
        </div>
      </div>

      <div className="banner-details-container">
        <div className="content-card">
          <h3><MdImage size={20} /> Banner Preview</h3>
          <div className="banner-preview">
            <img src={typeof banner.imageUrl === 'object' ? banner.imageUrl?.url || banner.imageUrl?.src : banner.imageUrl} alt={typeof banner.title === 'object' ? banner.title?.name || banner.title?.value : banner.title} style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px' }} />
          </div>
        </div>

        <div className="banner-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="content-card">
            <h3><MdLocationOn size={20} /> Banner Information</h3>
            <div className="banner-info">
              <div className="info-group">
                <h4>Basic Details</h4>
                <p><strong>Title:</strong> {typeof banner.title === 'object' ? banner.title?.name || banner.title?.value || 'N/A' : (banner.title || 'N/A')}</p>
                <p><strong>Description:</strong> {typeof banner.description === 'object' ? banner.description?.text || banner.description?.content || 'N/A' : (banner.description || 'N/A')}</p>
                <p><strong>Link:</strong> <a href={typeof banner.link === 'object' ? banner.link?.url || banner.link?.href : banner.link} target="_blank" rel="noopener noreferrer">{typeof banner.link === 'object' ? banner.link?.url || banner.link?.href : banner.link}</a></p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${banner.status === 'active' ? 'status-success' : 'status-secondary'}`}>
                    {banner.status}
                  </span>
                </p>
              </div>
              <div className="info-group">
                <h4>Targeting</h4>
                <p><strong>Placement:</strong> {banner.placement}</p>
                <p><strong>Target Audience:</strong> {banner.targetAudience}</p>
                <p><strong>Start Date:</strong> {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>End Date:</strong> {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3><MdTrendingUp size={20} /> Performance Metrics</h3>
            <div className="banner-metrics">
              <div className="metric-item">
                <h4>Impressions</h4>
                <p className="metric-value">{(banner.impressions || 0).toLocaleString()}</p>
              </div>
              <div className="metric-item">
                <h4>Clicks</h4>
                <p className="metric-value">{(banner.clicks || 0).toLocaleString()}</p>
              </div>
              <div className="metric-item">
                <h4>Click Rate</h4>
                <p className="metric-value">{banner.clickRate || 0}%</p>
              </div>
              <div className="metric-item">
                <h4>Conversion Rate</h4>
                <p className="metric-value">{banner.conversionRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BannerDetails

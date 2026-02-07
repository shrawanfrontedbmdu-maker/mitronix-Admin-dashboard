import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdCancel, MdDrafts, MdPublish, MdClose, MdAdd } from 'react-icons/md';
import bannerService from '../api/bannerService';

function BannerEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        imageAlt: '',
        link: '',
        linkTarget: '_self',
        placement: 'homepage-hero',
        targetAudience: 'All Users',
        status: 'inactive',
        startDate: '',
        endDate: '',
        priority: 1,
        isClickable: true,
        trackingEnabled: true,
        notes: ''
    });

    useEffect(() => {
        if (id) {
            loadBanner();
        }
    }, [id]);

    const loadBanner = async () => {
        try {
            setFetchLoading(true);
            const data = await bannerService.getById(id);
            setFormData({
                title: data.title || '',
                description: data.description || '',
                imageUrl: data.imageUrl || '',
                imageAlt: data.imageAlt || '',
                link: data.link || '',
                linkTarget: data.linkTarget || '_self',
                placement: data.placement || 'homepage-hero',
                targetAudience: data.targetAudience || 'All Users',
                status: data.status || 'inactive',
                startDate: data.startDate ? data.startDate.split('T')[0] : '',
                endDate: data.endDate ? data.endDate.split('T')[0] : '',
                priority: data.priority || 1,
                isClickable: data.isClickable ?? true,
                trackingEnabled: data.trackingEnabled ?? true,
                notes: data.notes || ''
            });
        } catch (error) {
            setError(error.message || 'Failed to load banner');
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

    const handleSubmit = async (e, statusOverride = null) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.imageUrl.trim() || !formData.startDate || !formData.endDate) {
            setError('Please fill all required fields');
            return;
        }

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            setError('End date must be after start date');
            return;
        }

        try {
            setLoading(true);
            await bannerService.update(id, {
                ...formData,
                status: statusOverride || formData.status,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            });
            navigate('/banners');
        } catch (error) {
            setError(error.message || 'Failed to update banner');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/banners');

    if (fetchLoading) return <div>Loading banner details...</div>;

    return (
        <div className="banner-edit">
            <div className="page-header">
                <h1>Edit Banner</h1>
                <p>{formData.title}</p>
                <Link to="/banners" className="btn btn-secondary">
                    <MdArrowBack /> Back to Banners
                </Link>
            </div>

            <div className="content-card">
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                        <label>Image URL *</label>
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required />
                        {formData.imageUrl && <img src={formData.imageUrl} alt={formData.imageAlt} style={{ maxHeight: '150px', marginTop: '10px' }} />}
                    </div>

                    <div className="form-group">
                        <label>Alt Text</label>
                        <input name="imageAlt" value={formData.imageAlt} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                        <label>Start Date *</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>End Date *</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-secondary" disabled={loading}>
                            <MdDrafts /> {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={(e) => handleSubmit(e, 'active')} className="btn btn-primary" disabled={loading}>
                            <MdPublish /> {loading ? 'Publishing...' : 'Update & Publish'}
                        </button>
                        <button type="button" onClick={handleCancel} className="btn btn-ghost" disabled={loading}>
                            <MdCancel /> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BannerEdit;

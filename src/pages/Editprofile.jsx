import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import adminProfileService from '../api/adminprofileService';

function Editprofile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        title: '',
        avatar: '',
        coverImage: '',
        experienceYears: '',
        certificates: '',
        internships: '',
        jobTitle: '',
        education: '',
        location: '',
        followers: '',
        email: '',
        website: '',
        languages: '',
        status: 'Active',
        about: ''
    });

    useEffect(() => {
        // loadProfile()
    }, []);


    const loadProfile = async () => {
        try {
            setFetchLoading(true);
            setError('');

            const data = await adminProfileService.getProfile();

            setFormData({
                fullName: data.fullName || '',
                title: data.title || '',
                avatar: data.avatar || '',
                coverImage: data.coverImage || '',
                experienceYears: data.experienceYears || '',
                certificates: data.certificates || '',
                internships: data.internships || '',
                jobTitle: data.jobTitle || '',
                education: data.education || '',
                location: data.location || '',
                followers: data.followers || '',
                email: data.email || '',
                website: data.website || '',
                languages: data.languages || '',
                status: data.status || 'Active',
                about: data.about || ''
            });

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load profile');
        } finally {
            setFetchLoading(false);
        }
    };


    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) errors.fullName = "Full name is required";

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Enter a valid email address";
        }

        if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
            errors.website = "Enter a valid website URL (https://example.com)";
        }

        if (formData.experienceYears < 0) errors.experienceYears = "Cannot be negative";
        if (formData.certificates < 0) errors.certificates = "Cannot be negative";
        if (formData.internships < 0) errors.internships = "Cannot be negative";
        if (formData.followers < 0) errors.followers = "Cannot be negative";

        if (formData.about.length > 500) errors.about = "About section max 500 characters";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                type === 'file' ? files[0] :
                    type === 'number' ? (value === '' ? '' : Number(value)) :
                        value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '' && formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });


            await adminProfileService.updateProfile(submitData);

            navigate('/profile');

        } catch (error) {
            console.log(error)
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        navigate(`/profile`);
    };

    if (fetchLoading) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Profile</h1>
                        <p className="page-subtitle">Loading...</p>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading Profile details...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.fullName) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Profile</h1>
                        <p className="page-subtitle">Error loading data</p>
                    </div>
                    <div className="page-actions">
                        <Link to="/profile" className="btn btn-secondary">
                            <MdArrowBack size={16} />
                            Back to Profile
                        </Link>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#dc2626', marginBottom: '20px' }}>
                        ❌ {error}
                    </p>
                    <Link to="/profile" className="btn btn-primary">
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Edit Profile</h1>
                    <p className="page-subtitle">{formData.title}</p>
                </div>
                <div className="page-actions">
                    <Link to={`/profile`} className="btn btn-secondary">
                        <MdArrowBack size={16} />
                        Back to Profile
                    </Link>
                </div>
            </div>

            <div className="content-card">
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="form-layout">

                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Professional Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Avatar Img</label>
                                <input type="file" name="avatar" onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Cover Image Img</label>
                                <input type="file" name="coverImage" onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* Experience Stats */}
                    <div className="form-section">
                        <h3>Experience Stats</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Certificates</label>
                                <input type="number" name="certificates" value={formData.certificates} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Internships</label>
                                <input type="number" name="internships" value={formData.internships} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="form-section">
                        <h3>Personal Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Job Title</label>
                                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Education</label>
                                <input type="text" name="education" value={formData.education} onChange={handleInputChange} />

                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Followers</label>
                                <input type="number" name="followers" value={formData.followers} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Website</label>
                                <input type="url" name="website" value={formData.website} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Languages</label>
                                <input type="text" name="languages" value={formData.languages} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Busy">Busy</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="form-section">
                        <h3>About</h3>
                        <div className="form-group">
                            <textarea
                                name="about"
                                rows={5}
                                value={formData.about}
                                onChange={handleInputChange}
                                placeholder="Write about yourself..."
                            />

                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>

                        <button type="button" onClick={handleCancel} className="btn btn-ghost">
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

export default Editprofile;

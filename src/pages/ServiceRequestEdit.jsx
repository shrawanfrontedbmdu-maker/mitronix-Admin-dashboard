import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    MdSave,
    MdCancel,
    MdArrowBack
} from 'react-icons/md';
import serviceRequestService from '../api/serviceRequestService';

function ServiceRequestEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: '',
        orderId: '',
        productname: '',      // ✅ rename
        paymentdetails: '',   // ✅ add this
        description: '',
        status: '',
        priority: '',
        category: '',
        assignedTo: '',
        resolution: ''
    });

    useEffect(() => {
        if (id) {
            loadServiceRequest();
        }
    }, [id]);

    const loadServiceRequest = async () => {
        try {
            setFetchLoading(true);
            setError('');
            const data = await serviceRequestService.getById(id);
            setFormData({
                type: data.type || '',
                orderId: data.orderId?._id || '',
                productname: data.productname || '',     // ✅ fix
                paymentdetails: data.paymentdetails || '', // ✅ add
                description: data.description || '',
                status: data.status || '',
                priority: data.priority || '',
                category: data.category || '',
                assignedTo: data.assignedTo || '',
                resolution: data.resolution || ''
            });

        } catch (error) {
            setError(error.message || 'Failed to load service request');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.type || !formData.orderId || !formData.productname || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await serviceRequestService.update(id, formData);
            navigate(`/service-requests/${id}`);
        } catch (error) {
            setError(error.message || 'Failed to update service request');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/service-requests/${id}`);
    };

    if (fetchLoading) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Service Request</h1>
                        <p className="page-subtitle">Loading...</p>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading service request details...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.type) {
        return (
            <div>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1 className="page-title">Edit Service Request</h1>
                        <p className="page-subtitle">Error loading data</p>
                    </div>
                    <div className="page-actions">
                        <Link to="/service-requests" className="btn btn-secondary">
                            <MdArrowBack size={16} />
                            Back to Service Requests
                        </Link>
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#dc2626', marginBottom: '20px' }}>
                        ❌ {error}
                    </p>
                    <Link to="/service-requests" className="btn btn-primary">
                        Back to Service Requests List
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Edit Service Request</h1>
                    <p className="page-subtitle">#{id}</p>
                </div>
                <div className="page-actions">
                    <Link to={`/service-requests/${id}`} className="btn btn-secondary">
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

                <form onSubmit={handleSubmit} className="form-layout">
                    <div className="form-section">
                        <h3>Request Information</h3>
                        <div className="form-grid-aligned">
                            <div className="form-group">
                                <label htmlFor="type">Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="repair">Repair</option>
                                    <option value="relocation">Relocation</option>
                                    <option value="demo">Demo</option>
                                    <option value="installation">Installation</option>
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
                                    className="form-control"
                                >
                                    <option value="">Select Status</option>
                                    <option value="open">Open</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="priority">Priority *</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>

                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="orderId">Order ID *</label>
                                <input
                                    type="text"
                                    id="orderId"
                                    name="orderId"
                                    value={formData.orderId}
                                    onChange={handleInputChange}
                                    placeholder="Enter Order ID"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="product">Product *</label>
                                {/* <input
                                    type="text"
                                    id="product"
                                    name="product"
                                    value={formData.product}
                                    onChange={handleInputChange}
                                    placeholder="Enter Product Name"
                                    required
                                    className="form-control"
                                /> */}
                                <input
                                    type="text"
                                    id="productname"
                                    name="productname"
                                    value={formData.productname}
                                    onChange={handleInputChange}
                                    placeholder="Enter Product Name"
                                    required
                                    className="form-control"
                                />

                            </div>

                            <div className="form-group">
                                <label htmlFor="assignedTo">Assigned To</label>
                                <input
                                    type="text"
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleInputChange}
                                    placeholder="Assigned team member"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="paymentdetails">Payment Details *</label>
                                <input
                                    type="text"
                                    id="paymentdetails"
                                    name="paymentdetails"
                                    value={formData.paymentdetails}
                                    onChange={handleInputChange}
                                    placeholder="Enter payment details"
                                    required
                                    className="form-control"
                                />
                            </div>


                            <div className="form-group form-group-full">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the service request in detail"
                                    rows={4}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group form-group-full">
                                <label htmlFor="resolution">Resolution</label>
                                <textarea
                                    id="resolution"
                                    name="resolution"
                                    value={formData.resolution}
                                    onChange={handleInputChange}
                                    placeholder="Resolution details (for resolved/closed requests)"
                                    rows={4}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-bottom-right">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <MdSave size={20} />
                            {loading ? 'Updating...' : 'Update Request'}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-secondary"
                            disabled={loading}
                            style={{ marginLeft: '1%' }}
                        >
                            <MdCancel size={20} />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ServiceRequestEdit;

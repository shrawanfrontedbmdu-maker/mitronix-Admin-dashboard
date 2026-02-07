import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdCancel, MdDrafts, MdPublish } from 'react-icons/md';
import roleService from '../api/roleService';

function RoleEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [],
        status: 'inactive',
    });

    useEffect(() => {
        if (id) {
            loadRole();
        }
    }, [id]);

    const loadRole = async () => {
        try {
            setFetchLoading(true);
            const data = await roleService.getById(id);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                permissions: data.permissions || [],
                status: data.status || 'inactive',
            });
        } catch (error) {
            setError(error.message || 'Failed to load role');
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

    const handlePermissionChange = (index, field, value) => {
        const updatedPermissions = [...formData.permissions];
        updatedPermissions[index][field] = value;
        setFormData(prev => ({
            ...prev,
            permissions: updatedPermissions
        }));
    };

    const handleAddPermission = () => {
        setFormData(prev => ({
            ...prev,
            permissions: [...prev.permissions, { module: '', actions: '' }]
        }));
    };

    const handleRemovePermission = (index) => {
        const updatedPermissions = [...formData.permissions];
        updatedPermissions.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            permissions: updatedPermissions
        }));
    };

    const handleSubmit = async (e, statusOverride = null) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim() || formData.permissions.length === 0) {
            setError('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            await roleService.update(id, {
                ...formData,
                status: statusOverride || formData.status
            });
            navigate('/roles');
        } catch (error) {
            setError(error.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/roles');

    if (fetchLoading) return <div>Loading role details...</div>;

    return (
        <div className="role-edit">
            <div className="page-header">
                <h1>Edit Role</h1>
                <p>{formData.name}</p>
                <Link to="/roles" className="btn btn-secondary">
                    <MdArrowBack /> Back to Roles
                </Link>
            </div>

            <div className="content-card">
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="form-group">
                        <label>Role Name *</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Permissions *</label>
                        {formData.permissions.map((perm, index) => (
                            <div key={`edit-role-permission-${index}-${perm.module || 'default'}`} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                                <input
                                    placeholder="Module"
                                    value={perm.module}
                                    onChange={(e) => handlePermissionChange(index, 'module', e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="Actions (comma separated)"
                                    value={perm.actions}
                                    onChange={(e) => handlePermissionChange(index, 'actions', e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => handleRemovePermission(index)}>Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddPermission}><MdAdd /> Add Permission</button>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-secondary" disabled={loading}>
                            <MdDrafts /> {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={(e) => handleSubmit(e, 'active')} className="btn btn-primary" disabled={loading}>
                            <MdPublish /> {loading ? 'Publishing...' : 'Update & Activate'}
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

export default RoleEdit;

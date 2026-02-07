import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdSave,
    MdCancel,
    MdSecurity,
    MdPeople,
    MdSettings,
    MdDescription,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdExpandMore,
    MdExpandLess
} from 'react-icons/md';
import roleService from '../api/roleService';

function CreateRole() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedModules, setExpandedModules] = useState(new Set());

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: {},
        isActive: true,
        notes: ''
    });

    const permissionModules = {
        users: {
            label: 'User Management',
            description: 'Manage user accounts and profiles',
            actions: {
                create: 'Create new users',
                read: 'View user information',
                update: 'Edit user profiles',
                delete: 'Delete user accounts',
                manage_permissions: 'Manage user permissions'
            }
        },
        products: {
            label: 'Product Management',
            description: 'Manage product catalog and inventory',
            actions: {
                create: 'Add new products',
                read: 'View products',
                update: 'Edit product details',
                delete: 'Remove products',
                manage_inventory: 'Manage stock levels',
                manage_pricing: 'Set product prices'
            }
        },
        orders: {
            label: 'Order Management',
            description: 'Handle customer orders and fulfillment',
            actions: {
                create: 'Create orders',
                read: 'View orders',
                update: 'Update order status',
                delete: 'Cancel orders',
                process_refunds: 'Process refunds',
                manage_shipping: 'Manage shipping'
            }
        },
        customers: {
            label: 'Customer Management',
            description: 'Manage customer relationships',
            actions: {
                read: 'View customer profiles',
                update: 'Edit customer information',
                communicate: 'Send messages to customers',
                manage_groups: 'Manage customer groups'
            }
        },
        analytics: {
            label: 'Analytics & Reports',
            description: 'Access business insights and reports',
            actions: {
                read: 'View reports',
                export: 'Export data',
                dashboard: 'Access dashboard'
            }
        },
        banners: {
            label: 'Banner Management',
            description: 'Manage promotional banners',
            actions: {
                create: 'Create banners',
                read: 'View banners',
                update: 'Edit banners',
                delete: 'Remove banners',
                publish: 'Publish/unpublish banners'
            }
        },
        blogs: {
            label: 'Content Management',
            description: 'Manage blog posts and content',
            actions: {
                create: 'Create content',
                read: 'View content',
                update: 'Edit content',
                delete: 'Remove content',
                publish: 'Publish content'
            }
        },
        settings: {
            label: 'System Settings',
            description: 'Configure system settings',
            actions: {
                read: 'View settings',
                update: 'Modify settings',
                backup: 'Create backups',
                maintenance: 'System maintenance'
            }
        }
    };

    useEffect(() => {
        const initialPermissions = {};
        Object.keys(permissionModules).forEach(module => {
            initialPermissions[module] = {};
            Object.keys(permissionModules[module].actions).forEach(action => {
                initialPermissions[module][action] = false;
            });
        });
        setFormData(prev => ({ ...prev, permissions: initialPermissions }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePermissionChange = (module, action, checked) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: {
                    ...prev.permissions[module],
                    [action]: checked
                }
            }
        }));
    };

    const handleModuleSelectAll = (module, selectAll) => {
        const modulePermissions = {};
        Object.keys(permissionModules[module].actions).forEach(action => {
            modulePermissions[action] = selectAll;
        });

        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: modulePermissions
            }
        }));
    };

    const toggleModuleExpansion = (module) => {
        setExpandedModules(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(module)) {
                newExpanded.delete(module);
            } else {
                newExpanded.add(module);
            }
            return newExpanded;
        });
    };

    const isModuleFullySelected = (module) => {
        if (!formData.permissions[module]) return false;
        return Object.values(formData.permissions[module]).every(value => value === true);
    };

    const isModulePartiallySelected = (module) => {
        if (!formData.permissions[module]) return false;
        const values = Object.values(formData.permissions[module]);
        return values.some(value => value === true) && !values.every(value => value === true);
    };

    const getSelectedPermissionsCount = () => {
        let count = 0;
        Object.values(formData.permissions).forEach(modulePerms => {
            Object.values(modulePerms).forEach(hasPermission => {
                if (hasPermission) count++;
            });
        });
        return count;
    };

    const handleSubmit = async (e, status = 'inactive') => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Role name is required');
            return;
        }

        if (getSelectedPermissionsCount() === 0) {
            setError('At least one permission must be selected');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const permissions = [];
            Object.entries(formData.permissions).forEach(([module, actions]) => {
                const moduleActions = Object.entries(actions)
                    .filter(([, hasPermission]) => hasPermission)
                    .map(([action]) => action);
                
                if (moduleActions.length > 0) {
                    permissions.push({
                        module,
                        actions: moduleActions
                    });
                }
            });

            const submitData = {
                name: formData.name,
                description: formData.description,
                permissions,
                status: status,
                notes: formData.notes,
                createdBy: 'Admin User'
            };

            await roleService.create(submitData);
            navigate('/roles');
        } catch (error) {
            setError(error.message || 'Failed to create role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Create New Role</h1>
                    <p className="page-subtitle">Define role permissions and access levels</p>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/roles')}
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

                <form onSubmit={(e) => handleSubmit(e, 'inactive')} className="role-form">
                    {/* Basic Information */}
                    <div className="form-section">
                        <div className="section-header">
                            <MdSecurity className="section-icon" />
                            <h3>Role Information</h3>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Role Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter role name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkbox-text">Active role</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the role's purpose and responsibilities"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="form-section">
                        <div className="section-header">
                            <MdSettings className="section-icon" />
                            <h3>Permissions</h3>
                            <div className="permissions-summary">
                                {getSelectedPermissionsCount()} permissions selected
                            </div>
                        </div>

                        <div className="permissions-grid">
                            {Object.entries(permissionModules).map(([moduleKey, module]) => {
                                const isExpanded = expandedModules.has(moduleKey);
                                const isFullySelected = isModuleFullySelected(moduleKey);
                                const isPartiallySelected = isModulePartiallySelected(moduleKey);

                                return (
                                    <div key={moduleKey} className="permission-module">
                                        <div className="module-header">
                                            <div className="module-info">
                                                <div className="module-select">
                                                    <button
                                                        type="button"
                                                        className="select-all-btn"
                                                        onClick={() => handleModuleSelectAll(moduleKey, !isFullySelected)}
                                                    >
                                                        {isFullySelected ? (
                                                            <MdCheckBox className="checkbox-icon selected" />
                                                        ) : isPartiallySelected ? (
                                                            <MdCheckBox className="checkbox-icon partial" />
                                                        ) : (
                                                            <MdCheckBoxOutlineBlank className="checkbox-icon" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="module-details">
                                                    <h4 className="module-name">{module.label}</h4>
                                                    <p className="module-description">{module.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="expand-btn"
                                                onClick={() => toggleModuleExpansion(moduleKey)}
                                            >
                                                {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="module-actions">
                                                {Object.entries(module.actions).map(([actionKey, actionLabel]) => (
                                                    <label key={actionKey} className="action-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions[moduleKey]?.[actionKey] || false}
                                                            onChange={(e) => handlePermissionChange(moduleKey, actionKey, e.target.checked)}
                                                        />
                                                        <span className="action-label">{actionLabel}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="form-section">
                        <div className="section-header">
                            <MdDescription className="section-icon" />
                            <h3>Additional Notes</h3>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Internal Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add any internal notes about this role"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            <MdSave size={20} />
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'active')}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <MdPeople size={20} />
                            {loading ? 'Creating...' : 'Create & Activate'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .role-form {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .form-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid #e9ecef;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e9ecef;
                }

                .section-icon {
                    color: #ffc007;
                    font-size: 20px;
                }

                .section-header h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                    flex: 1;
                }

                .permissions-summary {
                    color: #666;
                    font-size: 14px;
                    font-weight: 500;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 20px;
                    margin-bottom: 20px;
                    align-items: end;
                }

                .form-row:last-child {
                    margin-bottom: 0;
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

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: white;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #ffc007;
                    box-shadow: 0 0 0 2px rgba(255, 192, 7, 0.2);
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #333;
                    padding: 12px 0;
                }

                .checkbox-label input[type="checkbox"] {
                    width: auto;
                    margin: 0;
                }

                .checkbox-text {
                    user-select: none;
                }

                .permissions-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .permission-module {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .module-header {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    cursor: pointer;
                }

                .module-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }

                .module-select {
                    flex-shrink: 0;
                }

                .select-all-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }

                .select-all-btn:hover {
                    background: #e9ecef;
                }

                .checkbox-icon {
                    font-size: 20px;
                    color: #6c757d;
                }

                .checkbox-icon.selected {
                    color: #ffc007;
                }

                .checkbox-icon.partial {
                    color: #74b9ff;
                }

                .module-details {
                    flex: 1;
                }

                .module-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 4px 0;
                }

                .module-description {
                    font-size: 12px;
                    color: #666;
                    margin: 0;
                }

                .expand-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #6c757d;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .expand-btn:hover {
                    background: #e9ecef;
                    color: #333;
                }

                .module-actions {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 12px;
                }

                .action-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }

                .action-checkbox:hover {
                    background: #f8f9fa;
                }

                .action-checkbox input[type="checkbox"] {
                    margin: 0;
                    flex-shrink: 0;
                }

                .action-label {
                    font-size: 14px;
                    color: #333;
                    user-select: none;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 24px;
                    border-top: 1px solid #e9ecef;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-primary {
                    background: #ffc007;
                    color: #333;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #e6ac06;
                }

                .btn-secondary {
                    background: #74b9ff;
                    color: white;
                }

                .btn-secondary:hover:not(:disabled) {
                    background: #0984e3;
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
                        gap: 16px;
                    }

                    .form-section {
                        padding: 16px;
                    }

                    .module-actions {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .form-actions {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .btn {
                        justify-content: center;
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .permissions-summary {
                        margin-top: 4px;
                    }

                    .module-header {
                        padding: 12px;
                    }

                    .module-actions {
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
}

export default CreateRole;

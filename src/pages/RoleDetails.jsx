import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdArrowBack, MdEdit, MdPeople, MdSecurity } from 'react-icons/md'
import roleService from '../api/roleService'

function RoleDetails() {
  const { id } = useParams()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadRoleData()
    }
  }, [id])

  const loadRoleData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await roleService.getById(id)
      setRole(data)
    } catch (error) {
      console.error('Error loading role:', error)
      setError(error.message || 'Failed to load role data from server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Role Details</h1>
            <p className="page-subtitle">Loading role...</p>
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
          <p>Loading role details...</p>
        </div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Role Details</h1>
            <p className="page-subtitle">Error loading role</p>
          </div>
          <div className="page-actions">
            <Link to="/roles" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to Roles
            </Link>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            ❌ {error || 'Role not found'}
          </p>
          <Link to="/roles" className="btn btn-primary">
            Back to Roles List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Role Details</h1>
          <p className="page-subtitle">{typeof role.name === 'object' ? role.name?.title || role.name?.value || 'N/A' : (role.name || 'N/A')}</p>
        </div>
        <div className="page-actions">
          <Link to="/roles" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Roles
          </Link>
          <Link to={`/roles/${id}/edit`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit
          </Link>
        </div>
      </div>

      <div className="role-details-container">
        <div className="content-card">
          <h3><MdSecurity size={20} /> Role Information</h3>
          <div className="role-info-grid">
            <div className="info-group">
              <h4>Basic Details</h4>
              <p><strong>Name:</strong> {typeof role.name === 'object' ? role.name?.title || role.name?.value || 'N/A' : (role.name || 'N/A')}</p>
              <p><strong>Description:</strong> {typeof role.description === 'object' ? role.description?.text || role.description?.content || 'N/A' : (role.description || 'N/A')}</p>
              <p><strong>Status:</strong>
                <span className={`status-badge ${(typeof role.status === 'object' ? role.status?.name || role.status?.value : role.status) === 'active' ? 'status-success' : 'status-secondary'}`}>
                  {typeof role.status === 'object' ? role.status?.name || role.status?.value || 'N/A' : (role.status || 'N/A')}
                </span>
              </p>
              <p><strong>System Role:</strong> {role.isSystemRole ? 'Yes' : 'No'}</p>
            </div>
            <div className="info-group">
              <h4>Usage Statistics</h4>
              <p><strong>Users Assigned:</strong> {typeof role.userCount === 'object' ? role.userCount?.count || role.userCount?.total || 0 : (role.userCount || 0)}</p>
              <p><strong>Created:</strong> {new Date(role.createdAt).toLocaleDateString()}</p>
              <p><strong>Created By:</strong> {role.createdBy}</p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h3><MdPeople size={20} /> Permissions</h3>
          <div className="permissions-list">
            {(role.permissions || []).map((permission, index) => (
              <div key={`role-permission-${role._id || 'default'}-${index}-${typeof permission === 'object' ? permission.module || permission.name || index : permission}`} className="permission-item">
                <h4>{typeof permission === 'object' ? permission.module || permission.name || 'N/A' : String(permission)}</h4>
                <div className="permission-actions">
                  {(permission.actions || []).map((action, actionIndex) => (
                    <span key={`role-action-${role._id || 'default'}-${index}-${actionIndex}-${typeof action === 'object' ? action.name || action.value || actionIndex : action}`} className="action-badge">
                      {typeof action === 'object' ? action.name || action.value || 'N/A' : String(action)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {(!role.permissions || role.permissions.length === 0) && (
              <p>No permissions assigned to this role.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleDetails

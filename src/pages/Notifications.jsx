import { useState } from 'react'
import { MdNotifications, MdSend, MdHistory, MdSettings, MdPeople, MdMessage, MdSchedule, MdCheckCircle, MdCancel, MdEdit, MdDelete, MdFilterList, MdRefresh, MdPhoneAndroid } from 'react-icons/md'

function Notifications() {
  const [activeTab, setActiveTab] = useState('send')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    userType: 'all',
    priority: 'normal',
    scheduleType: 'now'
  })

  const notificationsHistory = [
    {
      id: 1,
      title: 'New Product Launch',
      message: 'Check out our latest smartphone collection now available! Visit our store today.',
      recipients: 1250,
      sent: '2024-01-15 10:30 AM',
      status: 'delivered',
      deliveryRate: '98%',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Order Update',
      message: 'Your order #ORD-1234 has been shipped and is on the way. Track: bit.ly/track123',
      recipients: 1,
      sent: '2024-01-15 09:15 AM',
      status: 'delivered',
      deliveryRate: '100%',
      priority: 'normal'
    },
    {
      id: 3,
      title: 'Weekly Newsletter',
      message: 'Weekly deals: 20% off electronics, 15% off clothing. Use code WEEK20.',
      recipients: 3420,
      sent: '2024-01-14 08:00 AM',
      status: 'delivered',
      deliveryRate: '96%',
      priority: 'low'
    },
    {
      id: 4,
      title: 'System Maintenance',
      message: 'Maintenance tonight 12-2 AM. Services may be temporarily unavailable.',
      recipients: 850,
      sent: '2024-01-13 06:00 PM',
      status: 'delivered',
      deliveryRate: '99%',
      priority: 'high'
    }
  ]

  const users = [
    { id: 1, name: 'John Doe', phone: '+1 234 567 8901', type: 'customer', active: true },
    { id: 2, name: 'Jane Smith', phone: '+1 234 567 8902', type: 'customer', active: true },
    { id: 3, name: 'Mike Johnson', phone: '+1 234 567 8903', type: 'admin', active: true },
    { id: 4, name: 'Sarah Wilson', phone: '+1 234 567 8904', type: 'customer', active: false }
  ]

  const stats = [
    { title: 'SMS Sent', value: '12,430', icon: MdSend, color: 'blue' },
    { title: 'Delivered', value: '11,980', icon: MdCheckCircle, color: 'green' },
    { title: 'Delivery Rate', value: '96.4%', icon: MdPhoneAndroid, color: 'orange' },
    { title: 'Active Numbers', value: '8,650', icon: MdPeople, color: 'purple' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Sending notification:', { formData, selectedUsers })
    // Add notification sending logic here
    alert('Notification sent successfully!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'status-success'
      case 'pending': return 'status-warning'
      case 'failed': return 'status-danger'
      default: return 'status-secondary'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'normal': return 'priority-normal'
      case 'low': return 'priority-low'
      default: return 'priority-normal'
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">
            <MdNotifications size={24} style={{ marginRight: '10px' }} />
            Notifications
          </h1>
          <p className="page-subtitle">Manage and send notifications to users</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline">
            <MdRefresh size={16} />
            Refresh
          </button>
          <button className="btn btn-secondary">
            <MdSettings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="notification-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="notification-stat-card">
            <div className="stat-content">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="notification-tabs">
        <button
          className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <MdSend size={16} />
          Send SMS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <MdHistory size={16} />
          History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <MdSettings size={16} />
          Settings
        </button>
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="content-card">
          <h3>Send New SMS Notification</h3>
          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-grid">
              {/* SMS Details */}
              <div className="notification-details-section">
                <h4>SMS Details</h4>

                <div className="form-group">
                  <label htmlFor="title">Campaign Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter campaign title (for reference only)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">SMS Message * (Max 160 characters)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    maxLength="160"
                    placeholder="Enter your SMS message"
                  />
                  <div className={`character-count ${
                    formData.message.length > 140 ? 'warning' : ''
                  } ${formData.message.length > 155 ? 'danger' : ''}`}>
                    {formData.message.length}/160 characters
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="scheduleType">Schedule</label>
                    <select
                      id="scheduleType"
                      name="scheduleType"
                      value={formData.scheduleType}
                      onChange={handleInputChange}
                    >
                      <option value="now">Send Now</option>
                      <option value="scheduled">Schedule Later</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recipients Selection */}
              <div className="recipients-section">
                <h4>Select Recipients</h4>
                
                <div className="form-group">
                  <label htmlFor="userType">User Type</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Users</option>
                    <option value="customer">Customers Only</option>
                    <option value="admin">Admins Only</option>
                    <option value="specific">Select Specific Users</option>
                  </select>
                </div>

                {formData.userType === 'specific' && (
                  <div className="user-selection">
                    <div className="selection-header">
                      <label>Select Users</label>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="btn btn-outline btn-small"
                      >
                        {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="user-list">
                      {users.map(user => (
                        <div key={user.id} className="user-item">
                          <label className="user-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelection(user.id)}
                            />
                            <div className="user-info">
                              <div className="user-name">{user.name}</div>
                              <div className="user-phone">{user.phone}</div>
                              <span className={`user-type ${user.type}`}>{user.type}</span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="recipients-summary">
                  <div className="summary-item">
                    <strong>Total Recipients: </strong>
                    <span>
                      {formData.userType === 'specific' 
                        ? selectedUsers.length 
                        : formData.userType === 'all' 
                        ? users.length 
                        : users.filter(u => u.type === formData.userType).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <MdSend size={16} />
                Send SMS
              </button>
              <button type="button" className="btn btn-secondary">
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="content-card">
          <div className="history-header">
            <h3>SMS History</h3>
            <div className="history-filters">
              <button className="btn btn-outline">
                <MdFilterList size={16} />
                Filter
              </button>
            </div>
          </div>

          <div className="notifications-table">
            <div className="table-header">
              <div className="col-title">Campaign</div>
              <div className="col-recipients">Recipients</div>
              <div className="col-sent">Sent</div>
              <div className="col-status">Status</div>
              <div className="col-open-rate">Delivery Rate</div>
              <div className="col-priority">Priority</div>
              <div className="col-actions">Actions</div>
            </div>

            {notificationsHistory.map(notification => (
              <div key={notification.id} className="table-row">
                <div className="col-title">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-preview">{notification.message}</div>
                </div>
                <div className="col-recipients">{notification.recipients.toLocaleString()}</div>
                <div className="col-sent">{notification.sent}</div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusColor(notification.status)}`}>
                    {notification.status}
                  </span>
                </div>
                <div className="col-open-rate">{notification.deliveryRate}</div>
                <div className="col-priority">
                  <span className={`priority-badge ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                <div className="col-actions">
                  <div className="action-buttons">
                    <button className="action-btn view" title="View Details">
                      <MdMessage size={14} />
                    </button>
                    <button className="action-btn edit" title="Duplicate">
                      <MdEdit size={14} />
                    </button>
                    <button className="action-btn delete" title="Delete">
                      <MdDelete size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="content-card">
          <h3>SMS Settings</h3>
          <div className="settings-grid">
            <div className="settings-section">
              <h4>SMS Gateway Settings</h4>
              <div className="form-group">
                <label>SMS Provider</label>
                <select>
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Vonage (Nexmo)</option>
                  <option value="aws">AWS SNS</option>
                  <option value="custom">Custom Gateway</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>API Key</label>
                  <input type="password" placeholder="Enter API Key" />
                </div>
                <div className="form-group">
                  <label>API Secret</label>
                  <input type="password" placeholder="Enter API Secret" />
                </div>
              </div>
              <div className="form-group">
                <label>Sender ID/Phone Number</label>
                <input type="text" placeholder="+1234567890 or COMPANY" />
              </div>
            </div>

            <div className="settings-section">
              <h4>Default Settings</h4>
              <div className="form-group">
                <label>Default Priority</label>
                <select>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Enable delivery receipts</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Auto-retry failed SMS</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Enable rate limiting</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary">
              Save Settings
            </button>
            <button className="btn btn-secondary">
              Test SMS
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications

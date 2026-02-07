import { useState } from 'react'
import { MdSettings, MdStore, MdSecurity, MdNotifications, MdPayment, MdEmail } from 'react-icons/md'

function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    metaTitle: '',
    metaKeyword: '',
    storeTheme: 'Default',
    layout: 'Default',
    description: ''
  })

  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    storeOwnerName: '',
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    storeCity: '',
    storeState: '',
    storeCountry: '',
    storeZip: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: '30',
    passwordExpiry: '90'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
    systemUpdates: true
  })

  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'USD',
    taxRate: '10',
    enablePaypal: true,
    enableStripe: true,
    enableCod: false
  })

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStoreChange = (e) => {
    const { name, value } = e.target
    setStoreSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('General Settings:', generalSettings)
    console.log('Store Settings:', storeSettings)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">SETTINGS</h1>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          <div className="content-card">
            <div className="settings-section-header">
              <MdSettings size={20} className="section-icon" />
              <h3>General Settings</h3>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label htmlFor="metaTitle">Meta Title</label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={generalSettings.metaTitle}
                  onChange={handleGeneralChange}
                  placeholder="Title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="metaKeyword">Meta Tag Keyword</label>
                <input
                  type="text"
                  id="metaKeyword"
                  name="metaKeyword"
                  value={generalSettings.metaKeyword}
                  onChange={handleGeneralChange}
                  placeholder="Enter word"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeTheme">Store Themes</label>
                <select
                  id="storeTheme"
                  name="storeTheme"
                  value={generalSettings.storeTheme}
                  onChange={handleGeneralChange}
                >
                  <option value="Default">Default</option>
                  <option value="Modern">Modern</option>
                  <option value="Classic">Classic</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="layout">Layout</label>
                <select
                  id="layout"
                  name="layout"
                  value={generalSettings.layout}
                  onChange={handleGeneralChange}
                >
                  <option value="Default">Default</option>
                  <option value="Wide">Wide</option>
                  <option value="Boxed">Boxed</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={generalSettings.description}
                  onChange={handleGeneralChange}
                  rows="4"
                  placeholder="Type description"
                />
              </div>
            </div>
          </div>

          {/* Store Settings */}
          <div className="content-card">
            <div className="settings-section-header">
              <MdStore size={20} className="section-icon" />
              <h3>Store Settings</h3>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label htmlFor="storeName">Store Name</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={storeSettings.storeName}
                  onChange={handleStoreChange}
                  placeholder="Enter name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeOwnerName">Store Owner Full Name</label>
                <input
                  type="text"
                  id="storeOwnerName"
                  name="storeOwnerName"
                  value={storeSettings.storeOwnerName}
                  onChange={handleStoreChange}
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storePhone">Store Phone number</label>
                <input
                  type="tel"
                  id="storePhone"
                  name="storePhone"
                  value={storeSettings.storePhone}
                  onChange={handleStoreChange}
                  placeholder="Phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeEmail">Store Email</label>
                <input
                  type="email"
                  id="storeEmail"
                  name="storeEmail"
                  value={storeSettings.storeEmail}
                  onChange={handleStoreChange}
                  placeholder="Email address"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="storeAddress">Store Address</label>
                <textarea
                  id="storeAddress"
                  name="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={handleStoreChange}
                  rows="3"
                  placeholder="Enter address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeCity">Store City</label>
                <input
                  type="text"
                  id="storeCity"
                  name="storeCity"
                  value={storeSettings.storeCity}
                  onChange={handleStoreChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeState">Store State</label>
                <input
                  type="text"
                  id="storeState"
                  name="storeState"
                  value={storeSettings.storeState}
                  onChange={handleStoreChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeCountry">Store Country</label>
                <select
                  id="storeCountry"
                  name="storeCountry"
                  value={storeSettings.storeCountry}
                  onChange={handleStoreChange}
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="storeZip">Store Zip Code</label>
                <input
                  type="text"
                  id="storeZip"
                  name="storeZip"
                  value={storeSettings.storeZip}
                  onChange={handleStoreChange}
                  placeholder="Zip code"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="content-card">
            <div className="settings-section-header">
              <MdSecurity size={20} className="section-icon" />
              <h3>Security Settings</h3>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                <select
                  id="sessionTimeout"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="passwordExpiry">Password Expiry (days)</label>
                <select
                  id="passwordExpiry"
                  name="passwordExpiry"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange}
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecurityChange}
                  />
                  <span className="checkbox-text">Enable Two-Factor Authentication</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="loginNotifications"
                    checked={securitySettings.loginNotifications}
                    onChange={handleSecurityChange}
                  />
                  <span className="checkbox-text">Login Notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="content-card">
            <div className="settings-section-header">
              <MdNotifications size={20} className="section-icon" />
              <h3>Notification Settings</h3>
            </div>

            <div className="settings-form-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkbox-text">Email Notifications</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="orderNotifications"
                    checked={notificationSettings.orderNotifications}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkbox-text">Order Notifications</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkbox-text">Marketing Emails</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onChange={handleNotificationChange}
                  />
                  <span className="checkbox-text">System Updates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="content-card">
            <div className="settings-section-header">
              <MdPayment size={20} className="section-icon" />
              <h3>Payment Settings</h3>
            </div>

            <div className="settings-form-grid">
              <div className="form-group">
                <label htmlFor="currency">Default Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={paymentSettings.currency}
                  onChange={handlePaymentChange}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="taxRate">Tax Rate (%)</label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={paymentSettings.taxRate}
                  onChange={handlePaymentChange}
                  placeholder="Enter tax rate"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enablePaypal"
                    checked={paymentSettings.enablePaypal}
                    onChange={handlePaymentChange}
                  />
                  <span className="checkbox-text">Enable PayPal</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enableStripe"
                    checked={paymentSettings.enableStripe}
                    onChange={handlePaymentChange}
                  />
                  <span className="checkbox-text">Enable Stripe</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enableCod"
                    checked={paymentSettings.enableCod}
                    onChange={handlePaymentChange}
                  />
                  <span className="checkbox-text">Enable Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
            <button type="button" className="btn btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings

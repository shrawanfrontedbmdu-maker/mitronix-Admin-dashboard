import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MdDashboard,
  MdShoppingBag,
  MdCategory,
  MdShoppingCart,
  MdReceipt,
  MdSettings,
  MdPerson,
  MdGroup,
  MdNotificationAdd,
  MdReceiptLong,
  MdMiscellaneousServices,
  MdArticle,
  MdViewCarousel,
  MdAdminPanelSettings,
  MdFilterAlt,
  MdCardGiftcard,
  MdLightbulb
} from 'react-icons/md'

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div
      className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span>
              <img
                className="logo-image"
                src="https://dapper-maamoul-8bc20d.netlify.app/image/Mittronix-logo-black.png"
                alt="Logo"
              />
            </span>
          </div>
          {!isCollapsed && <span className="logo-text">Mittronix</span>}
        </div>
      </div>

      <div className="sidebar-section">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`nav-item ${isActive('/dashboard') || isActive('/') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdDashboard size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Dashboard</span>}
        </Link>

        {/* InfoCard */}
        <Link
          to="/infosection/list"
          className={`nav-item ${isActive('/infosection/list') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdCardGiftcard size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">InfoCard</span>}
        </Link>

        {/* Recommendations */}
        <Link
          to="/recommendations"
          className={`nav-item ${isActive('/recommendations') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdLightbulb size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Recommendations</span>}
        </Link>

        {/* Filter */}
        <Link
          to="/filter"
          className={`nav-item ${isActive('/filter') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdFilterAlt size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Filter</span>}
        </Link>

        {/* Products */}
        <Link
          to="/products/list"
          className={`nav-item ${location.pathname.startsWith('/products') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdShoppingBag size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Products</span>}
        </Link>

        {/* Categories */}
        <Link
          to="/categories/list"
          className={`nav-item ${location.pathname.startsWith('/categories') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdCategory size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Categories</span>}
        </Link>

        {/* Brands */}
        <Link
          to="/brands/list"
          className={`nav-item ${location.pathname.startsWith('/brands') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdGroup size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Brands</span>}
        </Link>

        {/* Inventory */}
        <Link
          to="/inventory"
          className={`nav-item ${isActive('/inventory') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdShoppingCart size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Inventory</span>}
        </Link>

        {/* Orders */}
        <Link
          to="/orders/list"
          className={`nav-item ${location.pathname.startsWith('/orders') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdReceiptLong size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Orders</span>}
        </Link>

        {/* Invoices */}
        <Link
          to="/invoices/list"
          className={`nav-item ${location.pathname.startsWith('/invoices') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdReceipt size={20} />
          </span>
          {!isCollapsed && <span className='nav-text'>Invoices</span>}
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdSettings size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Settings</span>}
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdNotificationAdd size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Notifications</span>}
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdPerson size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Profile</span>}
        </Link>

        {/* Service Requests */}
        <Link
          to="/service-requests"
          className={`nav-item ${location.pathname.startsWith('/service-requests') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdMiscellaneousServices size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Service Requests</span>}
        </Link>

        {/* Blogs */}
        <Link
          to="/blogs"
          className={`nav-item ${location.pathname.startsWith('/blogs') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdArticle size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Blogs</span>}
        </Link>

        {/* Banners */}
        <Link
          to="/banners"
          className={`nav-item ${location.pathname.startsWith('/banners') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdViewCarousel size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Banners</span>}
        </Link>

        {/* Roles */}
        <Link
          to="/roles"
          className={`nav-item ${location.pathname.startsWith('/roles') ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <MdAdminPanelSettings size={20} />
          </span>
          {!isCollapsed && <span className="nav-text">Roles</span>}
        </Link>
      </div>
    </div>
  )
}

export default Sidebar

import { Link } from 'react-router-dom'
import { MdAdd, MdCategory, MdReceiptLong, MdNoteAdd, MdGroup } from 'react-icons/md'

function QuickActions() {
  const actions = [
    { to: '/products/create', icon: <MdAdd size={18} />, label: 'Add Product' },
    { to: '/categories/create', icon: <MdCategory size={18} />, label: 'Add Category' },
    { to: '/brands/create', icon: <MdGroup size={18} />, label: 'Add Brand' },
    { to: '/orders/list', icon: <MdReceiptLong size={18} />, label: 'View Orders' },
    { to: '/orders/add', icon: <MdNoteAdd size={18} />, label: 'Add Enquiry' },
  ]

  return (
    <div className="content-card">
      <h3>Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="quick-action">
            <span className="quick-action-icon">{a.icon}</span>
            <span className="quick-action-text">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions

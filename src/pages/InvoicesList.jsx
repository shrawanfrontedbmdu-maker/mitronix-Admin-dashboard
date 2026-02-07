import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MdReceipt, MdPending, MdCheckCircle, MdCancel, MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md'
import { invoiceService } from '../api/invoiceService.js'

function InvoicesList() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthvalue, setMonthvalue] = useState('this-month');

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await invoiceService.getInvoices()
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setError('Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const thismonthinvoicesdata = async () => {
    try {
      setLoading(true)
      const invoicesData = await invoiceService.getInvoicesThisMonth()
      setInvoices(invoicesData?.data || [])
    } catch (error) {
      console.error('Error fetching Invoices:', error)
      setError('Failed to load this-month Invoices. Please try again.')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }
  const lastmonthinvoicesdata = async () => {
    try {
      setLoading(true)
      const invoicesData = await invoiceService.getInvoicesLastMonth()
      setInvoices(invoicesData?.data || [])
    } catch (error) {
      console.error('Error fetching Invoices:', error)
      setError('Failed to load last-month Invoices. Please try again.')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }
  const thisyearinvoicesData = async () => {
    try {
      setLoading(true)
      const invoicesData = await invoiceService.getInvoicesThisYear()
      setInvoices(invoicesData?.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load this-month Invoices. Please try again.')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }


  const handlemonthvalue = async (e) => {
    const value = e.target.value;
    setMonthvalue(value);

    if (value === "this-month") {
      await thismonthinvoicesdata();
    } else if (value === "last-month") {
      await lastmonthinvoicesdata();
    } else if (value === "this-year") {
      await thisyearinvoicesData();
    }
  };
  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(invoiceId)
        setInvoices(invoices.filter(invoice => invoice._id !== invoiceId))
        alert('Invoice deleted successfully!')
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Failed to delete invoice. Please try again.')
      }
    }
  }

  const calculateStats = () => {
    const total = invoices.length
    const pending = invoices?.filter(inv => inv.status === 'draft' || inv.status === 'sent').length
    const paid = invoices?.filter(inv => inv.status === 'paid').length
    const overdue = invoices?.filter(inv => inv.status === 'overdue').length

    return [
      {
        title: 'Total Invoice',
        count: total.toString(),
        icon: <MdReceipt size={24} />,
        color: 'orange'
      },
      {
        title: 'Pending Invoice',
        count: pending.toString(),
        icon: <MdPending size={24} />,
        color: 'orange'
      },
      {
        title: 'Paid Invoice',
        count: paid.toString(),
        icon: <MdCheckCircle size={24} />,
        color: 'orange'
      },
      {
        title: 'Overdue Invoice',
        count: overdue.toString(),
        icon: <MdCancel size={24} />,
        color: 'orange'
      }
    ]
  }

  const invoiceStats = calculateStats()

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'status-completed'
      case 'draft': return 'status-draft'
      case 'sent': return 'status-pending'
      case 'overdue': return 'status-cancel'
      default: return 'status-default'
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">INVOICES LIST</h1>
        </div>
        <div className="page-actions">
          <select className="time-filter" onChange={handlemonthvalue}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
          <Link to="/invoices/add" className="btn btn-primary">
            <MdAdd size={16} />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Invoice Statistics Grid */}
      <div className="orders-stats-grid">
        {invoiceStats.map((stat, index) => (
          <div key={index} className="order-stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-number">{stat.count}</div>
              </div>
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="content-card">
        <div className="table-header">
          <h3>All Invoices List ({invoices.length} invoices)</h3>
          <select className="table-filter" onChange={handlemonthvalue}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
          </select>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            marginBottom: '20px',
            padding: '12px 16px'
          }}>
            <p style={{ color: '#92400e', margin: 0, fontSize: '14px' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '20px' }}>No invoices found.</p>
            {monthvalue === "last-month" ?
              <p>Create Your First Invoice</p>
              : <Link to="/invoices/add" className="btn btn-primary">
                <MdAdd size={16} />
                Create Your First Invoice
              </Link>}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Created Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={invoice._id || index}>
                    <td>
                      <Link to={`/invoices/details/${invoice._id}`} className="order-link">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      <div className="billing-info">
                        <span>{invoice.customer?.name || 'N/A'}</span>
                        {invoice.customer?.email && (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="price-cell">₹{(invoice.total || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/invoices/details/${invoice._id}`}
                          className="action-btn view"
                          title="View Invoice"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          to={`/invoices/edit/${invoice._id}`}
                          className="action-btn edit"
                          title="Edit Invoice"
                        >
                          <MdEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice._id)}
                          className="action-btn delete"
                          title="Delete Invoice"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoicesList

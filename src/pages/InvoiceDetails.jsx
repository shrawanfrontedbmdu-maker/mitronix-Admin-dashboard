import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdArrowBack, MdPrint, MdDownload, MdEdit } from 'react-icons/md'
import { invoiceService } from '../api/invoiceService.js'
import html2pdf from "html2pdf.js";

function InvoiceDetails() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const downloadf = useRef();

  useEffect(() => {
    if (id) {
      loadInvoiceData()
    }
  }, [id])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)
      setError('')
      const invoiceData = await invoiceService.getInvoiceById(id)
      setInvoice(invoiceData)
      console.log(invoice)
    } catch (error) {
      console.error('Error loading invoice:', error)
      setError('Failed to load invoice data')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload()
  }
const handleDownloadInvoice = () => {
  if (!downloadf.current || !invoice) {
    alert("Invoice abhi load nahi hua");
    return;
  }

  html2pdf()
    .set({
      margin: 10,
      filename: `${invoice.invoiceNumber || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(downloadf.current)
    .save();
};

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      await invoiceService.updateInvoice(id, { ...invoice, status: newStatus.toLowerCase() })
      setInvoice(prev => ({ ...prev, status: newStatus }))
      setShowStatusUpdate(false)
      alert('Invoice status updated successfully!')
    } catch (error) {
      console.error('Error updating invoice status:', error)
      alert('Failed to update invoice status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'status-success'
      case 'Pending': return 'status-warning'
      case 'Overdue': return 'status-danger'
      case 'Draft': return 'status-secondary'
      default: return 'status-secondary'
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Invoice Details</h1>
            <p className="page-subtitle">Loading invoice...</p>
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
          <p>Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Invoice Details</h1>
            <p className="page-subtitle">Error loading invoice</p>
          </div>
          <div className="page-actions">
            <Link to="/invoices/list" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to Invoices
            </Link>
          </div>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626', marginBottom: '20px' }}>
            ❌ {error || 'Invoice not found'}
          </p>
          <Link to="/invoices/list" className="btn btn-primary">
            Back to Invoices List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Invoice Details</h1>
          <p className="page-subtitle">Invoice {invoice.number || invoice._id?.slice(-8) || 'Unknown'}</p>
        </div>
        <div className="page-actions">
          <Link to="/invoices/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Invoices
          </Link>
          <Link to={`/invoices/edit/${invoice._id || invoice.id || id}`} className="btn btn-outline">
            <MdEdit size={16} />
            Edit
          </Link>
          <button
            onClick={() => setShowStatusUpdate(!showStatusUpdate)}
            className="btn btn-outline"
          >
            Update Status
          </button>
          <button className="btn btn-outline" onClick={handleDownloadInvoice}>
            <MdDownload size={16} />
            Download
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <MdPrint size={16} />
            Print
          </button>
        </div>
      </div>

      {showStatusUpdate && (
        <div className="content-card" style={{ marginBottom: '20px' }}>
          <h3>Update Invoice Status</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Change status to:</span>
            {['Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updatingStatus || invoice.status === status}
                className={`btn ${invoice.status === status ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  opacity: invoice.status === status ? 0.6 : 1,
                  cursor: invoice.status === status ? 'not-allowed' : 'pointer'
                }}
              >
                {updatingStatus ? 'Updating...' : status}
              </button>
            ))}
            <button
              onClick={() => setShowStatusUpdate(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="invoice-details-container">
        <div className="content-card invoice-card" id='printableArea' ref={downloadf}>
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h2 className="company-name">{invoice.customer?.company || 'Company Name'}</h2>
              <div className="company-details">
                <p>{invoice.customer?.address || 'Address not provided'}</p>
                <p>{invoice.customer?.city || 'City not provided'}</p>
                <p>Phone: {invoice.customer?.phone || 'N/A'}</p>
                <p>Email: {invoice.customer?.email || 'N/A'}</p>
                <p>Website: {invoice.company?.website || 'N/A'}</p>
              </div>
            </div>
            <div className="invoice-meta">
              <h1 className="invoice-title">INVOICE</h1>
              <div className="invoice-number">#{invoice.number || invoice._id?.slice(-8) || 'Unknown'}</div>
              <div className="invoice-status">
                <span className={`status-badge ${getStatusColor(invoice.status || 'Draft')}`}>
                  {invoice.status || 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Info Grid */}
          <div className="invoice-info-grid">
            <div className="bill-to">
              <h3>Bill To:</h3>
              <div className="customer-details">
                <p className="customer-name">{invoice.customer?.name || 'N/A'}</p>
                <p className="customer-company">{invoice.customer?.company || 'N/A'}</p>
                <p>{invoice.customer?.address || 'Address not provided'}</p>
                <p>{invoice.customer?.city || 'City not provided'}</p>
                <p>Email: {invoice.customer?.email || 'N/A'}</p>
                <p>Phone: {invoice.customer?.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="invoice-dates">
              <div className="date-group">
                <label>Invoice Date:</label>
                <span>{invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="date-group">
                <label>Due Date:</label>
                <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="invoice-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="description-col">Description</th>
                  <th className="quantity-col">Qty</th>
                  <th className="rate-col">Rate</th>
                  <th className="amount-col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, index) => (
                  <tr key={item.id || item._id || index}>
                    <td className="description-col">{item.description || 'N/A'}</td>
                    <td className="quantity-col">{item.quantity || 0}</td>
                    <td className="rate-col">₹{(item.unitPrice || 0).toLocaleString()}</td>
                    <td className="amount-col">₹{(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="invoice-totals">
            <div className="totals-section">
              <div className="total-row">
                <span className="total-label">Subtotal:</span>
                <span className="total-value">₹{(invoice.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Discount:</span>
                <span className="total-value">-₹{(invoice.discount || 0).toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span className="total-label">Tax ({invoice.taxRate || 12}%):</span>
                <span className="total-value">₹{(invoice.tax || 0).toLocaleString()}</span>
              </div>
              <div className="total-row grand-total">
                <span className="total-label">Total:</span>
                <span className="total-value">₹{(invoice.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="payment-summary">
            <div className="payment-row">
              <span className="payment-label">Amount Paid:</span>
              <span className="payment-value">₹{(invoice.amountPaid || 0).toLocaleString()}</span>
            </div>
            <div className="payment-row balance">
              <span className="payment-label">Balance Due:</span>
              <span className="payment-value">���{(invoice.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="invoice-footer">
            <div className="notes-section">
              <h4>Notes:</h4>
              <p>Thank you for your business! Payment is due within 30 days of invoice date.</p>
            </div>
            <div className="terms-section">
              <h4>Terms & Conditions:</h4>
              <p>Please pay within the payment due date to avoid any inconvenience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetails

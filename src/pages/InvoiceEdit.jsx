import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdSave, MdAdd, MdDelete } from 'react-icons/md'
import { invoiceService } from '../api/invoiceService.js'

function InvoiceEdit() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Draft',
    customer: {
      name: '',
      company: '',
      address: '',
      city: '',
      email: '',
      phone: ''
    },
    items: [
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    notes: '',
    terms: '',
    taxRate: 0,
    discountAmount: 0
  })

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadInvoiceData()
    } else {
      setLoading(false)
    }
  }, [id])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)
      setError('')
      const invoice = await invoiceService.getInvoiceById(id)

      setFormData({
        number: invoice.number || '',
        date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        status: invoice.status || 'Draft',
        customer: {
          name: invoice.customer?.name || '',
          company: invoice.customer?.company || '',
          address: invoice.customer?.address || '',
          city: invoice.customer?.city || '',
          email: invoice.customer?.email || '',
          phone: invoice.customer?.phone || ''
        },
        items: invoice.items?.map(item => ({
          id: item.id || item._id || Date.now(),
          description: item.description || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          amount: item.amount || 0
        })) || [
          {
            id: Date.now(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
          }
        ],
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        taxRate: invoice.taxRate || 0,
        discountAmount: invoice.discountAmount || 0
      })
    } catch (error) {
      console.error('Error loading invoice:', error)
      setError('Failed to load invoice data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('customer.')) {
      const customerField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity
      const rate = field === 'rate' ? parseFloat(value) || 0 : updatedItems[index].rate
      updatedItems[index].amount = quantity * rate
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0)
    const tax = (subtotal * formData.taxRate) / 100
    const total = subtotal + tax - formData.discountAmount
    return { subtotal, tax, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setError('')

    try {
      const { subtotal, tax, total } = calculateTotals()

      const invoiceData = {
        number: formData.number,
        date: new Date(formData.date),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        status: formData.status,
        customer: formData.customer,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        notes: formData.notes || '',
        terms: formData.terms || '',
        taxRate: parseFloat(formData.taxRate) || 0,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        subtotal: subtotal,
        tax: tax,
        total: total,
        amountPaid: 0,
        balance: total
      }

      await invoiceService.updateInvoice(id, invoiceData)
      alert('Invoice updated successfully!')
      navigate(`/invoices/details/${id}`)
    } catch (error) {
      console.error('Error updating invoice:', error)
      setError(error.message || 'Failed to update invoice. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const { subtotal, tax, total } = calculateTotals()

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Edit Invoice</h1>
            <p className="page-subtitle">Loading invoice data...</p>
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
          <p>Loading invoice...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Edit Invoice</h1>
          <p className="page-subtitle">Edit invoice #{formData.number}</p>
        </div>
        <div className="page-actions">
          <Link to={`/invoices/details/${id}`} className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Details
          </Link>
        </div>
      </div>

      <div className="form-container">
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            marginBottom: '20px',
            padding: '12px 16px'
          }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>
              ❌ {error}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-grid">
            {/* Invoice Details */}
            <div className="content-card">
              <h3>Invoice Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="number">Invoice Number *</label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                    placeholder="INV-2024-001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Invoice Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="content-card">
              <h3>Customer Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer.name">Customer Name *</label>
                  <input
                    type="text"
                    id="customer.name"
                    name="customer.name"
                    value={formData.customer.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customer.company">Company</label>
                  <input
                    type="text"
                    id="customer.company"
                    name="customer.company"
                    value={formData.customer.company}
                    onChange={handleInputChange}
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer.email">Email *</label>
                  <input
                    type="email"
                    id="customer.email"
                    name="customer.email"
                    value={formData.customer.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customer.phone">Phone</label>
                  <input
                    type="tel"
                    id="customer.phone"
                    name="customer.phone"
                    value={formData.customer.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer.address">Address</label>
                <input
                  type="text"
                  id="customer.address"
                  name="customer.address"
                  value={formData.customer.address}
                  onChange={handleInputChange}
                  placeholder="456 Customer Avenue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer.city">City</label>
                <input
                  type="text"
                  id="customer.city"
                  name="customer.city"
                  value={formData.customer.city}
                  onChange={handleInputChange}
                  placeholder="Mumbai, MH 400001"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="content-card">
            <div className="section-header">
              <h3>Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-primary btn-small"
              >
                <MdAdd size={16} />
                Add Item
              </button>
            </div>

            <div className="items-table">
              <div className="table-header">
                <div className="col-description">Description</div>
                <div className="col-quantity">Qty</div>
                <div className="col-rate">Rate (₹)</div>
                <div className="col-amount">Amount</div>
                <div className="col-actions">Actions</div>
              </div>

              {formData.items.map((item, index) => (
                <div key={item.id} className="table-row">
                  <div className="col-description">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-rate">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <div className="col-amount">
                    <span className="amount-display">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="col-actions">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="action-btn delete"
                      disabled={formData.items.length === 1}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="invoice-totals">
              <div className="totals-section">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="taxRate">Tax Rate (%)</label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="discountAmount">Discount Amount (₹)</label>
                    <input
                      type="number"
                      id="discountAmount"
                      name="discountAmount"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="totals-display">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>-₹{formData.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="content-card">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Thank you for your business! Payment terms: Net 30 days."
              />
            </div>

            <div className="form-group">
              <label htmlFor="terms">Terms & Conditions</label>
              <textarea
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows="3"
                placeholder="All sales are final. Returns accepted within 7 days."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={updating}>
              <MdSave size={16} />
              {updating ? 'Updating Invoice...' : 'Update Invoice'}
            </button>
            <Link to={`/invoices/details/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceEdit

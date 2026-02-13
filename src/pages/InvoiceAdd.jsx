import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdArrowBack, MdSave, MdAdd, MdDelete } from "react-icons/md";
import { invoiceService } from "../api/invoiceService.js";
import { useEffect } from "react";
import { orderService } from "../api/orderService.js"

function InvoiceAdd() {
  const navigate = useNavigate();
  const [order, setOrder] = useState([])
  let [invoice, setinvoice] = useState("");
  const [loading,setLoading] = useState(false);
  const [error ,setError] =useState("")
  const { id } = useParams()
  const [formData, setFormData] = useState({
    number: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Draft",
    customer: {
      name: "",
      company: "",
      address: "",
      city: "",
      email: "",
      phone: "",
    },
    items: [{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }],
    notes: "",
    terms: "",
    taxRate: 12,
    discountAmount: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("customer.")) {
      const customerField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (id) {
      loadOrderData()
    } else {
      getIvoicenumber()
    }
  }, [id])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      setError('')

      // Get all orders and find the one with matching ID
      const orders = await orderService.getOrders()
      const invoicenumber = await invoiceService.getInvoicesNumber()
      const foundOrder = orders.find(o => o._id === id)

      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError('Order not found')
      }
      if (invoicenumber) {
        setinvoice(invoicenumber)
      } else {
        setError("No any Invoice Number")
      }
    } catch (error) {
      console.error('Error loading order:', error)
      setError('Failed to load order data')
    } finally {
      setLoading(false)
    }
  }

  const getIvoicenumber = async () => {
    try {
      setLoading(true)
      setError("")
      const invoicenumber = await invoiceService.getInvoicesNumber()
      if (invoicenumber) {
        setinvoice(invoicenumber)
      } else {
        setError("No any Invoice Number")
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "rate") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : updatedItems[index].quantity;
      const rate =
        field === "rate" ? parseFloat(value) || 0 : updatedItems[index].rate;
      updatedItems[index].amount = quantity * rate;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = (subtotal * formData.taxRate) / 100;
    const total = subtotal + tax - formData.discountAmount;
    return { subtotal, tax, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invoiceNumber = formData?.number?.trim();
    const customerName = formData?.customer?.name?.trim();
    const customerEmail = formData?.customer?.email?.trim();
    const customerAddress = formData?.customer?.address?.trim();
    const customerPhone = formData?.customer?.phone?.trim();
    const customerCity = formData?.customer?.city?.trim();
    const customerCompany = formData?.customer?.company?.trim();
    const taxRate = parseFloat(formData?.taxRate) || 0;
    const dueDate = new Date(formData?.dueDate);
    const notes = formData?.notes || "";
    const termsAndConditions = formData?.termsAndConditions || "";
    const items = Array.isArray(formData?.items) ? formData.items : [];

    if (!invoiceNumber || !customerName || items.length === 0) {
      alert("Please fill all required fields: invoice number, customer name, and at least one item.");
      return;
    }

    const mappedItems = items.map((item, i) => {
      const description = item.description?.trim();
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.rate);
      const total = quantity * unitPrice;

      console.log(`Item ${i}:`, { description, quantity, unitPrice, total });

      return {
        description,
        quantity,
        unitPrice,
        total
      };
    });

    const orderData = {
      invoiceNumber,
      customer: {
        name: customerName,
        email: customerEmail,
        address: customerAddress,
        phone: customerPhone,
        city: customerCity,
        company: customerCompany
      },
      items: mappedItems,
      tax: taxRate,
      dueDate,
      notes,
      termsAndConditions
    };

    invoiceService.createInvoice(orderData)
      .then(response => {
        console.log('Invoice created successfully:', response);
        navigate('/invoices/list');
      })
      .catch(error => {
        console.error('Error creating invoice:', error);
        alert('Failed to create invoice: ' + error.message);
      });
  };


  const { subtotal, tax, total } = calculateTotals();

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Create Invoice</h1>
          <p className="page-subtitle">Create a new invoice</p>
        </div>
        <div className="page-actions">
          <Link to="/invoices/list" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Invoices
          </Link>
        </div>
      </div>

      <div className="form-container">
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
                    placeholder="john@example.com"
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
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer.address">Address</label>
                <textarea
                  id="customer.address"
                  name="customer.address"
                  value={formData.customer.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="123 Customer Street"
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
                  placeholder="New York, NY 10001"
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
                className="btn btn-outline"
              >
                <MdAdd size={16} />
                Add Item
              </button>
            </div>

            <div className="items-table">
              <div className="table-header">
                <div className="col-description">Description</div>
                <div className="col-quantity">Qty</div>
                <div className="col-rate">Rate</div>
                <div className="col-amount">Amount</div>
                <div className="col-actions">Actions</div>
              </div>

              {formData.items.map((item, index) => (
                <div key={item.id} className="table-row">
                  <div className="col-description">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-rate">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-amount">
                    <span className="amount-display">
                      ₹{item.amount.toLocaleString()}
                    </span>
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
                    <label htmlFor="discountAmount">Discount Amount</label>
                    <input
                      type="number"
                      id="discountAmount"
                      name="discountAmount"
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
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
                placeholder="Thank you for your business!"
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
                placeholder="Please pay within 30 days..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <MdSave size={16} />
              Create Invoice
            </button>
            <Link to="/invoices/list" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceAdd;

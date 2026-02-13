import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { couponsService } from "../api/couponsService.js"
export default function CouponsList() {
  const [AllCoupons, setAllcoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const responce = await couponsService.getAllCoupons()
      if (responce) {
        console.log(responce.data);
        setAllcoupons(responce?.data);
      } else {
        setError(responce.message);
      }
    } catch (error) {
      console.log(error.message || "Feild to load coupons data")
      setError(error.message || "Feild to load coupons data")
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p>Loading orders...</p>
    </div>
  }
  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">
            Coupons
          </h1>
        </div>
        <div className="page-actions">
          <Link to="/coupons/create" className="btn btn-primary">
            <MdAdd size={20} />
            Create New Coupons
          </Link>
        </div>
      </div>
      <div className="content-card">
        <div className="table-container">
          <table className='data-table'>
            <thead>
              <tr>
                <th>SR. NO</th>
                <th>CODE</th>
                <th>DISCOUNT</th>
                <th>MIN ORDER</th>
                <th>MAX DISCOUNT</th>
                <th>START DATE</th>
                <th>EXPIRY DATE</th>
                <th>VISIBILITY</th>
                <th>PLATFORM</th>
                <th>FIRST PURCHASE</th>
                <th>USAGE/CUSTOMER</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {AllCoupons?.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.code}</strong></td>

                  <td>
                    {item.discountType === "percentage"
                      ? `${item.discountValue}%`
                      : `₹${item.discountValue}`}
                  </td>

                  <td>₹{item.minOrderValue}</td>
                  <td>₹{item.maxDiscount}</td>

                  <td>{new Date(item.startDate).toLocaleDateString()}</td>
                  <td>{new Date(item.expiryDate).toLocaleDateString()}</td>

                  <td style={{ textTransform: "capitalize" }}>{item.visibility}</td>

                  <td style={{ textTransform: "capitalize" }}>
                    {item.platform === "both" ? "both" : item.platform}
                  </td>

                  <td>{item.firstPurchaseOnly ? "Yes" : "No"}</td>

                  <td>{item.perCustomerLimit}</td>

                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/coupons/update/${item._id}`}
                        className="action-btn edit"
                        title="Edit Order"
                      >
                        <MdEdit size={16} />
                      </Link>
                      <button
                        className="action-btn delete"
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
      </div>
    </>
  )
}

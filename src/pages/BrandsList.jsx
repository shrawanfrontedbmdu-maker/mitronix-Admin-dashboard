import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { brandService } from '../api/brandService.js'
import { MdEdit, MdDelete } from 'react-icons/md'
import './brands.css'

function BrandsList() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await brandService.getBrands()
        setBrands(data || [])
      } catch (err) {
        setError('Failed to load brands')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return
    try {
      await brandService.deleteBrand(id)
      setBrands(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      alert('Failed to delete brand')
    }
  }

  return (
    <div className="brands-page">
      <div className="page-title-section">
        <h1 className="page-title">Brands</h1>
        <p className="page-subtitle">Manage product brands</p>
      </div>

      <div className="page-actions">
        <Link to="/brands/create" className="btn btn-primary">Add Brand</Link>
      </div>

      <div className="content-card">
        <h3>Brands</h3>
        {loading && <div>Loading brands...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <div className="data-table brands-table">
            <div className="table-header">
              <div>Name</div>
              <div>Actions</div>
            </div>

            {brands.map((b) => (
              <div className="table-row" key={b._id || b.name}>
                <div
                  className="brand-name"
                  style={{ textTransform: "capitalize" }}
                >
                  {b.name}
                </div>                <div className="brand-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/brands/edit/${b._id}`)}>
                    <MdEdit size={16} /> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b._id)}>
                    <MdDelete size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}

            {brands.length === 0 && <div className="table-row"><div>No brands available</div></div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandsList

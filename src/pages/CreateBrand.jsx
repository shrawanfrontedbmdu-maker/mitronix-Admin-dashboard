import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { brandService } from '../api/brandService.js'
import { MdSave } from 'react-icons/md'

function CreateBrand() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a brand name')
      return
    }
    try {
      setLoading(true)
      await brandService.createBrand({ name: name.trim() })
      navigate('/brands/list')
    } catch (err) {
      setError('Failed to create brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">Create Brand</h1>
        <p className="page-subtitle">Add a new product brand</p>
      </div>

      <div className="content-card">
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label htmlFor="name">Brand Name *</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter brand name" required />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">
              <MdSave size={16} /> {loading ? 'Creating...' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBrand

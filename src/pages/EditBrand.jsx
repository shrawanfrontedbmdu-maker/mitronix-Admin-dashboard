import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { brandService } from '../api/brandService.js'
import { MdSave } from 'react-icons/md'

function EditBrand() {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const list = await brandService.getBrands()
        const brand = list.find(b => b._id === id || String(b._id) === String(id))
        if (!brand) {
          setError('Brand not found')
          return
        }
        setName(brand.name || '')
      } catch (err) {
        setError('Failed to load brand')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Please enter a brand name')
    try {
      setSaving(true)
      await brandService.updateBrand(id, { name: name.trim() })
      alert('Brand updated')
      navigate('/brands/list')
    } catch (err) {
      setError('Failed to update brand')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">Edit Brand</h1>
        <p className="page-subtitle">Update brand information</p>
      </div>

      <div className="content-card">
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label htmlFor="name">Brand Name *</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">
              <MdSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBrand

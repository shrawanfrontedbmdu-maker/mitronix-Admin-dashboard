import React, { useEffect, useState } from 'react'
import { productService } from '../api/productService.js'

function InventoryList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await productService.getProducts()
        setProducts(data)
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const reorder = async (p) => {
    const qty = parseInt(prompt('Enter quantity to add', '10'), 10)
    if (!qty || qty <= 0) return
    try {
      const updated = { ...p, stockQuantity: (p.stockQuantity || 0) + qty }
      await productService.updateProduct(p._id || p.id || p.slug, updated)
      setProducts(prev => prev.map(item => (item._id === p._id ? updated : item)))
      alert('Stock updated')
    } catch (err) {
      alert('Failed to update stock')
    }
  }

  const lowThreshold = 5
  const lowStock = products.filter(p => (p.stockQuantity || 0) <= lowThreshold)

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">Inventory Control</h1>
        <p className="page-subtitle">Monitor stock levels and manage reorders</p>
      </div>

      <div className="content-card">
        <h3>Low Stock Alerts ({lowStock.length})</h3>
        {loading && <div>Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="products-table">
            <div className="table-header">
              <div>Product</div>
              <div>Brand</div>
              <div>Stock</div>
              <div>Reorder</div>
            </div>
            {products.map(p => (
              <div className={`table-row ${((p.stockQuantity || 0) <= lowThreshold) ? 'low-stock' : ''}`} key={p._id || p.slug || p.name}>
                <div className="col-product">
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-details">{p.sku || ''}</div>
                  </div>
                </div>
                <div>{p.brand || '-'}</div>
                <div>{p.stockQuantity || 0}</div>
                <div>
                  {(p.stockQuantity || 0) <= lowThreshold ? (
                    <button className="btn btn-sm btn-primary" onClick={() => reorder(p)}>Reorder</button>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryList

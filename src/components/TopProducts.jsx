import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../api/orderService.js'
import { productService } from '../api/productService.js'

function TopProducts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [orders, products] = await Promise.all([
          orderService.getOrders(),
          productService.getProducts()
        ])

        // Build sales counts by product id or name
        const salesMap = new Map()
        const inc = (key) => salesMap.set(key, (salesMap.get(key) || 0) + 1)

        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            const list = Array.isArray(o.products) ? o.products : []
            list.forEach((p) => {
              const key = p?.productId || p?._id || p?.id || p?.name
              if (key) inc(key)
            })
          })
        }

        // Normalize products to join with counts
        const productList = Array.isArray(products) ? products : []
        const enriched = productList.map((p) => {
          const key = p?._id || p?.id || p?.name
          const sales = salesMap.get(key) || 0
          return { id: key, name: p?.name || 'Unnamed', image: p?.images?.[0]?.url, sales, stock: p?.stockQuantity ?? 0, brand: p?.brand || '' }
        })

        // If there are no recorded sales, prioritize low-stock items as a proxy of demand
        const sorted = enriched.sort((a, b) => {
          if (a.sales !== b.sales) return b.sales - a.sales
          // tie-breaker: lower stock first (potentially higher demand)
          return (a.stock ?? 0) - (b.stock ?? 0)
        })

        setItems(sorted.slice(0, 5))
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="content-card">
      <div className="table-header">
        <h3>Top Products</h3>
        <Link className="view-all-link" to="/products/list">View all</Link>
      </div>

      {loading ? (
        <div className="centered-message">Loading...</div>
      ) : items.length === 0 ? (
        <div className="centered-message">No data available</div>
      ) : (
        <div className="table">
          <div className="table-row table-header-row">
            <div>Product</div>
            <div>Brand</div>
            <div>Sales Count</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="table-row">
              <div className="row-with-thumb">
                {item.image && <img src={item.image} alt="" className="mini-thumb" />}
                <span className="product-name">{item.name}</span>
              </div>
              <div>{item.brand || '-'}</div>
              <div>{item.sales}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TopProducts

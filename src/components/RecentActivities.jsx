import { useEffect, useState } from 'react'
import { orderService } from '../api/orderService.js'

function RecentActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const orders = await orderService.getOrders()
        const rows = (Array.isArray(orders) ? orders : [])
          .sort((a, b) => new Date(b.createdAt || b.orderDate || 0) - new Date(a.createdAt || a.orderDate || 0))
          .slice(0, 6)
          .map((o, idx) => ({
            id: o._id || `order-${idx}`,
            user: o.customerName || 'Customer',
            type: o.orderStatus ? `Order ${o.orderStatus}` : 'Order Created',
            time: new Date(o.createdAt || o.orderDate || Date.now()).toLocaleString()
          }))
        setActivities(rows)
      } catch (e) {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="content-card">
      <div className="table-header">
        <h3>Recent Activities</h3>
      </div>
      {loading ? (
        <div className="centered-message">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="centered-message">No recent activities</div>
      ) : (
        <div className="table">
          <div className="table-row table-header-row three-col-grid">
            <div>User</div>
            <div>Action Type</div>
            <div>Time</div>
          </div>
          {activities.map((a) => (
            <div key={a.id} className="table-row three-col-grid">
              <div>{a.user}</div>
              <div>{a.type}</div>
              <div>{a.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivities

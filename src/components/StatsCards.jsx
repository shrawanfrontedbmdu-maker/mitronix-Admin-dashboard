import { MdShoppingCart, MdGroup, MdTrendingUp, MdAttachMoney } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService.js'

function StatsCards() {
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    completedOrders: 0,
    totalRevenue: 0,
    ordersChange: '0.0',
    customersChange: '0.0',
    completedOrdersChange: '0.3',
    revenueChange: '10.6'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await dashboardService.getDashboardStats()
        setDashboardStats(stats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const formatNumber = (num) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount}`
  }

  const stats = [
    {
      icon: <MdShoppingCart size={20} />,
      iconClass: 'orange',
      value: loading ? '...' : formatNumber(dashboardStats.totalOrders),
      label: 'Total Orders',
      change: `${parseFloat(dashboardStats.ordersChange) >= 0 ? '+' : ''}${dashboardStats.ordersChange}%`,
      changeType: parseFloat(dashboardStats.ordersChange) >= 0 ? 'positive' : 'negative',
      period: 'Last Month'
    },
    {
      icon: <MdGroup size={20} />,
      iconClass: 'blue',
      value: loading ? '...' : formatNumber(dashboardStats.totalCustomers),
      label: 'Total Customers',
      change: `${parseFloat(dashboardStats.customersChange) >= 0 ? '+' : ''}${dashboardStats.customersChange}%`,
      changeType: parseFloat(dashboardStats.customersChange) >= 0 ? 'positive' : 'negative',
      period: 'Last Month'
    },
    {
      icon: <MdTrendingUp size={20} />,
      iconClass: 'orange',
      value: loading ? '...' : formatNumber(dashboardStats.completedOrders),
      label: 'Completed Orders',
      change: `+${dashboardStats.completedOrdersChange}%`,
      changeType: 'positive',
      period: 'Last Month'
    },
    {
      icon: <MdAttachMoney size={20} />,
      iconClass: 'red',
      value: loading ? '...' : formatCurrency(dashboardStats.totalRevenue),
      label: 'Payment Received',
      change: `+${dashboardStats.revenueChange}%`,
      changeType: 'positive',
      period: 'Last Month'
    }
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-header">
            <div className={`stat-icon ${stat.iconClass}`}>
              {stat.icon}
            </div>
          </div>
          
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
          
          <div className={`stat-change ${stat.changeType}`}>
            {stat.changeType === 'positive' ? '↗' : '��'} {stat.change} {stat.period}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
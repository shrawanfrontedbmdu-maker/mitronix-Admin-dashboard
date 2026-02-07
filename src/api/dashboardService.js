import { instance } from './axios.config.js'
import { orderService } from './orderService.js'
import { productService } from './productService.js'

export const dashboardService = {
  getDashboardStats: async () => {
    try {
      // Fetch data from multiple endpoints concurrently but resilient to partial failures
      const results = await Promise.allSettled([
        orderService.getOrders(),
        orderService.getOrdersThisMonth(),
        orderService.getOrdersLastMonth(),
        productService.getProducts()
      ])

      const orders = results[0].status === 'fulfilled' ? results[0].value : []
      const ordersThisMonth = results[1].status === 'fulfilled' ? results[1].value : { count: 0, data: [] }
      const ordersLastMonth = results[2].status === 'fulfilled' ? results[2].value : { count: 0, data: [] }
      const products = results[3].status === 'fulfilled' ? results[3].value : []

      // Log any rejections for debugging
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          console.warn(`dashboardService: API call index ${idx} failed:`, r.reason?.message || r.reason)
        }
      })

      // Calculate stats safely
      const totalOrders = Array.isArray(orders) ? orders.length : 0
      const ordersThisMonthCount = ordersThisMonth?.count || (Array.isArray(ordersThisMonth) ? ordersThisMonth.length : 0)
      const ordersLastMonthCount = ordersLastMonth?.count || (Array.isArray(ordersLastMonth) ? ordersLastMonth.length : 0)

      const completedOrders = Array.isArray(orders)
        ? orders.filter(order => order.orderStatus === 'Completed' || order.orderStatus === 'Delivered').length
        : 0

      const totalRevenue = Array.isArray(ordersThisMonth?.data)
        ? ordersThisMonth.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        : 0

      const ordersChange = ordersLastMonthCount > 0
        ? ((ordersThisMonthCount - ordersLastMonthCount) / ordersLastMonthCount * 100).toFixed(1)
        : '0.0'

      const uniqueCustomers = Array.isArray(orders) ? new Set(orders.map(order => order.customerName || order.customerId)).size : 0
      const lastMonthCustomers = Array.isArray(ordersLastMonth?.data) ? new Set(ordersLastMonth.data.map(order => order.customerName || order.customerId)).size : 0

      const customersChange = lastMonthCustomers > 0
        ? ((uniqueCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
        : '0.0'

      return {
        totalOrders,
        totalCustomers: uniqueCustomers,
        completedOrders,
        totalRevenue,
        ordersChange,
        customersChange,
        completedOrdersChange: '0.3', // Default value as this needs historical data
        revenueChange: '10.6' // Default value as this needs historical comparison
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalOrders: 0,
        totalCustomers: 0,
        completedOrders: 0,
        totalRevenue: 0,
        ordersChange: '0.0',
        customersChange: '0.0',
        completedOrdersChange: '0.0',
        revenueChange: '0.0'
      }
    }
  }
}

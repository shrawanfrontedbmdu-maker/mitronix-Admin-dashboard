import { instance } from './axios.config.js'

export const healthService = {
  checkConnection: async () => {
    try {
      const response = await instance.get('/')
      return response.data
    } catch (error) {
      // Try alternative endpoints if health endpoint doesn't exist
      try {
        await instance.get('/category')
        return { status: 'ok', message: 'API connection successful' }
      } catch (secondError) {
        throw new Error('API connection failed')
      }
    }
  }
}

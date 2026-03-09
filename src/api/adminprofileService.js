import { instance } from './axios.config.js'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const adminProfileService = {

  // ── GET /me ─────────────────────────────────────────────
  getProfile: async () => {
    try {
      const response = await instance.get('/admin/profile/me')
      return response.data
    } catch (error) {
      console.log("Get Profile Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

  // ── POST /create ─────────────────────────────────────────
  createProfile: async (profileData) => {
    try {
      const response = await instance.post('/admin/profile/create', profileData)
      return response.data
    } catch (error) {
      console.log("Create Profile Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

  // ── PUT /me ──────────────────────────────────────────────
  updateProfile: async (profileData) => {
    try {
      const response = await instance.put('/admin/profile/me', profileData)
      return response.data
    } catch (error) {
      console.log("Update Profile Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

  // ── DELETE /me ───────────────────────────────────────────
  deleteProfile: async () => {
    try {
      const response = await instance.delete('/admin/profile/me')
      return response.data
    } catch (error) {
      console.log("Delete Profile Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

  // ── POST /me/avatar ──────────────────────────────────────
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await instance.post('/admin/profile/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      console.log("Upload Avatar Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

  // ── DELETE /me/avatar ────────────────────────────────────
  deleteAvatar: async () => {
    try {
      const response = await instance.delete('/admin/profile/me/avatar')
      return response.data
    } catch (error) {
      console.log("Delete Avatar Error:", error.response?.data || error.message)
      await delay(500)
      throw error
    }
  },

}

export default adminProfileService
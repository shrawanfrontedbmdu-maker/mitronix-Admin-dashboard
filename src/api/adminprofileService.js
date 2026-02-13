import { instance } from './axios.config.js'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const adminProfileService = {

    getProfile: async () => {
        try {
            const response = await instance.get('/adminprofile')
            return response.data
        } catch (error) {
            console.log("Get Profile Error:", error.response?.data || error.message)
            await delay(500)
            throw error
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await instance.put('/adminprofile/update', profileData)
            return response.data
        } catch (error) {
            console.log("Update Profile Error:", error.response?.data || error.message)
            await delay(500)
            throw error
        }
    }

}

export default adminProfileService

import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const setAuthToken = (token: string | null) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axiosInstance.defaults.headers.common['Authorization']
    }
}

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data &&
            error.response.data.message === 'Unauthorized'
        ) {
            const authStore = useAuthStore()
            authStore.logout()
        }
        return Promise.reject(error)
    }
)

export default axiosInstance

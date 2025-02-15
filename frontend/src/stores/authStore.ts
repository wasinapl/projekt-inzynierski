import { defineStore } from 'pinia'
import { setAuthToken } from '@/services/axiosInstance'
import type { User } from '@/types/User'
import userService from '@/services/userService'

interface AuthState {
    token: string | null
    user: User | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: null,
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        setAuthData(token: string) {
            this.token = token
            localStorage.setItem('token', token)
            setAuthToken(token)
        },
        async load() {
            const token = localStorage.getItem('token')
            setAuthToken(token)
            if (token) {
                this.token = token
                const user = await userService.get()
                if (user) {
                    this.user = user
                } else {
                    this.logout()
                    return Promise.reject('Invalid token')
                }
            } else {
                return Promise.reject('Not logged in')
            }
        },
        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
        },
        getToken() {
            return this.token
        },
    },
})

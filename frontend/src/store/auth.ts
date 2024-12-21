import { defineStore } from 'pinia'

interface AuthState {
    token: string | null
    user: { email: string } | null
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
            // this.user = user
            localStorage.setItem('token', token)
            // localStorage.setItem('user', JSON.stringify(user))
        },
        loadFromStorage() {
            const token = localStorage.getItem('token')
            // const user = localStorage.getItem('user')
            if (token) {
                this.token = token
                // this.user = JSON.parse(user)
            }
        },
        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            return Promise.resolve()
            // localStorage.removeItem('user')
        },
    },
})

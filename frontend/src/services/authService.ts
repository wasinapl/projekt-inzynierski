import axiosInstance from './axiosInstance'

export async function login(email: string, password: string) {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
}

export async function register(name: string, email: string, password: string) {
    const response = await axiosInstance.post('/auth/register', { name, email, password })
    return response.data
}

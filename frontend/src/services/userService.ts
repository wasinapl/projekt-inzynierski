import axiosInstance from './axiosInstance'

export class UserService {
    async get() {
        const response = await axiosInstance.get('/user')
        return response.data
    }
}

export default new UserService()

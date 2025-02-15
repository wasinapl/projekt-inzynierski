import type { CreateThreadDTO } from '@/types/dto/ThreadDTO'
import axiosInstance from './axiosInstance'

class ThreadsService {
    async getAllThreads() {
        const response = await axiosInstance.get(`/threads`)
        return response.data
    }
    async getThreadByCode(code: string) {
        const response = await axiosInstance.get(`/threads/${code}`)
        return response.data
    }

    async createThread(data: CreateThreadDTO) {
        const response = await axiosInstance.post('/threads', {
            documentsSetCode: data.documentsSetCode,
        })
        return response.data
    }
}

export default new ThreadsService()

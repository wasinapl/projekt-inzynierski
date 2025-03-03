import type { CreateDocumentsSetDTO, ModifyDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'
import axiosInstance from './axiosInstance'

export class DocumentsSetsService {
    async getAllDocumentsSets(
        page: number = 1,
        limit: number = 10,
        sortBy?: string,
        order?: 'asc' | 'desc'
    ) {
        const response = await axiosInstance.get('/documents-sets', {
            params: {
                page,
                limit,
                sortBy,
                order,
            },
        })
        return response.data
    }

    async getDocumentsSetByCode(code: string) {
        const response = await axiosInstance.get(`/documents-sets/${code}`)
        return response.data
    }

    async createDocumentsSet(data: CreateDocumentsSetDTO) {
        const response = await axiosInstance.post('/documents-sets', {
            name: data.name,
            description: data.description,
            public: data.public,
        })
        return response.data
    }

    async updateDocumentsSet(code: string, data: ModifyDocumentsSetDTO) {
        const response = await axiosInstance.put(`/documents-sets/${code}`, {
            name: data.name,
            description: data.description,
            public: data.public,
        })
        return response.data
    }

    async deleteDocumentsSet(code: string) {
        const response = await axiosInstance.delete(`/documents-sets/${code}`)
        return response.data
    }
}

export default new DocumentsSetsService()

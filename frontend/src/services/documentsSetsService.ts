import type { CreateDocumentsSetDTO, ModifyDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'
import axiosInstance from './axiosInstance'

export class DocumentsSetsService {
    async getAllDocumentsSets() {
        const response = await axiosInstance.get('/documents-sets')
        return response.data
    }

    async getDocumentsSetByCode(code: string) {
        const response = await axiosInstance.get(`/documents-sets/${code}`)
        return response.data
    }

    async createDocumentsSetByText(data: CreateDocumentsSetDTO) {
        const response = await axiosInstance.post('/documents-sets', { name: data.name })
        return response.data
    }

    async updateDocumentsSet(code: string, data: ModifyDocumentsSetDTO) {
        const response = await axiosInstance.put(`/documents-sets/${code}`, { name: data.name })
        return response.data
    }

    async deleteDocumentsSet(code: string) {
        const response = await axiosInstance.delete(`/documents-sets/${code}`)
        return response.data
    }
}

export default new DocumentsSetsService()

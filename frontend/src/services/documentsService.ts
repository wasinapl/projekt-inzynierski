import type {
    CreateDocumentFromFileDTO,
    CreateDocumentFromTextDTO,
    ModifyDocumentDTO,
} from '@/types/dto/DocumentDTO'
import axiosInstance from './axiosInstance'

export class DocumentsService {
    async getDocumentByCode(code: string) {
        const response = await axiosInstance.get(`/documents/${code}`)
        return response.data
    }

    async createDocumentFromText(data: CreateDocumentFromTextDTO) {
        const response = await axiosInstance.post('/documents/from-text', {
            documentsSetCode: data.documentsSetCode,
            title: data.title,
            content: data.content,
        })
        return response.data
    }

    async createDocumentFromFile(data: CreateDocumentFromFileDTO) {
        const formData = new FormData()

        formData.append('file', data.file)
        formData.append('documentsSetCode', data.documentsSetCode)

        const response = await axiosInstance.post('/documents/from-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return response.data
    }

    async updateDocument(code: string, data: ModifyDocumentDTO) {
        const response = await axiosInstance.put(`/documents/${code}`, {
            title: data.title,
            content: data.content,
        })
        return response.data
    }

    async deleteDocument(code: string) {
        const response = await axiosInstance.delete(`/documents/${code}`)
        return response.data
    }
}

export default new DocumentsService()

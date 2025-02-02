import { defineStore } from 'pinia'
import DocumentsService from '@/services/documentsService'
import type { Document } from '@/types/Document'
import type { CreateDocumentFromTextDTO, ModifyDocumentDTO } from '@/types/dto/DocumentDTO'

interface DocumentsState {
    document: {
        data: Document | null
        loading: boolean
    }
}

export const useDocumentsStore = defineStore('documents', {
    state: (): DocumentsState => ({
        document: {
            data: null,
            loading: false,
        },
    }),
    actions: {
        async fetchDocument(code: string) {
            this.document.loading = true
            this.document.data = await DocumentsService.getDocumentByCode(code)
            this.document.loading = false
        },
        async createDocumentFromText(data: CreateDocumentFromTextDTO) {
            await DocumentsService.createDocumentFromText(data)
        },
        async updateDocument(code: string, data: ModifyDocumentDTO) {
            await DocumentsService.updateDocument(code, data)
        },
        async deleteDocument(code: string) {
            await DocumentsService.deleteDocument(code)
        },
    },
})

import { defineStore } from 'pinia'
import DocumentsSetsService from '../services/documentsSetsService'
import type { DocumentsSet } from '@/types/DocumentsSet'
import type { CreateDocumentsSetDTO, ModifyDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'

interface DocumentsSetsState {
    documentsSets: {
        data: DocumentsSet[]
        loading: boolean
    },
    documentsSet: {
        data: DocumentsSet | null
        loading: boolean
    }
}

export const useDocumentsSetsStore = defineStore('documentsSets', {
    state: (): DocumentsSetsState => ({
        documentsSets: {
            data: [],
            loading: false,
        },
        documentsSet: {
            data: null,
            loading: false,
        },
    }),
    actions: {
        async fetchDocumentsSets() {
            this.documentsSets.loading = true
            this.documentsSets.data = await DocumentsSetsService.getAllDocumentsSets()
            this.documentsSets.loading = false
        },
        async fetchDocumentsSet(code: string) {
            this.documentsSet.loading = true
            this.documentsSet.data = await DocumentsSetsService.getDocumentsSetByCode(code)
            this.documentsSet.loading = false
        },
        async createDocumentsSet(data: CreateDocumentsSetDTO) {
            await DocumentsSetsService.createDocumentsSet(data)
        },
        async updateDocumentsSet(code: string, data: ModifyDocumentsSetDTO) {
            await DocumentsSetsService.updateDocumentsSet(code, data)
        },
        async deleteDocumentsSet(code: string) {
            await DocumentsSetsService.deleteDocumentsSet(code)
        },
    },
})

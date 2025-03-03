import { defineStore } from 'pinia'
import DocumentsSetsService from '../services/documentsSetsService'
import type { DocumentsSet } from '@/types/DocumentsSet'
import type { CreateDocumentsSetDTO, ModifyDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'

interface DocumentsSetsState {
    documentsSets: {
        data: DocumentsSet[]
        totalItems: number
        loading: boolean
    }
    documentsSet: {
        data: DocumentsSet | null
        loading: boolean
    }
}

export const useDocumentsSetsStore = defineStore('documentsSets', {
    state: (): DocumentsSetsState => ({
        documentsSets: {
            data: [],
            totalItems: 0,
            loading: false,
        },
        documentsSet: {
            data: null,
            loading: false,
        },
    }),
    actions: {
        async fetchDocumentsSets(
            page: number = 1,
            limit: number = 10,
            sortBy?: string,
            order?: 'asc' | 'desc'
        ) {
            this.documentsSets.loading = true
            const { items, totalItems } = await DocumentsSetsService.getAllDocumentsSets(
                page,
                limit,
                sortBy,
                order
            )
            this.documentsSets.data = items
            this.documentsSets.totalItems = totalItems
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

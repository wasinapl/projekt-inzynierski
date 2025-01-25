import { defineStore } from 'pinia'
import DocumentsSetsService from '../services/documentsSetsService'
import type { DocumentsSet } from '@/types/DocumentsSet'
import type { CreateDocumentsSetDTO, ModifyDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'

interface DocumentsSetsState {
    documentsSets: DocumentsSet[]
    currentDocumentSet: DocumentsSet | null
}

export const useDocumentsSetsStore = defineStore('documentsSets', {
    state: (): DocumentsSetsState => ({
        documentsSets: [],
        currentDocumentSet: null,
    }),
    actions: {
        async fetchDocumentsSets() {
            this.documentsSets = await DocumentsSetsService.getAllDocumentsSets()
        },
        async fetchDocumentSet(code: string) {
            this.currentDocumentSet = await DocumentsSetsService.getDocumentsSetByCode(code)
        },
        async createDocumentSetByText(data: CreateDocumentsSetDTO) {
            const newDocumentSet = await DocumentsSetsService.createDocumentsSetByText(data)
            this.documentsSets.push(newDocumentSet)
        },
        async updateDocumentSet(code: string, data: ModifyDocumentsSetDTO) {
            await DocumentsSetsService.updateDocumentsSet(code, data)
        },
        async deleteDocumentSet(code: string) {
            await DocumentsSetsService.deleteDocumentsSet(code)
        },
    },
})

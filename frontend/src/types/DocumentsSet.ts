import type { Document } from './Document'
import type { Thread } from './Thread'

export interface DocumentsSet {
    code: string
    name: string
    description: string
    documents: Document[]
    ChatThreads: Thread[]
    public: boolean
    createdAt: string
    isImported?: boolean
}

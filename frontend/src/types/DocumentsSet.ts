import type { Document } from './Document'
import type { Thread } from './Thread'

export interface DocumentsSet {
    code: string
    name: string
    documents: Document[]
    ChatThreads: Thread[]
}

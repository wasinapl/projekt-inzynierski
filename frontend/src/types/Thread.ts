import type { DocumentsSet } from './DocumentsSet'
import type { Message } from './Message'

export interface Thread {
    code: string
    documentsSet: DocumentsSet
    messages: Message[]
}

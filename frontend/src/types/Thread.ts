import type { DocumentsSet } from './DocumentsSet'
import type { Message } from './Message'

export interface Thread {
    code: string
    DocumentsSet: DocumentsSet
    messages: Message[]
}

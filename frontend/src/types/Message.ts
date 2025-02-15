export interface Message {
    id: number
    content: string
    senderType: 'USER' | 'AI'
}

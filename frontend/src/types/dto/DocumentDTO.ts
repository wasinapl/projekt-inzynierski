export interface CreateDocumentFromTextDTO {
    documentsSetCode: string
    title: string
    content: string
}
export interface CreateDocumentFromFileDTO {
    documentsSetCode: string
    file: File
}

export interface ModifyDocumentDTO {
    title: string
    content: string
}

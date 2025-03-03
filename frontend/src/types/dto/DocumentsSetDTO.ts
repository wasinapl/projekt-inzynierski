export interface CreateDocumentsSetDTO {
    name: string
    description: string
    public: boolean
}

export interface ModifyDocumentsSetDTO {
    name?: string
    description?: string
    public?: boolean
}

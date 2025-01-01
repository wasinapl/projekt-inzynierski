import { DocumentStatus, Document } from '@prisma/client';

export class DocumentDto {
    code: string;
    title: string;
    content: string;
    status: DocumentStatus;

    constructor(data: Document) {
        this.code = data.code;
        this.title = data.title;
        this.content = data.content;
        this.status = data.status;
    }
}

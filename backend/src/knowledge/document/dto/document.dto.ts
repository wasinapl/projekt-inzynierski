import { DocumentStatus } from '@prisma/client';

export class DocumentDto {
    code: string;
    title: string;
    content: string;
    status: DocumentStatus;
}

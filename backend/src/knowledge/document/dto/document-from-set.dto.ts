import { DocumentStatus } from '@prisma/client';

export class DocumentFromSetDto {
    code: string;
    title: string;
    status: DocumentStatus;
}

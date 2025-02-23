import { DocumentStatus, DocumentType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class DocumentDto {
    @Expose()
    code: string;
    @Expose()
    title: string;
    @Expose()
    content: string;
    @Expose()
    status: DocumentStatus;
    @Expose()
    type: DocumentType;
}

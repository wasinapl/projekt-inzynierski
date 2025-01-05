import { DocumentStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class DocumentInSetDto {
    @Expose()
    code: string;
    @Expose()
    title: string;
    @Expose()
    status: DocumentStatus;
}

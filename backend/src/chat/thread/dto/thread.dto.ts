import { SenderType } from '@prisma/client';
import { DocumentsSetDto } from '@src/knowledge/documents-set/dto/documents-set.dto';
import { Expose, Type } from 'class-transformer';

export class MessageDto {
    @Expose()
    id?: number;
    @Expose()
    content: string;
    @Expose()
    senderType: SenderType;
}

export class ThreadDto {
    @Expose()
    code: string;
    @Expose()
    createdAt: string;
    @Expose()
    updatedAt: string;
    @Expose()
    @Type(() => MessageDto)
    messages: MessageDto[];
    @Expose()
    @Type(() => DocumentsSetDto)
    documentSet: DocumentsSetDto;
}

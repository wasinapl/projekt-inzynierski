import { ThreadDto } from '@src/chat/thread/dto/thread.dto';
import { DocumentInSetDto } from '../..//document/dto/document-in-set.dto';
import { Expose, Type } from 'class-transformer';

export class DocumentsSetDto {
    @Expose()
    code: string;
    @Expose()
    name: string;
    @Expose()
    @Type(() => DocumentInSetDto)
    documents: DocumentInSetDto[];
    @Expose()
    @Type(() => ThreadDto)
    ChatThreads: ThreadDto[];
}

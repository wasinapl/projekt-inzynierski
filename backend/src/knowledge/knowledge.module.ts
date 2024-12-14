import { Module } from '@nestjs/common';
import { DocumentSetService } from './document-set/document-set.service';
import { DocumentSetController } from './document-set/document-set.controller';
import { DocumentService } from './document/document.service';
import { DocumentController } from './document/document.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileToTextService } from './utils/file-to-text.service';

@Module({
    imports: [],
    providers: [
        PrismaService,
        DocumentSetService,
        DocumentService,
        FileToTextService,
    ],
    controllers: [DocumentSetController, DocumentController],
})
export class KnowledgeModule {}

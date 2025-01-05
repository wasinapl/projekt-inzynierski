import { Module } from '@nestjs/common';
import { DocumentsSetService } from './documents-set/documents-set.service';
import { DocumentsSetController } from './documents-set/documents-set.controller';
import { DocumentService } from './document/document.service';
import { DocumentController } from './document/document.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileToTextService } from './utils/file-to-text.service';
import { DocumentPartProcessor } from './document/document-part.processor';
import { QueuesModule } from './../queues/queues.module';
import { OpenAIModule } from './../openai/openai.module';

@Module({
    imports: [QueuesModule, OpenAIModule],
    providers: [
        PrismaService,
        DocumentsSetService,
        DocumentService,
        FileToTextService,
        DocumentPartProcessor,
    ],
    controllers: [DocumentsSetController, DocumentController],
})
export class KnowledgeModule {}

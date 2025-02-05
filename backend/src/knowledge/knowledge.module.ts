import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { DocumentsSetModule } from './documents-set/documents-set.module';

@Module({
    imports: [DocumentModule, DocumentsSetModule],
})
export class KnowledgeModule {}

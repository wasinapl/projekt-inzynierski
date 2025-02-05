import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { DocumentController } from './document.controller';
import { DocumentPartProcessor } from './document-part.processor';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpenAIModule } from 'src/openai/openai.module';
import { DocumentService } from './document.service';
import { UtilsModule } from '@src/utils/utils.module';
import { DocumentStatusGateway } from './document-status.gateway';

@Module({
    imports: [
        PrismaModule,
        OpenAIModule,
        UtilsModule,

        BullModule.registerQueue({
            name: 'document-queue',
        }),
    ],
    controllers: [DocumentController],
    providers: [DocumentService, DocumentPartProcessor, DocumentStatusGateway],
})
export class DocumentModule {}

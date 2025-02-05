import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentPartProcessor } from './document-part.processor';
import { PrismaService } from './../../prisma/prisma.service';
import { DocumentStatusGateway } from './document-status.gateway';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'document-queue',
        }),
    ],
    providers: [DocumentPartProcessor, PrismaService, DocumentStatusGateway],
})
export class DocumentModule {}

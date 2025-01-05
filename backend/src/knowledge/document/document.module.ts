import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentPartProcessor } from './document-part.processor';
import { PrismaService } from './../../prisma/prisma.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'document-queue',
        }),
    ],
    providers: [DocumentPartProcessor, PrismaService],
})
export class DocumentModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'document-queue',
        }),
    ],
    exports: [BullModule],
})
export class QueuesModule {}

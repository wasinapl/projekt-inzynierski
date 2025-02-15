import { Module } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { ThreadController } from './thread.controller';

@Module({
    imports: [PrismaModule],
    providers: [ThreadService],
    controllers: [ThreadController],
    exports: [ThreadService],
})
export class ThreadModule {}

import { Module } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ThreadService],
    exports: [ThreadService],
})
export class ThreadModule {}

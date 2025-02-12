import { Module } from '@nestjs/common';
import { ResponseLogService } from './response-log.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ResponseLogService],
    exports: [ResponseLogService],
})
export class ResponseLogModule {}

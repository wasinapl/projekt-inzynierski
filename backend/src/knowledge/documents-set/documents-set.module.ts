import { Module } from '@nestjs/common';
import { DocumentsSetController } from './documents-set.controller';
import { DocumentsSetService } from './documents-set.service';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DocumentsSetController],
    providers: [DocumentsSetService],
})
export class DocumentsSetModule {}

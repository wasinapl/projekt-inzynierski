import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OpenAIService } from './openai.service';
import { PrismaService } from '@src/prisma/prisma.service';

@Module({
    imports: [ConfigModule],
    providers: [OpenAIService, PrismaService],
    exports: [OpenAIService],
})
export class OpenAIModule {}

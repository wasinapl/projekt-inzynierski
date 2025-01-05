import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { BullModule } from '@nestjs/bullmq';
import { OpenAIModule } from './openai/openai.module';

@Module({
    imports: [
        AuthModule,
        PrismaModule,
        KnowledgeModule,
        OpenAIModule,
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_URL,
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'document-queue',
        }),
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: PrismaClientExceptionFilter,
        },
    ],
})
export class AppModule {}

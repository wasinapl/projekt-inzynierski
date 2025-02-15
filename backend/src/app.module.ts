import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { QueuesModule } from './queues/queues.module';
import { OpenAIModule } from './openai/openai.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        AuthModule,
        PrismaModule,
        QueuesModule,
        OpenAIModule,
        KnowledgeModule,
        ChatModule,
        UserModule,

        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_URL,
                port: parseInt(process.env.REDIS_PORT, 10),
            },
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

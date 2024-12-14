import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { KnowledgeModule } from './knowledge/knowledge.module'
import { APP_FILTER } from '@nestjs/core'
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter'

@Module({
    imports: [AuthModule, PrismaModule, KnowledgeModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: PrismaClientExceptionFilter,
        },
    ],
})
export class AppModule {}

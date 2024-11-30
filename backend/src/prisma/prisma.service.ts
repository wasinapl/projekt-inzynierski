import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        })
    }

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

    async cleanDatabase() {
        // Optional: Utility for clearing the database between tests
        const tables = await this.$queryRaw<Array<{ tablename: string }>>`SHOW TABLES`
        for (const table of tables) {
            await this.$executeRawUnsafe(`TRUNCATE ${table.tablename}`)
        }
    }
}

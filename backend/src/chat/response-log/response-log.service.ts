import { Injectable } from '@nestjs/common';
import { JsonValue } from '@prisma/client/runtime/library';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class ResponseLogService {
    constructor(private prisma: PrismaService) {}

    async addLog(input: JsonValue, output: JsonValue): Promise<void> {
        this.prisma.responseLog.create({
            data: {
                input,
                output,
            },
        });
    }
}

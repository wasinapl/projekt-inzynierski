import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateThreadDto } from './dto/create-thread.dto';
import { MessageDto, ThreadDto } from './dto/thread.dto';

@Injectable()
export class ThreadService {
    constructor(private prisma: PrismaService) {}

    async createThread(data: CreateThreadDto) {
        const code = require('crypto').randomBytes(12).toString('hex');

        const thread = await this.prisma.chatThread.create({
            data: {
                code,
                documentSetId: data.documentSetId,
            },
        });

        return plainToInstance(ThreadDto, thread, {
            excludeExtraneousValues: true,
        });
    }

    async getThreads(userId: number) {
        const threads = await this.prisma.chatThread.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                },
            },
        });
        return plainToInstance(ThreadDto, threads, {
            excludeExtraneousValues: true,
        });
    }

    async getThreadByCode(code: string, userId: number) {
        const thread = await this.prisma.chatThread.findUnique({
            where: { code, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        return plainToInstance(ThreadDto, thread, {
            excludeExtraneousValues: true,
        });
    }

    async addThreadMessage(code: string, userId: number, data: MessageDto) {
        const thread = await this.prisma.chatThread.findUnique({
            where: { code, userId },
        });

        if (!thread) {
            throw new NotFoundException(`Thread with code ${code} not found`);
        }

        return this.prisma.message.create({
            data: {
                content: data.content,
                senderType: data.senderType,
                chatThreadId: thread.id,
            },
        });
    }

    async deleteThread(code: string, userId: number) {
        const thread = await this.prisma.chatThread.findUnique({
            where: { code, userId },
        });

        if (!thread) {
            throw new NotFoundException(`Thread with code ${code} not found`);
        }

        return this.prisma.chatThread.delete({ where: { code, userId } });
    }
}

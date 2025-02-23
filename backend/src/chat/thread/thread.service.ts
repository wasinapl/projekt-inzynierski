import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateThreadDto } from './dto/create-thread.dto';
import { MessageDto, ThreadDto } from './dto/thread.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ThreadService {
    constructor(private readonly prisma: PrismaService) {}

    async createThread(data: CreateThreadDto, userId: number) {
        const code = require('crypto').randomBytes(12).toString('hex');

        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code: data.documentsSetCode, userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${data.documentsSetCode} not found`
            );
        }

        const thread = await this.prisma.chatThread.create({
            data: {
                code,
                documentsSetId: documentsSet.id,
                userId: userId,
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
                    orderBy: { createdAt: 'asc' },
                    take: 10,
                },
                DocumentsSet: true,
            },
        });

        return plainToInstance(ThreadDto, thread, {
            excludeExtraneousValues: true,
        });
    }

    async getThreadMesssages(
        threadCode: string,
        userId: number,
        pagination: { cursor?: number; limit: number }
    ) {
        const take = pagination.limit;

        const thread = await this.prisma.chatThread.findUnique({
            where: { code: threadCode, userId: userId },
        });

        if (!thread) {
            throw new NotFoundException(
                `Thread with code ${threadCode} not found`
            );
        }

        const where = { chatThreadId: Number(thread.id) };
        let query: Prisma.MessageFindManyArgs = {
            where,
            orderBy: { createdAt: 'desc' },
            take,
        };

        if (pagination.cursor) {
            query = {
                ...query,
                cursor: { id: pagination.cursor },
                skip: 1,
            };
        }

        const messages = await this.prisma.message.findMany(query);
        messages.reverse();

        return plainToInstance(MessageDto, messages, {
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

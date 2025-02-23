import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentSetDto } from './dto/create-documents-set.dto';
import { UpdateDocumentSetDto } from './dto/update-documents-set.dto';
import { plainToInstance } from 'class-transformer';
import { DocumentsSetDto } from './dto/documents-set.dto';

@Injectable()
export class DocumentsSetService {
    constructor(private prisma: PrismaService) {}

    async createDocumentsSet(data: CreateDocumentSetDto) {
        const code = require('crypto').randomBytes(8).toString('hex');

        const documentsSet = await this.prisma.documentsSet.create({
            data: {
                code,
                name: data.name,
                userId: data.userId,
            },
        });

        return plainToInstance(DocumentsSetDto, documentsSet, {
            excludeExtraneousValues: true,
        });
    }

    async getDocumentsSets(userId: number) {
        const documentsSets = await this.prisma.documentsSet.findMany({
            where: { userId },
            include: {
                documents: true,
            },
        });
        return plainToInstance(DocumentsSetDto, documentsSets, {
            excludeExtraneousValues: true,
        });
    }

    async getDocumentsSetByCode(code: string, userId: number) {
        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code, userId },
            include: {
                documents: true,
                ChatThreads: {
                    select: {
                        code: true,
                        createdAt: true,
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        return plainToInstance(DocumentsSetDto, documentsSet, {
            excludeExtraneousValues: true,
        });
    }

    async updateDocumentsSet(
        code: string,
        data: UpdateDocumentSetDto,
        userId: number
    ) {
        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code, userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        const updatedDocumentsSet = await this.prisma.documentsSet.update({
            where: { code, userId },
            data,
        });

        return plainToInstance(DocumentsSetDto, updatedDocumentsSet, {
            excludeExtraneousValues: true,
        });
    }

    async deleteDocumentsSet(code: string, userId: number) {
        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code, userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        return this.prisma.documentsSet.delete({ where: { code, userId } });
    }
}

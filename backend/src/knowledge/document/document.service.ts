import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentFromTextDto } from './dto/create-document-from-text.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentFromFileDto } from './dto/create-document-from-file.dto';
import { FileToTextService } from 'src/utils/file-to-text.service';
import { DocumentType } from '@prisma/client';
import { DocumentDto } from './dto/document.dto';
import { plainToInstance } from 'class-transformer';
import { DocumentFromSetDto } from './dto/document-from-set.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentService {
    private readonly DOCUMENT_PART_TOKENS = 500;

    constructor(
        private prisma: PrismaService,
        private fileToTextService: FileToTextService,
        @InjectQueue('document-queue') private documentQueue: Queue
    ) {}

    async createDocumentFromText(data: CreateDocumentFromTextDto) {
        const code = require('crypto').randomBytes(8).toString('hex');

        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code: data.documentsSetCode, userId: data.userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        const document = await this.prisma.document.create({
            data: {
                code: code,
                title: data.title,
                content: data.content,
                documentsSetId: documentsSet.id,
                userId: data.userId,
                type: DocumentType.TEXT,
            },
        });

        const createPartResults = await this.createDocumentPartsFromText(
            document.content,
            document.id
        );

        if (!createPartResults.length) {
            throw new Error('Failed to create document parts');
        }

        for (const partId of createPartResults) {
            await this.documentQueue.add('document-queue', {
                documentId: document.id,
                partId,
            });
        }

        return plainToInstance(DocumentDto, document, {
            excludeExtraneousValues: true,
        });
    }

    async createDocumentFromFile(
        data: CreateDocumentFromFileDto,
        file: Express.Multer.File
    ) {
        const code = require('crypto').randomBytes(8).toString('hex');

        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code: data.documentsSetCode, userId: data.userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        const extractedText = await this.fileToTextService.extractText(file);
        const document = await this.prisma.document.create({
            data: {
                code: code,
                title: file.originalname,
                content: extractedText,
                documentsSetId: documentsSet.id,
                userId: data.userId,
                type: DocumentType.FILE,
            },
        });

        const createPartResults = await this.createDocumentPartsFromText(
            document.content,
            document.id
        );

        if (!createPartResults.length) {
            throw new Error('Failed to create document parts');
        }

        for (const partId of createPartResults) {
            await this.documentQueue.add('document-queue', {
                documentId: document.id,
                partId,
            });
        }

        return plainToInstance(DocumentDto, document, {
            excludeExtraneousValues: true,
        });
    }

    async getDocumentsBySet(documentsSetCode: string, userId: number) {
        if (!documentsSetCode) {
            throw new NotFoundException(`Documents set code not found`);
        }

        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code: documentsSetCode, userId },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${documentsSetCode} not found`
            );
        }

        const documents = await this.prisma.document.findMany({
            where: { documentsSetId: documentsSet.id, userId },
        });

        return plainToInstance(DocumentFromSetDto, documents, {
            excludeExtraneousValues: true,
        });
    }

    async getDocumentByCode(code: string, userId: number) {
        const document = await this.prisma.document.findUnique({
            where: { code, userId },
        });

        if (!document) {
            throw new NotFoundException(`Document with code ${code} not found`);
        }

        return plainToInstance(DocumentDto, document, {
            excludeExtraneousValues: true,
        });
    }

    async updateDocument(
        code: string,
        data: UpdateDocumentDto,
        userId: number
    ) {
        const document = await this.prisma.document.findUnique({
            where: { code, userId },
        });

        if (!document) {
            throw new NotFoundException(`Document with code ${code} not found`);
        }

        const updatedDocument = await this.prisma.document.update({
            where: { code, userId },
            data,
        });

        await this.prisma.documentPart.deleteMany({
            where: { documentId: updatedDocument.id },
        });

        const createPartResults = await this.createDocumentPartsFromText(
            updatedDocument.content,
            updatedDocument.id
        );

        if (!createPartResults) {
            throw new Error('Failed to create document parts');
        }

        for (const partId of createPartResults) {
            await this.documentQueue.add('document-queue', {
                documentId: document.id,
                partId,
            });
        }

        return plainToInstance(DocumentDto, updatedDocument, {
            excludeExtraneousValues: true,
        });
    }

    async deleteDocument(code: string, userId: number) {
        const document = await this.prisma.document.findUnique({
            where: { code, userId },
        });

        if (!document) {
            throw new NotFoundException(`Document with code ${code} not found`);
        }

        return this.prisma.document.delete({ where: { code, userId } });
    }

    // helper functions
    async createDocumentPartsFromText(
        content: string,
        documentId: number
    ): Promise<number[]> {
        try {
            const parts = await this.createParts(content);

            const createdParts = await this.prisma.documentPart.createMany({
                data: parts.map((part) => ({
                    content: part.text,
                    tokens: part.tokens,
                    documentId,
                })),
                skipDuplicates: true,
            });

            const insertedParts = await this.prisma.documentPart.findMany({
                where: { documentId },
                select: { id: true },
            });

            return insertedParts.map((part) => part.id);
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createParts(
        content: string
    ): Promise<{ text: string; tokens: number }[]> {
        const sentences = content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

        const parts: { text: string; tokens: number }[] = [];
        let currentPart = '';
        let currentPartTokenCount = 0;

        for (const sentence of sentences) {
            const sentenceTokenCount = await this.countTokens(sentence);

            if (
                currentPartTokenCount + sentenceTokenCount >
                this.DOCUMENT_PART_TOKENS
            ) {
                if (currentPart.trim()) {
                    parts.push({
                        text: currentPart.trim(),
                        tokens: currentPartTokenCount,
                    });
                }
                currentPart = sentence;
                currentPartTokenCount = sentenceTokenCount;
            } else {
                currentPart += sentence;
                currentPartTokenCount += sentenceTokenCount;
            }
        }

        if (currentPart.trim()) {
            parts.push({
                text: currentPart.trim(),
                tokens: currentPartTokenCount,
            });
        }

        return parts;
    }

    async countTokens(text: string) {
        const charCount = text.length;
        const tokenEstimate = Math.ceil(charCount / 4);
        return tokenEstimate;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentFromTextDto } from './dto/create-document-from-text.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentFromFileDto } from './dto/create-document-from-file.dto';
import { FileToTextService } from '../utils/file-to-text.service';
import { DocumentDto } from './dto/document.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DocumentService {
    constructor(
        private prisma: PrismaService,
        private fileToTextService: FileToTextService
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
            },
        });

        return plainToInstance(DocumentDto, document);
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
                title: data.title,
                content: extractedText,
                documentsSetId: documentsSet.id,
                userId: data.userId,
            },
        });

        return plainToInstance(DocumentDto, document);
    }

    async getDocumentsBySet(documentsSetCode: string, userId: number) {
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

        return plainToInstance(DocumentDto, documents);
    }

    async getDocumentByCode(code: string, userId: number) {
        const document = await this.prisma.document.findUnique({
            where: { code, userId },
        });

        if (!document) {
            throw new NotFoundException(`Document with code ${code} not found`);
        }

        return plainToInstance(DocumentDto, document);
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

        return plainToInstance(DocumentDto, updatedDocument);
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
}

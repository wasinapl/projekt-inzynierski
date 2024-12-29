import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentFromTextDto } from './dto/create-document-from-text.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentFromFileDto } from './dto/create-document-from-file.dto';
import { FileToTextService } from '../utils/file-to-text.service';

@Injectable()
export class DocumentService {
    constructor(
        private prisma: PrismaService,
        private fileToTextService: FileToTextService
    ) {}

    async createDocumentFromText(data: CreateDocumentFromTextDto) {
        return this.prisma.document.create({
            data,
        });
    }

    async createDocumentFromFile(
        data: CreateDocumentFromFileDto,
        file: Express.Multer.File
    ) {
        const extractedText = await this.fileToTextService.extractText(file);
        return this.prisma.document.create({
            ...data,
            content: extractedText,
        });
    }

    async getDocumentsBySet(documentsSetId: number, userId: number) {
        return this.prisma.document.findMany({
            where: { documentsSetId, userId },
        });
    }

    async getDocumentById(id: number, userId: number) {
        return this.prisma.document.findUnique({ where: { id, userId } });
    }

    async updateDocument(id: number, data: UpdateDocumentDto, userId: number) {
        return this.prisma.document.update({
            where: { id, userId },
            data,
        });
    }

    async deleteDocument(id: number, userId: number) {
        return this.prisma.document.delete({ where: { id, userId } });
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentSetDto } from './dto/create-document-set.dto';
import { UpdateDocumentSetDto } from './dto/update-document-set.dto';

@Injectable()
export class DocumentSetService {
    constructor(private prisma: PrismaService) {}

    async createDocumentSet(data: CreateDocumentSetDto) {
        return this.prisma.documentsSet.create({
            data: {
                name: data.name,
                userId: data.userId,
            },
        });
    }

    async getDocumentSets(userId: number) {
        return this.prisma.documentsSet.findMany({
            where: { userId },
        });
    }

    async getDocumentSetById(id: number, userId: number) {
        return this.prisma.documentsSet.findFirst({
            where: { id, userId },
        });
    }

    async updateDocumentSet(
        id: number,
        data: UpdateDocumentSetDto,
        userId: number
    ) {
        return this.prisma.documentsSet.update({
            where: { id, userId },
            data,
        });
    }

    async deleteDocumentSet(id: number, userId: number) {
        return this.prisma.documentsSet.delete({ where: { id, userId } });
    }
}

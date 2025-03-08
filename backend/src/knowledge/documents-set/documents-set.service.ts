import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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

    async getDocumentsSets(
        userId: number,
        page: number,
        limit: number,
        sortBy: string = 'createdAt',
        order: 'asc' | 'desc' = 'desc',
        publicOnly: boolean = false,
        importedOnly: boolean = false,
        search: string = ''
    ) {
        const skip = (page - 1) * limit;
        const orderBy = sortBy ? { [sortBy]: order } : undefined;

        let where: any = publicOnly
            ? { public: true, userId: { not: userId } }
            : { userId };

        if (search && search.trim().length > 0) {
            where = {
                ...where,
                name: { contains: search },
            };
        }

        if (publicOnly && importedOnly) {
            where = {
                ...where,
                ImportedDocumentsSet: {
                    some: { userId },
                },
            };
        }

        const includeOptions = publicOnly
            ? {
                  ImportedDocumentsSet: {
                      where: { userId },
                  },
              }
            : {};

        const documentsSets = await this.prisma.documentsSet.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: includeOptions,
        });

        const totalItems = await this.prisma.documentsSet.count({
            where,
        });

        const items = documentsSets.map((set) => {
            if (publicOnly) {
                return {
                    ...set,
                    isImported:
                        set.ImportedDocumentsSet &&
                        set.ImportedDocumentsSet.length > 0,
                };
            }
            return set;
        });

        return {
            items: plainToInstance(DocumentsSetDto, items, {
                excludeExtraneousValues: true,
            }),
            totalItems,
        };
    }
    async getAllDocumentsSets(userId: number) {
        const documentsSets = await this.prisma.documentsSet.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { ImportedDocumentsSet: { some: { userId: userId } } },
                ],
            },
            select: {
                code: true,
                name: true,
            },
        });

        return {
            items: plainToInstance(DocumentsSetDto, documentsSets, {
                excludeExtraneousValues: true,
            }),
        };
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

    async importDocumentsSet(code: string, userId: number) {
        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        if (!documentsSet.public) {
            throw new BadRequestException(
                `Documents set with code ${code} is not public and cannot be imported.`
            );
        }

        const existingImport =
            await this.prisma.importedDocumentsSet.findUnique({
                where: {
                    userId_documentsSetId: {
                        userId,
                        documentsSetId: documentsSet.id,
                    },
                },
            });

        if (existingImport) {
            return { message: 'Documents set already imported.' };
        }

        const importedDocumentsSet =
            await this.prisma.importedDocumentsSet.create({
                data: {
                    userId,
                    documentsSetId: documentsSet.id,
                },
            });

        return {
            message: 'Documents set imported successfully.',
        };
    }

    async removeImportDocumentsSet(code: string, userId: number) {
        const documentsSet = await this.prisma.documentsSet.findUnique({
            where: { code },
        });

        if (!documentsSet) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }

        const existingImport =
            await this.prisma.importedDocumentsSet.findUnique({
                where: {
                    userId_documentsSetId: {
                        userId,
                        documentsSetId: documentsSet.id,
                    },
                },
            });

        if (!existingImport) {
            return { message: 'Documents set import not found.' };
        }

        await this.prisma.importedDocumentsSet.delete({
            where: {
                userId_documentsSetId: {
                    userId,
                    documentsSetId: documentsSet.id,
                },
            },
        });

        return { message: 'Documents set import removed successfully.' };
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsSetService } from './documents-set.service';
import { CreateDocumentSetDto } from './dto/create-documents-set.dto';
import { UpdateDocumentSetDto } from './dto/update-documents-set.dto';
import { PrismaService } from '../../prisma/prisma.service';

describe('DocumentSetService', () => {
    let service: DocumentsSetService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DocumentsSetService, PrismaService],
        }).compile();

        service = module.get<DocumentsSetService>(DocumentsSetService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('createDocumentSet', () => {
        it('should throw an error if userId is invalid', async () => {
            const createDto: CreateDocumentSetDto = {
                name: 'Test Set',
                userId: -1,
            };

            await expect(
                service.createDocumentsSet(createDto)
            ).rejects.toThrow();
        });
    });

    describe('getDocumentSets', () => {
        it('should return empty array when no documents exist', async () => {
            const userId = 1;
            jest.spyOn(
                prismaService.documentsSet,
                'findMany'
            ).mockResolvedValue([]);

            const result = await service.getDocumentsSets(userId);
            expect(result).toEqual([]);
        });
    });

    describe('getDocumentSetByCode', () => {
        it('should return null for non-existent document set', async () => {
            const code = 'wrong-code';
            const userId = 1;

            jest.spyOn(
                prismaService.documentsSet,
                'findFirst'
            ).mockResolvedValue(null);

            const result = await service.getDocumentsSetByCode(code, userId);
            expect(result).toBeNull();
        });
    });

    describe('updateDocumentSet', () => {
        it('should throw error when updating non-existent document set', async () => {
            const code = 'wrong-code';
            const userId = 1;
            const updateDto: UpdateDocumentSetDto = { name: 'Updated Name' };

            jest.spyOn(prismaService.documentsSet, 'update').mockRejectedValue(
                new Error('Not found')
            );

            await expect(
                service.updateDocumentsSet(code, updateDto, userId)
            ).rejects.toThrow();
        });
    });

    describe('deleteDocumentSet', () => {
        it('should throw error when deleting non-existent document set', async () => {
            const code = 'wrong-code';
            const userId = 1;

            jest.spyOn(prismaService.documentsSet, 'delete').mockRejectedValue(
                new Error('Not found')
            );

            await expect(
                service.deleteDocumentsSet(code, userId)
            ).rejects.toThrow();
        });
    });
});

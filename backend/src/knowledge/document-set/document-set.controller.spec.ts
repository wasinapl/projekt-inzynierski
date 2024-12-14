import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSetService } from './document-set.service';
import { CreateDocumentSetDto } from './dto/create-document-set.dto';
import { UpdateDocumentSetDto } from './dto/update-document-set.dto';
import { PrismaService } from './../../prisma/prisma.service';

describe('DocumentSetService', () => {
    let service: DocumentSetService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DocumentSetService, PrismaService],
        }).compile();

        service = module.get<DocumentSetService>(DocumentSetService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createDocumentSet', () => {
        it('should create a new document set', async () => {
            const createDto: CreateDocumentSetDto = {
                name: 'Test Set',
                userId: 1,
            };
            const result = {
                id: 1,
                name: 'Test Set',
                userId: 1,
                documents: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.documentsSet, 'create').mockResolvedValue(
                result
            );

            expect(await service.createDocumentSet(createDto)).toEqual(result);
            expect(prismaService.documentsSet.create).toHaveBeenCalledWith({
                data: createDto,
            });
        });
    });

    describe('getDocumentSets', () => {
        it('should return document sets for a user', async () => {
            const userId = 1;
            const result = [
                {
                    id: 1,
                    name: 'Set 1',
                    userId: 1,
                    documents: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(
                prismaService.documentsSet,
                'findMany'
            ).mockResolvedValue(result);

            expect(await service.getDocumentSets(userId)).toEqual(result);
            expect(prismaService.documentsSet.findMany).toHaveBeenCalledWith({
                where: { userId },
            });
        });
    });

    describe('getDocumentSetById', () => {
        it('should return a document set by id', async () => {
            const id = 1;
            const userId = 1;
            const result = {
                id: 1,
                name: 'Set 1',
                userId: 1,
                documents: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(
                prismaService.documentsSet,
                'findFirst'
            ).mockResolvedValue(result);

            expect(await service.getDocumentSetById(id, userId)).toEqual(
                result
            );
            expect(prismaService.documentsSet.findFirst).toHaveBeenCalledWith({
                where: { id, userId },
            });
        });
    });

    describe('updateDocumentSet', () => {
        it('should update a document set', async () => {
            const id = 1;
            const userId = 1;
            const updateDto: UpdateDocumentSetDto = { name: 'Updated Name' };
            const result = {
                id: 1,
                name: 'Updated Name',
                userId: 1,
                documents: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.documentsSet, 'update').mockResolvedValue(
                result
            );

            expect(
                await service.updateDocumentSet(id, updateDto, userId)
            ).toEqual(result);
            expect(prismaService.documentsSet.update).toHaveBeenCalledWith({
                where: { id, userId },
                data: updateDto,
            });
        });
    });

    describe('deleteDocumentSet', () => {
        it('should delete a document set', async () => {
            const id = 1;
            const userId = 1;
            const result = {
                id: 1,
                name: 'Deleted Set',
                userId: 1,
                documents: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prismaService.documentsSet, 'delete').mockResolvedValue(
                result
            );

            expect(await service.deleteDocumentSet(id, userId)).toEqual(result);
            expect(prismaService.documentsSet.delete).toHaveBeenCalledWith({
                where: { id, userId },
            });
        });
    });
});

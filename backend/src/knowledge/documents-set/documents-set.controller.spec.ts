import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsSetController } from './documents-set.controller';
import { DocumentsSetService } from './documents-set.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateDocumentSetDto } from './dto/create-documents-set.dto';
import { UpdateDocumentSetDto } from './dto/update-documents-set.dto';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsSetController', () => {
    let controller: DocumentsSetController;
    let service: DocumentsSetService;

    // We define mock implementations of the methods in DocumentsSetService
    const mockDocumentsSetService = {
        createDocumentsSet: jest.fn(),
        getDocumentsSets: jest.fn(),
        getAllDocumentsSets: jest.fn(),
        getDocumentsSetByCode: jest.fn(),
        updateDocumentsSet: jest.fn(),
        deleteDocumentsSet: jest.fn(),
        importDocumentsSet: jest.fn(),
        removeImportDocumentsSet: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DocumentsSetController],
            providers: [
                {
                    provide: DocumentsSetService,
                    useValue: mockDocumentsSetService,
                },
            ],
        })
            // If you rely on JwtAuthGuard in the controller (with @UseGuards),
            // you can override it here to avoid requiring actual JWTs in unit tests.
            .overrideGuard(JwtAuthGuard)
            .useValue({})
            .compile();

        controller = module.get<DocumentsSetController>(DocumentsSetController);
        service = module.get<DocumentsSetService>(DocumentsSetService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call documentsSetService.createDocumentsSet with the correct parameters', async () => {
            const req = { user: { id: 123 } };
            const dto: CreateDocumentSetDto = {
                name: 'Test Document Set',
                // ...other required fields if any
            };
            mockDocumentsSetService.createDocumentsSet.mockResolvedValueOnce({
                id: 1,
                userId: 123,
                ...dto,
            });

            const result = await controller.create(req, dto);

            expect(service.createDocumentsSet).toHaveBeenCalledWith({
                name: 'Test Document Set',
                userId: 123,
            });
            expect(result).toEqual({
                id: 1,
                userId: 123,
                name: 'Test Document Set',
            });
        });
    });

    describe('get', () => {
        it('should call documentsSetService.getDocumentsSets with the correct parameters', async () => {
            const req = { user: { id: 123 } };
            const page = 1;
            const limit = 10;
            const sortBy = 'createdAt';
            const order = 'asc';
            const publicOnly = false;
            const importedOnly = false;
            const search = 'test';

            mockDocumentsSetService.getDocumentsSets.mockResolvedValueOnce({
                items: [],
                total: 0,
            });

            const result = await controller.get(
                req,
                page,
                limit,
                sortBy,
                order,
                publicOnly,
                importedOnly,
                search
            );

            expect(service.getDocumentsSets).toHaveBeenCalledWith(
                123,
                page,
                limit,
                sortBy,
                order,
                publicOnly,
                importedOnly,
                search
            );
            expect(result).toEqual({ items: [], total: 0 });
        });
    });

    describe('getAll', () => {
        it('should call documentsSetService.getAllDocumentsSets with the correct parameters', async () => {
            const req = { user: { id: 123 } };
            mockDocumentsSetService.getAllDocumentsSets.mockResolvedValueOnce([
                { id: 1 },
                { id: 2 },
            ]);

            const result = await controller.getAll(req);

            expect(service.getAllDocumentsSets).toHaveBeenCalledWith(123);
            expect(result).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe('getOne', () => {
        it('should return the documents set if found', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';
            mockDocumentsSetService.getDocumentsSetByCode.mockResolvedValueOnce(
                {
                    code,
                    name: 'Some Document',
                }
            );

            const result = await controller.getOne(req, code);

            expect(service.getDocumentsSetByCode).toHaveBeenCalledWith(
                code,
                123
            );
            expect(result).toEqual({ code: 'abc123', name: 'Some Document' });
        });

        it('should throw NotFoundException if the document set is not found', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';
            mockDocumentsSetService.getDocumentsSetByCode.mockResolvedValueOnce(
                null
            );

            await expect(controller.getOne(req, code)).rejects.toThrow(
                NotFoundException
            );

            expect(service.getDocumentsSetByCode).toHaveBeenCalledWith(
                code,
                123
            );
        });
    });

    describe('update', () => {
        it('should call documentsSetService.updateDocumentsSet with the correct parameters', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';
            const dto: UpdateDocumentSetDto = {
                name: 'Updated Name',
                // ...other fields
            };
            mockDocumentsSetService.updateDocumentsSet.mockResolvedValueOnce({
                code,
                name: 'Updated Name',
            });

            const result = await controller.update(req, code, dto);

            expect(service.updateDocumentsSet).toHaveBeenCalledWith(
                code,
                dto,
                123
            );
            expect(result).toEqual({ code: 'abc123', name: 'Updated Name' });
        });
    });

    describe('delete', () => {
        it('should call documentsSetService.deleteDocumentsSet with the correct parameters and return success message', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';

            mockDocumentsSetService.deleteDocumentsSet.mockResolvedValueOnce(
                null
            );

            const result = await controller.delete(req, code);

            expect(service.deleteDocumentsSet).toHaveBeenCalledWith(code, 123);
            expect(result).toEqual({
                message: 'Document set deleted successfully',
            });
        });
    });

    describe('importDocumentsSet', () => {
        it('should call documentsSetService.importDocumentsSet correctly', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';

            mockDocumentsSetService.importDocumentsSet.mockResolvedValueOnce({
                message: 'Imported',
            });

            const result = await controller.importDocumentsSet(req, code);

            expect(service.importDocumentsSet).toHaveBeenCalledWith(code, 123);
            expect(result).toEqual({ message: 'Imported' });
        });
    });

    describe('removeImportDocumentsSet', () => {
        it('should call documentsSetService.removeImportDocumentsSet correctly', async () => {
            const req = { user: { id: 123 } };
            const code = 'abc123';

            mockDocumentsSetService.removeImportDocumentsSet.mockResolvedValueOnce(
                {
                    message: 'Import removed',
                }
            );

            const result = await controller.removeImportDocumentsSet(req, code);

            expect(service.removeImportDocumentsSet).toHaveBeenCalledWith(
                code,
                123
            );
            expect(result).toEqual({ message: 'Import removed' });
        });
    });
});

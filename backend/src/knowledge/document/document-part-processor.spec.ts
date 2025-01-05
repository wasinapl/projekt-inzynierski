import { Test, TestingModule } from '@nestjs/testing';
import { DocumentPartProcessor } from './document-part.processor';
import { PrismaService } from './../../prisma/prisma.service';
import { OpenAIService } from './../../openai/openai.service';
import { Job } from 'bullmq';

describe('DocumentPartProcessor', () => {
    let processor: DocumentPartProcessor;
    let prismaService: jest.Mocked<PrismaService>;
    let openAIService: jest.Mocked<OpenAIService>;

    const mockPrismaService = {
        document: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        documentPart: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        documentPartEmbedding: {
            create: jest.fn(),
        },
    };

    const mockOpenAIService = {
        getEmbedding: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocumentPartProcessor,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: OpenAIService,
                    useValue: mockOpenAIService,
                },
            ],
        }).compile();

        processor = module.get<DocumentPartProcessor>(DocumentPartProcessor);
        prismaService = module.get(PrismaService);
        openAIService = module.get(OpenAIService);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('process', () => {
        it('should successfully process a document part', async () => {
            const mockJob = {
                data: { documentId: 1, partId: 1 },
            } as Job;

            mockPrismaService.document.findUnique.mockResolvedValue({
                id: 1,
                status: 'CREATED',
            } as any);

            mockPrismaService.documentPart.findUnique.mockResolvedValue({
                id: 1,
                content: 'test content',
            } as any);

            mockOpenAIService.getEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);

            mockPrismaService.documentPartEmbedding.create.mockResolvedValue({
                id: 1,
            } as any);

            mockPrismaService.documentPart.findMany.mockResolvedValue([
                { status: 'READY' },
            ] as any);

            const result = await processor.process(mockJob);

            expect(result).toEqual({ result: 'OK' });
            expect(prismaService.documentPart.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'PROCESSING' },
            });
            expect(prismaService.documentPart.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'READY' },
            });
            expect(prismaService.document.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'PROCESSING' },
            });
            expect(prismaService.document.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'READY' },
            });
        });

        it('should handle document not found', async () => {
            const mockJob = {
                data: { documentId: 1, partId: 1 },
            } as Job;

            mockPrismaService.document.findUnique.mockResolvedValue(null);

            const result = await processor.process(mockJob);

            expect(result).toEqual({ result: 'ERROR' });
        });

        it('should handle failed embedding generation', async () => {
            const mockJob = {
                data: { documentId: 1, partId: 1 },
            } as Job;

            mockPrismaService.document.findUnique.mockResolvedValue({
                id: 1,
                status: 'PROCESSING',
            } as any);

            mockPrismaService.documentPart.findUnique.mockResolvedValue({
                id: 1,
                content: 'test content',
            } as any);

            mockOpenAIService.getEmbedding.mockResolvedValue(null);

            const result = await processor.process(mockJob);

            expect(result).toEqual({ result: 'ERROR' });
            expect(prismaService.document.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'FAILED' },
            });
            expect(prismaService.documentPart.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'FAILED' },
            });
        });

        it.only('should not update document status if not all parts are ready', async () => {
            const mockJob = {
                data: { documentId: 1, partId: 1 },
            } as Job;

            mockPrismaService.document.findUnique.mockResolvedValue({
                id: 1,
                status: 'PROCESSING',
            } as any);

            mockPrismaService.documentPart.findUnique.mockResolvedValue({
                id: 1,
                content: 'test content',
            } as any);

            mockOpenAIService.getEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);

            mockPrismaService.documentPartEmbedding.create.mockResolvedValue({
                id: 1,
            } as any);

            mockPrismaService.documentPart.findMany.mockResolvedValue([
                { status: 'READY' },
                { status: 'PROCESSING' },
            ] as any);

            const result = await processor.process(mockJob);

            expect(result).toEqual({ result: 'OK' });
            expect(prismaService.document.update).not.toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'READY' },
            });
        });
    });
});

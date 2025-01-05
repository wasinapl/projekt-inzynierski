import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InternalServerErrorException } from '@nestjs/common';

// Mocking the OpenAI client
jest.mock('openai');

describe('OpenAIService', () => {
    let service: OpenAIService;
    let configService: ConfigService;
    let openAIMock: jest.Mocked<OpenAI>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OpenAIService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('dummy-api-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<OpenAIService>(OpenAIService);
        configService = module.get<ConfigService>(ConfigService);

        // Initialize the mocked OpenAI client
        openAIMock = new OpenAI() as jest.Mocked<OpenAI>;
        service['client'] = openAIMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getEmbedding', () => {
        const mockText = 'Test embedding';
        const mockModel = 'text-embedding-ada-002';
        const mockEmbedding = [0.1, 0.2, 0.3];

        it('should return embedding successfully', async () => {
            openAIMock.embeddings = {
                create: jest.fn().mockResolvedValue({
                    data: [{ embedding: mockEmbedding }],
                }),
            } as any;

            const result = await service.getEmbedding(mockText, mockModel);

            expect(openAIMock.embeddings.create).toHaveBeenCalledWith({
                model: mockModel,
                input: mockText,
            });
            expect(result).toEqual(mockEmbedding);
        });

        it('should throw InternalServerErrorException on failure', async () => {
            openAIMock.embeddings = {
                create: jest.fn().mockRejectedValue(new Error('API Error')),
            } as any;

            await expect(
                service.getEmbedding(mockText, mockModel)
            ).rejects.toThrow(InternalServerErrorException);

            expect(openAIMock.embeddings.create).toHaveBeenCalledWith({
                model: mockModel,
                input: mockText,
            });
        });

        it('should use default model when not provided', async () => {
            const defaultModel = 'text-embedding-3-small';
            openAIMock.embeddings = {
                create: jest.fn().mockResolvedValue({
                    data: [{ embedding: mockEmbedding }],
                }),
            } as any;

            const result = await service.getEmbedding(mockText);

            expect(openAIMock.embeddings.create).toHaveBeenCalledWith({
                model: defaultModel,
                input: mockText,
            });
            expect(result).toEqual(mockEmbedding);
        });
    });
});

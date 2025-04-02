import { Injectable } from '@nestjs/common';
import { OpenAIService } from '@src/openai/openai.service';
import { ResponseLogService } from './response-log/response-log.service';
import {
    ChatCompletionChunk,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { ThreadService } from './thread/thread.service';
import { SenderType } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class ChatService {
    private lastInput: {
        model: string;
        messages: ChatCompletionMessageParam[];
    };

    constructor(
        private openai: OpenAIService,
        private readonly responseLogService: ResponseLogService,
        private readonly threadService: ThreadService,
        private readonly prisma: PrismaService
    ) {}

    async getAIResponseStream(
        message: string,
        threadCode: string,
        userId: number
    ): Promise<AsyncIterable<ChatCompletionChunk>> {
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [];
        const threadMessages = await this.getThreadMessages(threadCode, userId);

        const systemMessage = await this.getSystemMessage(message, userId);

        messages.push({
            role: 'system',
            content: systemMessage,
        });

        if (threadMessages.length > 0) {
            threadMessages.forEach((message) => {
                messages.push({
                    role:
                        message.senderType === SenderType.USER
                            ? 'user'
                            : 'assistant',
                    content: message.content,
                });
            });
        }

        this.lastInput = {
            model,
            messages,
        };

        return await this.openai.getChatCompletion(messages, model);
    }

    async saveLog(response: string) {
        await this.responseLogService.addLog(
            JSON.stringify(this.lastInput),
            JSON.stringify({ response })
        );
    }

    async getThreadMessages(threadCode: string, userId: number) {
        return await this.threadService.getThreadMesssages(threadCode, userId, {
            limit: 10,
        });
    }
    async getSystemMessage(message: string, userId: number): Promise<string> {
        let instruction =
            'Answer user question based on context below \n Context: \n';

        const parts = await this.prisma.documentPart.findMany({
            where: { Document: { userId: userId } },
            include: {
                DocumentPartEmbedding: true,
            },
        });

        const messageEmbedding = await this.openai.getEmbedding(message);

        const sortedParts = parts
            .map((part) => {
                const partVector = part.DocumentPartEmbedding
                    .vector as number[];
                const similarity = this.cosineSimilarity(
                    messageEmbedding,
                    partVector
                );
                return { ...part, similarity };
            })
            .filter((part) => part.similarity > 0.5)
            .sort((a, b) => b.similarity - a.similarity);

        let totalTokens = 0;
        const closestParts: typeof parts = [];

        for (const part of sortedParts) {
            if (totalTokens + part.tokens <= 1500) {
                closestParts.push(part);
                totalTokens += part.tokens;
            } else {
                break;
            }
        }

        const partsContentArray = closestParts.map((part) => part.content);
        instruction += `${JSON.stringify(partsContentArray)}`;
        return instruction;
    }

    cosineSimilarity = (vecA: number[], vecB: number[]) => {
        const dotProduct = vecA.reduce(
            (acc, val, index) => acc + val * vecB[index],
            0
        );
        const magnitudeA = Math.sqrt(
            vecA.reduce((acc, val) => acc + val * val, 0)
        );
        const magnitudeB = Math.sqrt(
            vecB.reduce((acc, val) => acc + val * val, 0)
        );
        return dotProduct / (magnitudeA * magnitudeB);
    };
}

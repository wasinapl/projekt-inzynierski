import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import OpenAI from 'openai';
import {
    ChatCompletionMessageParam,
    ChatCompletionChunk,
} from 'openai/resources/chat/completions';

@Injectable()
export class OpenAIService {
    private readonly client: OpenAI;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {
        this.client = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async getEmbedding(
        text: string,
        model: string = 'text-embedding-3-small'
    ): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model,
                input: text,
            });
            const embedding = response.data[0].embedding;
            return embedding;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to generate embedding.'
            );
        }
    }

    async getChatCompletion(
        messages: ChatCompletionMessageParam[],
        model: string = 'gpt-4o'
    ): Promise<AsyncIterable<ChatCompletionChunk>> {
        try {
            const completion = await this.client.chat.completions.create({
                model,
                messages,
                store: true,
                stream: true,
            });

            const prisma = this.prisma;

            async function* streamWithLogging(): AsyncIterable<ChatCompletionChunk> {
                const outputChunks: ChatCompletionChunk[] = [];

                for await (const chunk of completion) {
                    outputChunks.push(chunk);
                    yield chunk;
                }

                const input = {
                    model,
                    messages: messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                    })),
                };
                const output = {
                    content: outputChunks
                        .map((chunk) => chunk.choices[0].delta.content)
                        .join(''),
                };
                await prisma.responseLog.create({
                    data: {
                        input: input as Prisma.JsonValue,
                        output: output as Prisma.JsonValue,
                    },
                });
            }

            return streamWithLogging();
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to generate chat completion.'
            );
        }
    }
}

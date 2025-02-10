import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
    ChatCompletionMessageParam,
    ChatCompletionChunk,
} from 'openai/resources/chat/completions';

@Injectable()
export class OpenAIService {
    private client: OpenAI;

    constructor(private configService: ConfigService) {
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
            return completion;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to generate chat completion.'
            );
        }
    }
}

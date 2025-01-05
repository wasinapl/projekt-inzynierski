import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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

    // async getChatCompletion(
    //     messages: string[],
    //     model: string = 'gpt-4'
    // ): Promise<string> {
    //     try {
    //         const response = await this.openai.createChatCompletion({
    //             model,
    //             messages,
    //         });
    //         const reply = response.data.choices[0].message?.content.trim();
    //         return reply || '';
    //     } catch (error) {
    //         // Log the error or handle it as per your needs
    //         throw new InternalServerErrorException(
    //             'Failed to generate chat completion.'
    //         );
    //     }
    // }
}

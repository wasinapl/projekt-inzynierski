import { Injectable } from '@nestjs/common';
import { OpenAIService } from '@src/openai/openai.service';
import {
    ChatCompletionChunk,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

@Injectable()
export class ChatService {
    constructor(private openai: OpenAIService) {}

    async getAIResponseStream(
        prompt: string
    ): Promise<AsyncIterable<ChatCompletionChunk>> {
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt },
        ];

        return await this.openai.getChatCompletion(messages, model);
    }
}

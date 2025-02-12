import { Injectable } from '@nestjs/common';
import { OpenAIService } from '@src/openai/openai.service';
import { ResponseLogService } from './response-log/response-log.service';
import {
    ChatCompletionChunk,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

@Injectable()
export class ChatService {
    private lastInput: {
        model: string;
        messages: ChatCompletionMessageParam[];
    };

    constructor(
        private openai: OpenAIService,
        private readonly responseLogService: ResponseLogService
    ) {}

    async getAIResponseStream(
        prompt: string
    ): Promise<AsyncIterable<ChatCompletionChunk>> {
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt },
        ];

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
}

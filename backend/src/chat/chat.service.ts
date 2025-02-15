import { Injectable } from '@nestjs/common';
import { OpenAIService } from '@src/openai/openai.service';
import { ResponseLogService } from './response-log/response-log.service';
import {
    ChatCompletionChunk,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { ThreadService } from './thread/thread.service';
import { Prisma, SenderType } from '@prisma/client';

@Injectable()
export class ChatService {
    private lastInput: {
        model: string;
        messages: ChatCompletionMessageParam[];
    };

    constructor(
        private openai: OpenAIService,
        private readonly responseLogService: ResponseLogService,
        private readonly threadService: ThreadService
    ) {}

    async getAIResponseStream(
        threadCode: string,
        userId: number
    ): Promise<AsyncIterable<ChatCompletionChunk>> {
        const model = 'gpt-4o';
        const messages: ChatCompletionMessageParam[] = [];
        const threadMessages = await this.getThreadMessages(threadCode, userId);

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
}

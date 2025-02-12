import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ThreadModule } from './thread/thread.module';
import { OpenAIModule } from '@src/openai/openai.module';
import { AuthModule } from '@src/auth/auth.module';
import { ResponseLogModule } from './response-log/response-log.module';

@Module({
    imports: [ThreadModule, OpenAIModule, AuthModule, ResponseLogModule],
    providers: [ChatGateway, ChatService],
})
export class ChatModule {}

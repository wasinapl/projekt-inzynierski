import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ThreadModule } from './thread/thread.module';
import { OpenAIModule } from '@src/openai/openai.module';
import { AuthModule } from '@src/auth/auth.module';

@Module({
    imports: [ThreadModule, OpenAIModule, AuthModule],
    providers: [ChatGateway, ChatService],
})
export class ChatModule {}

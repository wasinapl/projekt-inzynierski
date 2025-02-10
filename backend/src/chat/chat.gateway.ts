import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SenderType } from '@prisma/client';
import { ThreadService } from './thread/thread.service';
import { WsJwtMiddleware } from '@src/auth/ws-jwt.middleware';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    constructor(
        private readonly chatService: ChatService,
        private readonly threadService: ThreadService,
        private readonly wsJwtMiddleware: WsJwtMiddleware
    ) {}

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        server.use((socket: Socket, next) => {
            this.wsJwtMiddleware.use(socket, next);
        });
    }

    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() data: { message: string; threadCode: string },
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        const user = client.handshake.auth.user;
        data.threadCode = 'test';
        data.message = 'hi';
        if (user && user.id) {
            await this.threadService.addThreadMessage(
                data.threadCode,
                user.id,
                { content: data.message, senderType: SenderType.USER }
            );

            client.emit('message', {
                sender: SenderType.USER,
                text: data.message,
            });

            const completion = await this.chatService.getAIResponseStream(
                data.message
            );

            let responseMessage = '';
            for await (const chunk of completion) {
                const finishReason = chunk.choices[0].finish_reason;
                if (finishReason == 'stop') {
                    client.emit('message-stream-end', { finished: true });
                    await this.threadService.addThreadMessage(
                        data.threadCode,
                        user.id,
                        {
                            content: responseMessage,
                            senderType: SenderType.AI,
                        }
                    );
                } else {
                    const content = chunk.choices[0].delta.content;
                    responseMessage += content;
                    client.emit('message-stream', { text: content });
                }
            }
        } else {
            client.disconnect(true);
        }
    }
}

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

        if (user && user.id) {
            const message = await this.threadService.addThreadMessage(
                data.threadCode,
                user.id,
                { content: data.message, senderType: SenderType.USER }
            );

            client.emit('message', data.threadCode, {
                id: message.id,
                content: message.content,
                senderType: SenderType.USER,
            });

            const completion = await this.chatService.getAIResponseStream(
                data.threadCode,
                user.id
            );

            let responseMessage = '';
            for await (const chunk of completion) {
                const finishReason = chunk.choices[0].finish_reason;
                if (finishReason == 'stop') {
                    client.emit('message-stream-end', data.threadCode, true);
                    const aiMessage = await this.threadService.addThreadMessage(
                        data.threadCode,
                        user.id,
                        {
                            content: responseMessage,
                            senderType: SenderType.AI,
                        }
                    );

                    client.emit('message', data.threadCode, {
                        id: aiMessage.id,
                        content: aiMessage.content,
                        senderType: aiMessage.senderType,
                    });
                    this.chatService.saveLog(responseMessage);
                } else {
                    const content = chunk.choices[0].delta.content;
                    responseMessage += content;
                    client.emit('message-stream', data.threadCode, content);
                }
            }
        } else {
            client.disconnect(true);
        }
    }
}

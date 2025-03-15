import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsJwtMiddleware } from 'src/auth/ws-jwt.middleware';

@WebSocketGateway({
    namespace: 'documents',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})
export class DocumentStatusGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(DocumentStatusGateway.name);

    constructor(private readonly wsJwtMiddleware: WsJwtMiddleware) {}

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        server.use((socket: Socket, next) => {
            this.wsJwtMiddleware.use(socket, next);
        });
    }

    handleConnection(client: Socket) {
        const user = client.handshake.auth.user;
        if (user && user.id) {
            client.join(user.id.toString());
        } else {
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`User disconnected: ${client.id}`);
    }

    sendStatusUpdate(documentCode: string, status: string, userId: number) {
        this.server
            .to(userId.toString())
            .emit('status-update', { documentCode, status });
    }
}

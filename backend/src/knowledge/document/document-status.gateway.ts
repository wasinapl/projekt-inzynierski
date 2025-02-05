import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('DocumentStatusGateway');

    afterInit(server: Server) {
        this.logger.log('DocumentStatusGateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    sendStatusUpdate(documentId: string, status: string) {
        this.server.emit('status-update', { documentId, status });
    }
}

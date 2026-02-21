import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust in production
    },
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('SocketGateway');
    // Map userId -> socketId(s)
    private userSockets: Map<string, string[]> = new Map();

    constructor(private jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                // Allow unauthenticated connections? Probably not for personalized events.
                // For now, disconnect if no token
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            client.data.userId = userId;

            // Store socket
            const userSockets = this.userSockets.get(userId) || [];
            userSockets.push(client.id);
            this.userSockets.set(userId, userSockets);

            // Join user room for targeted notifications
            client.join(`user_${userId}`);

            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            const userSockets = this.userSockets.get(userId) || [];
            const updatedSockets = userSockets.filter(id => id !== client.id);

            if (updatedSockets.length === 0) {
                this.userSockets.delete(userId);
            } else {
                this.userSockets.set(userId, updatedSockets);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    private extractToken(client: Socket): string | undefined {
        // Check auth header or query param
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        const tokenQuery = client.handshake.query.token;
        return Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery;
    }

    // --- Methods for other services to use ---

    sendNotification(userId: string, notification: any) {
        this.server.to(`user_${userId}`).emit('notification:new', notification);
    }

    sendMessage(userId: string, message: any) {
        this.server.to(`user_${userId}`).emit('message:new', message);
    }
}

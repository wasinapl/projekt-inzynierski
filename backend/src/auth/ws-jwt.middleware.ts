import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(socket: Socket, next: (err?: any) => void) {
        try {
            const authHeader = socket.handshake.headers.authorization;
            if (!authHeader) {
                throw new UnauthorizedException(
                    'Authorization header not found'
                );
            }

            const [bearer, token] = authHeader.split(' ');
            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException(
                    'Invalid authorization header format'
                );
            }

            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });

            socket.handshake.auth.user = payload;

            next();
        } catch (error) {
            next(error);
        }
    }
}

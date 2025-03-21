import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PrismaModule } from './../prisma/prisma.module';
import { LocalStrategy } from './local.strategy';
import { WsJwtMiddleware } from './ws-jwt.middleware';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
        }),
        PrismaModule,
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy, WsJwtMiddleware],
    controllers: [AuthController],
    exports: [AuthService, WsJwtMiddleware],
})
export class AuthModule {}

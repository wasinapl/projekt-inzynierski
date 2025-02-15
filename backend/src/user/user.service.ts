import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getUser(userId: number) {
        const user = this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
        });
    }
}

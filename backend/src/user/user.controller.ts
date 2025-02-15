import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    get(@Request() req) {
        return this.userService.getUser(req.user.id);
    }
}

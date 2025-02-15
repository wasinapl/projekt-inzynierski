import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';

@Controller('threads')
@UseGuards(JwtAuthGuard)
export class ThreadController {
    constructor(private readonly threadService: ThreadService) {}

    @Post()
    createThread(@Body() data: CreateThreadDto, @Req() req) {
        return this.threadService.createThread(data, req.user.id);
    }

    @Get(':threadCode')
    async getThread(@Param('threadCode') threadCode: string, @Req() req) {
        return this.threadService.getThreadByCode(threadCode, req.user.id);
    }

    @Get(':threadId/messages')
    async getMessages(
        @Req() req,
        @Param('threadCode') threadCode: string,
        @Query('limit') limit = 10,
        @Query('cursor') cursor?: number
    ) {
        return this.threadService.getThreadMesssages(threadCode, req.user.id, {
            cursor: cursor,
            limit: Number(limit),
        });
    }
}

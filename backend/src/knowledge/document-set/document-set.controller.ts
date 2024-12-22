import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
    Request,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { DocumentSetService } from './document-set.service';
import { CreateDocumentSetDto } from './dto/create-document-set.dto';
import { UpdateDocumentSetDto } from './dto/update-document-set.dto';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';

@Controller('document-sets')
@UseGuards(JwtAuthGuard)
export class DocumentSetController {
    constructor(private documentSetService: DocumentSetService) {}

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Request() req, @Body() data: CreateDocumentSetDto) {
        return this.documentSetService.createDocumentSet({
            ...data,
            userId: req.user.id,
        });
    }

    @Get()
    getAll(@Request() req) {
        return this.documentSetService.getDocumentSets(req.user.id);
    }

    @Get(':id')
    getOne(@Request() req, @Param('id') id: number) {
        return this.documentSetService.getDocumentSetById(
            Number(id),
            req.user.id
        );
    }

    @Put(':id')
    update(
        @Request() req,
        @Param('id') id: number,
        @Body() data: UpdateDocumentSetDto
    ) {
        return this.documentSetService.updateDocumentSet(
            Number(id),
            data,
            req.user.id
        );
    }

    @Delete(':id')
    delete(@Request() req, @Param('id') id: number) {
        return this.documentSetService.deleteDocumentSet(
            Number(id),
            req.user.id
        );
    }
}

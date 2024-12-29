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
    NotFoundException,
} from '@nestjs/common';
import { DocumentsSetService } from './documents-set.service';
import { CreateDocumentSetDto } from './dto/create-documents-set.dto';
import { UpdateDocumentSetDto } from './dto/update-documents-set.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('document-sets')
@UseGuards(JwtAuthGuard)
export class DocumentsSetController {
    constructor(private documentsSetService: DocumentsSetService) {}

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Request() req, @Body() data: CreateDocumentSetDto) {
        return this.documentsSetService.createDocumentsSet({
            ...data,
            userId: req.user.id,
        });
    }

    @Get()
    getAll(@Request() req) {
        return this.documentsSetService.getDocumentsSets(req.user.id);
    }

    @Get(':code')
    async getOne(@Request() req, @Param('code') code: string) {
        const document = await this.documentsSetService.getDocumentsSetByCode(
            code,
            req.user.id
        );

        if (!document) {
            throw new NotFoundException(
                `Documents set with code ${code} not found`
            );
        }
        return document;
    }

    @Put(':code')
    update(
        @Request() req,
        @Param('code') code: string,
        @Body() data: UpdateDocumentSetDto
    ) {
        return this.documentsSetService.updateDocumentsSet(
            code,
            data,
            req.user.id
        );
    }

    @Delete(':code')
    async delete(@Request() req, @Param('code') code: string) {
        await this.documentsSetService.deleteDocumentsSet(code, req.user.id);
        return { message: 'Document set deleted successfully' };
    }
}

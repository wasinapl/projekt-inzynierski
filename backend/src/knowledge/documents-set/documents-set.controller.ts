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
    Query,
    DefaultValuePipe,
    ParseIntPipe,
    ParseBoolPipe,
} from '@nestjs/common';
import { DocumentsSetService } from './documents-set.service';
import { CreateDocumentSetDto } from './dto/create-documents-set.dto';
import { UpdateDocumentSetDto } from './dto/update-documents-set.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('documents-sets')
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
    get(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
        @Query('order', new DefaultValuePipe('asc'))
        order: 'asc' | 'desc' = 'asc',
        @Query('public', new DefaultValuePipe(false), ParseBoolPipe)
        publicOnly: boolean,
        @Query('imported', new DefaultValuePipe(false), ParseBoolPipe)
        importedOnly: boolean,
        @Query('search', new DefaultValuePipe('')) search: string
    ) {
        return this.documentsSetService.getDocumentsSets(
            req.user.id,
            page,
            limit,
            sortBy,
            order,
            publicOnly,
            importedOnly,
            search
        );
    }

    @Get('/all')
    getAll(@Request() req) {
        return this.documentsSetService.getAllDocumentsSets(req.user.id);
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

    @Post('/import/:code')
    async importDocumentsSet(@Request() req, @Param('code') code: string) {
        return this.documentsSetService.importDocumentsSet(code, req.user.id);
    }

    @Delete('/import/:code')
    async removeImportDocumentsSet(
        @Request() req,
        @Param('code') code: string
    ) {
        return this.documentsSetService.removeImportDocumentsSet(
            code,
            req.user.id
        );
    }
}

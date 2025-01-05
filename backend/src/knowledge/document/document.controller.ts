import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentFromTextDto } from './dto/create-document-from-text.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocumentFromFileDto } from './dto/create-document-from-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './../../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
    constructor(private documentService: DocumentService) {}

    @Post('from-text')
    createFromText(@Request() req, @Body() data: CreateDocumentFromTextDto) {
        return this.documentService.createDocumentFromText({
            ...data,
            userId: req.user.id,
        });
    }

    @Post('from-file')
    @UseInterceptors(FileInterceptor('file'))
    createFromFile(
        @Request() req,
        @Body() data: CreateDocumentFromFileDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.documentService.createDocumentFromFile(
            {
                ...data,
                userId: req.user.id,
            },
            file
        );
    }

    @Get()
    getDocumentsBySet(
        @Request() req,
        @Query('documentsSetCode') documentsSetCode: string
    ) {
        return this.documentService.getDocumentsBySet(
            documentsSetCode,
            req.user.id
        );
    }

    @Get(':code')
    getOne(@Request() req, @Param('code') code: string) {
        return this.documentService.getDocumentByCode(code, req.user.id);
    }

    @Put(':code')
    update(
        @Request() req,
        @Param('code') code: string,
        @Body() data: UpdateDocumentDto
    ) {
        return this.documentService.updateDocument(code, data, req.user.id);
    }

    @Delete(':code')
    async delete(@Request() req, @Param('code') code: string) {
        await this.documentService.deleteDocument(code, req.user.id);
        return { message: 'Document deleted successfully' };
    }
}

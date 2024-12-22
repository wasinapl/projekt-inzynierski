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
        @Query('documentsSetId') documentsSetId: number
    ) {
        return this.documentService.getDocumentsBySet(
            Number(documentsSetId),
            req.user.id
        );
    }

    @Get(':id')
    getOne(@Request() req, @Param('id') id: number) {
        return this.documentService.getDocumentById(Number(id), req.user.id);
    }

    @Put(':id')
    update(
        @Request() req,
        @Param('id') id: number,
        @Body() data: UpdateDocumentDto
    ) {
        return this.documentService.updateDocument(
            Number(id),
            data,
            req.user.id
        );
    }

    @Delete(':id')
    delete(@Request() req, @Param('id') id: number) {
        return this.documentService.deleteDocument(Number(id), req.user.id);
    }
}

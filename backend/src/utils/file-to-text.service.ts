import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as path from 'path';
import { Document } from 'docx';
import * as PptxGenJS from 'pptxgenjs';

@Injectable()
export class FileToTextService {
    async extractText(file: Express.Multer.File): Promise<string> {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        switch (fileExtension) {
            case '.txt':
                return this.extractFromTxt(file);
            case '.pdf':
                return this.extractFromPdf(file);
            // case '.doc':
            // case '.docx':
            //     return this.extractFromDoc(file);
            // case '.ppt':
            // case '.pptx':
            //     return this.extractFromPowerPoint(file);
            default:
                throw new BadRequestException('Unsupported file type');
        }
    }

    private extractFromTxt(file: Express.Multer.File): string {
        return file.buffer.toString('utf-8');
    }

    private async extractFromPdf(file: Express.Multer.File): Promise<string> {
        try {
            const data = await pdf(file.buffer);
            return data.text;
        } catch (error) {
            throw new BadRequestException('Failed to extract text from PDF');
        }
    }

    // private async extractFromDoc(file: Express.Multer.File): Promise<string> {
    //     try {
    //         const doc = new Document(file.buffer);
    //         const text = await doc.getText();
    //         return text;
    //     } catch (error) {
    //         throw new BadRequestException(
    //             'Failed to extract text from DOC/DOCX'
    //         );
    //     }
    // }

    // private async extractFromPowerPoint(
    //     file: Express.Multer.File
    // ): Promise<string> {
    //     try {
    //         const pptx = new PptxGenJS();
    //         await pptx.load(file.buffer);
    //         let text = '';
    //         pptx.getSlides().forEach((slide) => {
    //             slide.text.forEach((textObj) => {
    //                 text += textObj.text + '\n';
    //             });
    //         });
    //         return text.trim();
    //     } catch (error) {
    //         throw new BadRequestException(
    //             'Failed to extract text from PowerPoint'
    //         );
    //     }
    // }
}

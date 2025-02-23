import { Injectable, BadRequestException } from '@nestjs/common';
import * as textract from 'textract';
import * as path from 'path';

/**
 * A simple service that:
 * 1. Validates allowed file extensions.
 * 2. Uses Textract to convert the file buffer to text.
 */
@Injectable()
export class FileToTextService {
    /**
     * Extend this list to include any other extensions that Textract supports.
     * For reference, Textract can handle:
     *   - Text-based files: .txt, .csv, .tsv, .html, .xml, ...
     *   - Microsoft Office: .doc, .docx, .ppt, .pptx, .xls, .xlsx, ...
     *   - PDFs
     *   - RTF
     *   - and more...
     */
    private readonly allowedExtensions = [
        '.txt',
        '.pdf',
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.xls',
        '.xlsx',
        '.rtf',
        '.csv',
        '.tsv',
        '.html',
        '.xml',
    ];

    async extractText(file: Express.Multer.File): Promise<string> {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (!this.allowedExtensions.includes(fileExtension)) {
            throw new BadRequestException(
                `Unsupported file type: ${fileExtension} is not allowed.`
            );
        }

        try {
            const text = await this.extractTextWithTextract(file);
            return text;
        } catch (error) {
            throw new BadRequestException(
                `Failed to extract text from file: ${(error as Error).message}`
            );
        }
    }

    /**
     * Helper function to wrap Textract in a Promise
     */
    private extractTextWithTextract(
        file: Express.Multer.File
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            textract.fromBufferWithName(
                file.originalname,
                file.buffer,
                (error, text) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(text);
                }
            );
        });
    }
}

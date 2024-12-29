import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDocumentFromTextDto {
    @IsString()
    @IsNotEmpty()
    documentsSetCode: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    userId: number;
}

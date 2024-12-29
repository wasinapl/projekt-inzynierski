import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDocumentFromFileDto {
    @IsString()
    @IsNotEmpty()
    documentsSetCode: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    userId: number;
}

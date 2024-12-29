import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDocumentFromFileDto {
    @IsNumber()
    documentsSetId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    userId: number;
}

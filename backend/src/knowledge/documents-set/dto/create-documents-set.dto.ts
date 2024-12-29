import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentSetDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    userId?: number;
}

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentSetDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    userId?: number;
    @IsBoolean()
    public?: boolean;
}

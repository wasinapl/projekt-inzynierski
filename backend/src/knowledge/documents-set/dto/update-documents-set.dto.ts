import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentSetDto {
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    @IsBoolean()
    public?: boolean;
}

import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentSetDto {
  @IsOptional()
  @IsString()
  name?: string;
}
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentSetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  userId?: number;
}
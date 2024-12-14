import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDocumentFromTextDto {
  @IsNumber()
  documentsSetId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  userId: number;
}
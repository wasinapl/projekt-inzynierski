import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateThreadDto {
    @IsNotEmpty()
    @IsNumber()
    documentsSetCode: string;
}

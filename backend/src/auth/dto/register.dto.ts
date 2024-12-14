import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
    @MinLength(3)
    name: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    password: string
}

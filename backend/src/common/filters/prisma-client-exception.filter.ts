import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        if (exception.code === 'P2002') {
            const target = exception.meta?.target
            if (target && typeof target === 'string' && target.includes('email')) {
                return response.status(400).json({
                    statusCode: 400,
                    message: 'The email address is already in use.',
                })
            }
        }

        return response.status(500).json({
            statusCode: 500,
            message: 'Internal server error.',
        })
    }
}

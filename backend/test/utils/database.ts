import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

const prisma = new PrismaClient()

export const cleanDatabase = async () => {
    await prisma.user.deleteMany()
}

const clearTable = async (table: string) => {
    switch (table) {
        case 'user':
            await prisma.user.deleteMany()
            break
    }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cleanDatabase = async () => {
    // 1. Delete DocumentPartEmbedding first (it references DocumentPart)
    await prisma.documentPartEmbedding.deleteMany({});

    // 2. Delete DocumentPart next (it references Document)
    await prisma.documentPart.deleteMany({});

    // 3. Delete Message (it references ChatThread)
    await prisma.message.deleteMany({});

    // 4. Delete ChatThread (it references DocumentsSet)
    await prisma.chatThread.deleteMany({});

    // 5. Delete Document (it references DocumentsSet and User)
    await prisma.document.deleteMany({});

    // 6. Delete DocumentsSet (it references User)
    await prisma.documentsSet.deleteMany({});

    // 7. Finally, delete User
    await prisma.user.deleteMany({});
};

-- AlterTable
ALTER TABLE `ChatThread` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ChatThread` ADD CONSTRAINT `ChatThread_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

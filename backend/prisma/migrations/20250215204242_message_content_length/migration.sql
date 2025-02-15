/*
  Warnings:

  - Made the column `userId` on table `ChatThread` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ChatThread` DROP FOREIGN KEY `ChatThread_userId_fkey`;

-- DropIndex
DROP INDEX `ChatThread_userId_fkey` ON `ChatThread`;

-- AlterTable
ALTER TABLE `ChatThread` MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `content` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `ChatThread` ADD CONSTRAINT `ChatThread_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `documentSetId` on the `ChatThread` table. All the data in the column will be lost.
  - Added the required column `documentsSetId` to the `ChatThread` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatThread` DROP FOREIGN KEY `ChatThread_documentSetId_fkey`;

-- DropIndex
DROP INDEX `ChatThread_documentSetId_fkey` ON `ChatThread`;

-- AlterTable
ALTER TABLE `ChatThread` DROP COLUMN `documentSetId`,
    ADD COLUMN `documentsSetId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `ChatThread` ADD CONSTRAINT `ChatThread_documentsSetId_fkey` FOREIGN KEY (`documentsSetId`) REFERENCES `DocumentsSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

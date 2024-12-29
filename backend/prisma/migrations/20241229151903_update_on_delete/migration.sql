-- DropForeignKey
ALTER TABLE `ChatThread` DROP FOREIGN KEY `ChatThread_documentSetId_fkey`;

-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_documentsSetId_fkey`;

-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_userId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentPart` DROP FOREIGN KEY `DocumentPart_documentId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentPartEmbedding` DROP FOREIGN KEY `DocumentPartEmbedding_documentPartId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentsSet` DROP FOREIGN KEY `DocumentsSet_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatThreadId_fkey`;

-- DropIndex
DROP INDEX `ChatThread_documentSetId_fkey` ON `ChatThread`;

-- DropIndex
DROP INDEX `Document_documentsSetId_fkey` ON `Document`;

-- DropIndex
DROP INDEX `Document_userId_fkey` ON `Document`;

-- DropIndex
DROP INDEX `DocumentPart_documentId_fkey` ON `DocumentPart`;

-- DropIndex
DROP INDEX `DocumentsSet_userId_fkey` ON `DocumentsSet`;

-- DropIndex
DROP INDEX `Message_chatThreadId_fkey` ON `Message`;

-- AddForeignKey
ALTER TABLE `DocumentsSet` ADD CONSTRAINT `DocumentsSet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_documentsSetId_fkey` FOREIGN KEY (`documentsSetId`) REFERENCES `DocumentsSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentPart` ADD CONSTRAINT `DocumentPart_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentPartEmbedding` ADD CONSTRAINT `DocumentPartEmbedding_documentPartId_fkey` FOREIGN KEY (`documentPartId`) REFERENCES `DocumentPart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatThread` ADD CONSTRAINT `ChatThread_documentSetId_fkey` FOREIGN KEY (`documentSetId`) REFERENCES `DocumentsSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatThreadId_fkey` FOREIGN KEY (`chatThreadId`) REFERENCES `ChatThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

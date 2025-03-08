-- CreateTable
CREATE TABLE `ImportedDocumentsSet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `documentsSetId` INTEGER NOT NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ImportedDocumentsSet_userId_documentsSetId_key`(`userId`, `documentsSetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImportedDocumentsSet` ADD CONSTRAINT `ImportedDocumentsSet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportedDocumentsSet` ADD CONSTRAINT `ImportedDocumentsSet_documentsSetId_fkey` FOREIGN KEY (`documentsSetId`) REFERENCES `DocumentsSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

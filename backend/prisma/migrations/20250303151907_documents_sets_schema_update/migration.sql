-- AlterTable
ALTER TABLE `DocumentsSet` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `public` BOOLEAN NOT NULL DEFAULT false;

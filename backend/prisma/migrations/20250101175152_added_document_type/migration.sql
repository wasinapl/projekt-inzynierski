-- AlterTable
ALTER TABLE `Document` ADD COLUMN `Type` ENUM('TEXT', 'FILE') NOT NULL DEFAULT 'TEXT';

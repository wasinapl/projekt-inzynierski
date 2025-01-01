/*
  Warnings:

  - You are about to drop the column `Status` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `Type` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Document` DROP COLUMN `Status`,
    DROP COLUMN `Type`,
    ADD COLUMN `status` ENUM('CREATED', 'PROCESSING', 'FAILED', 'READY') NOT NULL DEFAULT 'CREATED',
    ADD COLUMN `type` ENUM('TEXT', 'FILE') NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE `DocumentPart` ADD COLUMN `status` ENUM('CREATED', 'PROCESSING', 'FAILED', 'READY') NOT NULL DEFAULT 'CREATED';

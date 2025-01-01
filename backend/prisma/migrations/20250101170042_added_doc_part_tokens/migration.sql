/*
  Warnings:

  - Added the required column `tokens` to the `DocumentPart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DocumentPart` ADD COLUMN `tokens` INTEGER NOT NULL;

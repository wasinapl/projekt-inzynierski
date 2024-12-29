/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ChatThread` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `DocumentsSet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `ChatThread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `DocumentsSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ChatThread` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Document` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DocumentsSet` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ChatThread_code_key` ON `ChatThread`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `Document_code_key` ON `Document`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `DocumentsSet_code_key` ON `DocumentsSet`(`code`);

/*
  Warnings:

  - You are about to drop the column `is_orphan` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN "is_orphan";

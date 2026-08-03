/*
  Warnings:

  - You are about to drop the column `external_ref` on the `guides` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `guides` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `guides` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "guides_external_ref_key";

-- AlterTable
ALTER TABLE "guides" DROP COLUMN "external_ref",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "guides_name_key" ON "guides"("name");

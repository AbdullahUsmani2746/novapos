/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "Company_company_id_key";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "company_id" SET DATA TYPE VARCHAR(36),
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("company_id");

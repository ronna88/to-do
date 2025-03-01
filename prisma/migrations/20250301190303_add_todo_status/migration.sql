/*
  Warnings:

  - Added the required column `status` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TotoStatus" AS ENUM ('OPEN', 'INPROGRESS', 'CLOSED');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "status" "TotoStatus" NOT NULL;

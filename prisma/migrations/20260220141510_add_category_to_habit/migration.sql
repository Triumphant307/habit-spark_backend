/*
  Warnings:

  - Added the required column `category` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "category" TEXT NOT NULL;

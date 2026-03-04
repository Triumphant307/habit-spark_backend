/*
  Warnings:

  - A unique constraint covering the columns `[userId,slug]` on the table `Habit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Habit_slug_key";

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Habit_userId_slug_key" ON "Habit"("userId", "slug");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

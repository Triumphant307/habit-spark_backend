/*
  Warnings:

  - You are about to drop the column `onboardingCommitment` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingGoal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sidebarCollapsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingCommitment",
DROP COLUMN "onboardingGoal",
DROP COLUMN "sidebarCollapsed",
DROP COLUMN "theme";

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "theme" TEXT DEFAULT 'light',
    "sidebarCollapsed" BOOLEAN DEFAULT false,
    "onboardingGoal" TEXT,
    "onboardingCommitment" TEXT,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

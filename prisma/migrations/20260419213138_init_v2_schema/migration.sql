-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HabitEntry" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCommitment" TEXT,
ADD COLUMN     "onboardingGoal" TEXT,
ADD COLUMN     "sidebarCollapsed" BOOLEAN DEFAULT false,
ADD COLUMN     "theme" TEXT DEFAULT 'light';

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSuggestionFavorite" (
    "userId" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSuggestionFavorite_pkey" PRIMARY KEY ("userId","suggestionId")
);

-- CreateIndex
CREATE INDEX "Suggestion_category_idx" ON "Suggestion"("category");

-- CreateIndex
CREATE INDEX "Habit_userId_deletedAt_idx" ON "Habit"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "HabitEntry_habitId_deletedAt_idx" ON "HabitEntry"("habitId", "deletedAt");

-- AddForeignKey
ALTER TABLE "UserSuggestionFavorite" ADD CONSTRAINT "UserSuggestionFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSuggestionFavorite" ADD CONSTRAINT "UserSuggestionFavorite_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN "bestTime" TEXT;
ALTER TABLE "Place" ADD COLUMN "category" TEXT;
ALTER TABLE "Place" ADD COLUMN "duration" TEXT;
ALTER TABLE "Place" ADD COLUMN "region" TEXT;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "travelWindow" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "clientId" TEXT,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "selectedPlaceId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ru',
    "provider" TEXT NOT NULL DEFAULT 'offline',
    "model" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatHistory_sessionId_idx" ON "ChatHistory"("sessionId");

-- CreateIndex
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Place_category_idx" ON "Place"("category");

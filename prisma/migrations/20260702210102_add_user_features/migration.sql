/*
  Warnings:

  - Made the column `lat` on table `Place` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lng` on table `Place` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "SavedLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedLocation_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserTrial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserTrial_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Place" ("description", "id", "image", "lat", "lng", "name") SELECT "description", "id", "image", "lat", "lng", "name" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE TABLE "new_Tourist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "country" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tourist" ("email", "id", "name", "passwordHash", "updatedAt") SELECT "email", "id", "name", "passwordHash", "updatedAt" FROM "Tourist";
DROP TABLE "Tourist";
ALTER TABLE "new_Tourist" RENAME TO "Tourist";
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Visit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("createdAt", "id", "placeId", "touristId") SELECT "createdAt", "id", "placeId", "touristId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

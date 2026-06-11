-- Add tourist authentication fields.
ALTER TABLE "Tourist" ADD COLUMN "email" TEXT;
ALTER TABLE "Tourist" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Tourist" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");

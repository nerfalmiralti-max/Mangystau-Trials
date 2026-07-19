-- Extend route enquiries without deleting or rewriting existing contact data.
ALTER TABLE "ContactMessage"
ADD COLUMN "submissionId" TEXT,
ADD COLUMN "touristId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing rows use their primary key as an idempotency key. New requests use
-- a client-generated submission id that is validated by the API.
UPDATE "ContactMessage"
SET "submissionId" = "id"
WHERE "submissionId" IS NULL;

ALTER TABLE "ContactMessage"
ALTER COLUMN "submissionId" SET NOT NULL;

ALTER TABLE "ContactMessage"
ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE UNIQUE INDEX "ContactMessage_submissionId_key"
ON "ContactMessage"("submissionId");

CREATE INDEX "ContactMessage_touristId_createdAt_idx"
ON "ContactMessage"("touristId", "createdAt");

ALTER TABLE "ContactMessage"
ADD CONSTRAINT "ContactMessage_touristId_fkey"
FOREIGN KEY ("touristId") REFERENCES "Tourist"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(6),
ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP;

-- Update existing users to have verified emails (for backward compatibility)
UPDATE users SET "isEmailVerified" = TRUE WHERE "isEmailVerified" IS NULL;

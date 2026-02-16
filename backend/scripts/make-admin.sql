-- Make avimishra8354@gmail.com an admin
-- Run this SQL script in your PostgreSQL database

-- First, check if the user exists
SELECT id, email, username, role 
FROM users 
WHERE email = 'avimishra8354@gmail.com';

-- Update the user role to ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'avimishra8354@gmail.com';

-- Verify the change
SELECT id, email, username, role, "collegeId", "createdAt"
FROM users 
WHERE email = 'avimishra8354@gmail.com';

-- If the user doesn't exist yet, you'll need to register first
-- Then run the UPDATE command above

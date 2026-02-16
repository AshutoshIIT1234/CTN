# Database Seeding Guide

This directory contains seed files to populate your Critical Thinking Network database with dummy data for development and testing.

## Overview

The seeding process creates:
- **1 Admin User** (avimishra8354@gmail.com)
- **8 Colleges** (Harvard, Stanford, MIT, Berkeley, Yale, Princeton, Columbia, UChicago)
- **20 Dummy Users** (19 college users + 1 general user)
- **20 Dummy Posts** (mix of national and college-specific discussions)
- **Sample Comments** on posts

## Prerequisites

Before running the seeds, ensure you have:

1. **PostgreSQL Database** set up and running
2. **MongoDB** set up and running
3. **Environment Variables** configured in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   MONGODB_URI=mongodb://username:password@host:port/database
   ```

## Running Seeds

### Option 1: Run All Seeds (Recommended)
```bash
cd backend
npm run seed:all
```

### Option 2: Run Seeds Separately

1. **PostgreSQL Seeds** (Users, Colleges, Profiles):
   ```bash
   cd backend
   npm run seed
   ```

2. **MongoDB Seeds** (Posts, Comments):
   ```bash
   cd backend
   npm run seed:mongodb
   ```

## Seed Files

### PostgreSQL Seeds

1. **`admin-user.seed.ts`**
   - Creates the admin user with credentials:
     - Email: `avimishra8354@gmail.com`
     - Password: `Avin@shm01`
     - Role: `ADMIN`

2. **`colleges.seed.ts`**
   - Creates 8 major universities
   - Each with unique email domains for user association

3. **`dummy-users.seed.ts`**
   - Creates 20 diverse users with realistic profiles
   - Mix of different colleges and academic interests
   - Includes bios and random activity stats

### MongoDB Seeds

4. **`mongodb-posts.seed.ts`**
   - Creates 20 thought-provoking posts
   - Mix of national and college-specific discussions
   - Topics include AI ethics, climate change, philosophy, etc.
   - Includes sample comments on posts

## Dummy Data Details

### Users Created
- **Sarah Chen** (Harvard) - Philosophy major
- **Marcus Johnson** (Stanford) - Computer Science
- **Elena Rodriguez** (MIT) - Engineering
- **David Kim** (Berkeley) - Political Science
- **Amelia Wright** (Yale) - Literature
- **James Patel** (Princeton) - Economics
- **Sophia Martinez** (Columbia) - Psychology
- **Alex Thompson** (UChicago) - Sociology
- **Maya Singh** (Harvard) - Pre-med
- **Ryan Davis** (Stanford) - Environmental Science
- **Zoe Wilson** (MIT) - Mathematics
- **Carlos Garcia** (Berkeley) - History
- **Lily Anderson** (Yale) - Art History
- **Noah Brown** (Princeton) - International Relations
- **Emma Taylor** (Columbia) - Journalism
- **Lucas Miller** (UChicago) - Philosophy
- **Ava Jones** (Harvard) - Neuroscience
- **Ethan Lee** (Stanford) - Business
- **Isabella Clark** (MIT) - Physics
- **General User** - Independent thinker

### Sample Post Topics
- The Ethics of AI in Education
- Climate Change: Individual vs Systemic Action
- The Role of Social Media in Democracy
- Universal Basic Income: Utopia or Necessity?
- The Philosophy of Consciousness
- Mental Health Stigma in Academic Settings
- Campus Free Speech: Balancing Safety and Expression
- Research Ethics in the Age of Big Data
- And many more...

## Password Information

All dummy users have the password: `password123`

The admin user has the password: `Avin@shm01`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB database is accessible

3. **Duplicate Key Errors**
   - Seeds check for existing data before inserting
   - If you get duplicate errors, the data may already exist
   - You can safely ignore these warnings

### Clearing Data

To start fresh, you can:

1. **Clear PostgreSQL data**:
   ```sql
   TRUNCATE TABLE users, user_profiles, colleges CASCADE;
   ```

2. **Clear MongoDB data**:
   ```javascript
   db.posts.deleteMany({});
   db.comments.deleteMany({});
   ```

## Development Notes

- Seeds are idempotent - safe to run multiple times
- Existing data is preserved (no overwrites)
- Random elements ensure variety in likes, comments, etc.
- Posts include both national and college-specific content
- Users have realistic academic backgrounds and interests

## Next Steps

After seeding:
1. Start your backend server: `npm run start:dev`
2. Start your frontend: `npm run dev` (in frontend directory)
3. Visit the application and log in with any user
4. Explore the populated feed with realistic content

The seeded data provides a rich environment for testing and development of your Critical Thinking Network features.
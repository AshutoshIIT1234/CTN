import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';
import { Moderator } from '../../entities/moderator.entity';
import { Resource } from '../../entities/resource.entity';
import { ResourceAccess } from '../../entities/resource-access.entity';
import { PaymentSession } from '../../entities/payment-session.entity';
import { seedAdminUser } from './admin-user.seed';
import { seedColleges } from './colleges.seed';
import { seedDummyUsers } from './dummy-users.seed';
import { seedDummyPosts } from './dummy-posts.seed';

async function runSeeds() {
  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      User,
      UserProfile,
      College,
      Moderator,
      Resource,
      ResourceAccess,
      PaymentSession,
    ],
    synchronize: false, // Don't auto-sync in production
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Run seeds in order
    console.log('Starting database seeding...');
    
    // 1. Seed admin user
    await seedAdminUser(dataSource);
    
    // 2. Seed colleges
    console.log('Seeding colleges...');
    await seedColleges(dataSource);
    
    // 3. Seed dummy users
    console.log('Seeding dummy users...');
    await seedDummyUsers(dataSource);
    
    // 4. Seed dummy posts (structure only - MongoDB would need separate connection)
    console.log('Generating dummy posts data...');
    await seedDummyPosts(dataSource);
    
    console.log('Database seeding completed successfully');
    console.log('');
    console.log('=== SEEDING SUMMARY ===');
    console.log('✅ Admin user created');
    console.log('✅ 8 colleges created');
    console.log('✅ 20 dummy users created');
    console.log('✅ 20 dummy posts data generated');
    console.log('');
    console.log('Note: Posts are stored in MongoDB and would need a separate seeding process.');
    console.log('The dummy posts data structure has been generated and logged.');
    
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
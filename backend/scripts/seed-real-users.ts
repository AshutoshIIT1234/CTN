import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { User } from '../src/entities/user.entity';
import { UserProfile } from '../src/entities/user-profile.entity';
import { College } from '../src/entities/college.entity';
import { Moderator } from '../src/entities/moderator.entity';
import { Resource } from '../src/entities/resource.entity';
import { ResourceAccess } from '../src/entities/resource-access.entity';
import { PaymentSession } from '../src/entities/payment-session.entity';
import { seedRealUsers } from '../src/database/seeds/real-users.seed';

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../../.env') });

async function main() {
  console.log('='.repeat(60));
  console.log('SEEDING 15 REAL USERS WITH 2 POSTS EACH');
  console.log('='.repeat(60));
  console.log('');

  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  // Create PostgreSQL connection
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
    synchronize: false,
    logging: false,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await dataSource.initialize();
    console.log('✅ PostgreSQL connection established');
    console.log('');

    // Run the seeding
    await seedRealUsers(dataSource, process.env.MONGODB_URI);

    console.log('='.repeat(60));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('');
    console.log('You can now log in with any of the created users:');
    console.log('  Username: johnsmith, emilyjohnson, michaelchen, etc.');
    console.log('  Password: password123');
    console.log('');
    console.log('All users have 2 posts each:');
    console.log('  - 1 post in their college panel');
    console.log('  - 1 post in the general panel');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ ERROR DURING SEEDING');
    console.error('='.repeat(60));
    console.error('');
    console.error(error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connections closed');
  }
}

// Run the script
main();

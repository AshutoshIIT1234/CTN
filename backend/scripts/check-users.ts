import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';
import { User } from '../src/entities/user.entity';
import { UserProfile } from '../src/entities/user-profile.entity';
import { College } from '../src/entities/college.entity';
import { Moderator } from '../src/entities/moderator.entity';
import { Resource } from '../src/entities/resource.entity';
import { ResourceAccess } from '../src/entities/resource-access.entity';
import { PaymentSession } from '../src/entities/payment-session.entity';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function checkUsers() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, UserProfile, College, Moderator, Resource, ResourceAccess, PaymentSession],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    
    const userRepository = dataSource.getRepository(User);
    const collegeRepository = dataSource.getRepository(College);
    
    const users = await userRepository.find({ relations: ['college'] });
    const colleges = await collegeRepository.find();
    
    console.log(`\n✅ Total Users: ${users.length}`);
    console.log(`✅ Total Colleges: ${colleges.length}\n`);
    
    console.log('Recent Users:');
    users.slice(-15).forEach(user => {
      console.log(`  - ${user.username} (${user.displayName}) - ${user.college?.name || 'No college'}`);
    });
    
    // Check MongoDB
    const mongoClient = new MongoClient(process.env.MONGODB_URI!);
    await mongoClient.connect();
    const db = mongoClient.db();
    
    const postsCount = await db.collection('posts').countDocuments();
    const commentsCount = await db.collection('comments').countDocuments();
    
    console.log(`\n✅ Total Posts: ${postsCount}`);
    console.log(`✅ Total Comments: ${commentsCount}\n`);
    
    await mongoClient.close();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkUsers();

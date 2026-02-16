import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function makeUserAdmin() {
  const email = 'avimishra8354@gmail.com';

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected successfully!');

    // Check if user exists
    const checkResult = await dataSource.query(
      'SELECT id, email, username, role FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.length === 0) {
      console.error(`❌ User with email ${email} not found!`);
      console.log('\n📝 Please register this user first at: http://localhost:3000/auth/register');
      console.log('   Email: avimishra8354@gmail.com');
      console.log('   Password: Avin@shm01');
      console.log('\nThen run this script again.');
      await dataSource.destroy();
      return;
    }

    console.log('\n✅ User found:');
    console.log('   ID:', checkResult[0].id);
    console.log('   Email:', checkResult[0].email);
    console.log('   Username:', checkResult[0].username);
    console.log('   Current Role:', checkResult[0].role);

    // Update user role to ADMIN
    console.log('\n🔄 Updating role to ADMIN...');
    await dataSource.query(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['ADMIN', email]
    );

    // Verify the update
    const verifyResult = await dataSource.query(
      'SELECT id, email, username, role FROM users WHERE email = $1',
      [email]
    );

    console.log('\n✅ Update successful!');
    console.log('   New Role:', verifyResult[0].role);
    console.log('\n🎉 User is now an ADMIN!');
    console.log('\n📍 You can now access the admin panel at:');
    console.log('   http://localhost:3000/admin');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: avimishra8354@gmail.com');
    console.log('   Password: Avin@shm01');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the script
makeUserAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

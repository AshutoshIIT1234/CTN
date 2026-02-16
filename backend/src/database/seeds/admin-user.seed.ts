import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const userProfileRepository = dataSource.getRepository(UserProfile);

  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'avimishra8354@gmail.com' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return existingAdmin;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash('Avin@shm01', 10);

  // Create admin user
  const adminUser = userRepository.create({
    email: 'avimishra8354@gmail.com',
    username: 'admin',
    passwordHash,
    role: UserRole.ADMIN,
    displayName: 'System Administrator',
    collegeId: null, // Admin is not associated with any specific college
  });

  const savedUser = await userRepository.save(adminUser);

  // Create user profile
  const profile = userProfileRepository.create({
    userId: savedUser.id,
    postCount: 0,
    commentCount: 0,
    likesReceived: 0,
  });

  await userProfileRepository.save(profile);

  console.log('Admin user created successfully:', {
    id: savedUser.id,
    email: savedUser.email,
    username: savedUser.username,
    role: savedUser.role
  });

  return savedUser;
}
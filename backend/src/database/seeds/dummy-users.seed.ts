import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';

export async function seedDummyUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const userProfileRepository = dataSource.getRepository(UserProfile);
  const collegeRepository = dataSource.getRepository(College);

  // Get all colleges for random assignment
  const colleges = await collegeRepository.find();
  
  const dummyUsers = [
    {
      email: 'sarah.chen@harvard.edu',
      username: 'sarahchen',
      displayName: 'Sarah Chen',
      bio: 'Philosophy major passionate about ethics and critical thinking. Love exploring complex moral dilemmas.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'harvard.edu'
    },
    {
      email: 'marcus.johnson@stanford.edu',
      username: 'marcusj',
      displayName: 'Marcus Johnson',
      bio: 'Computer Science student interested in AI ethics and the future of technology.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'stanford.edu'
    },
    {
      email: 'elena.rodriguez@mit.edu',
      username: 'elenarod',
      displayName: 'Elena Rodriguez',
      bio: 'Engineering student who believes in the power of logical reasoning and evidence-based thinking.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'mit.edu'
    },
    {
      email: 'david.kim@berkeley.edu',
      username: 'davidkim',
      displayName: 'David Kim',
      bio: 'Political Science major exploring democratic theory and civic engagement.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'berkeley.edu'
    },
    {
      email: 'amelia.wright@yale.edu',
      username: 'ameliaw',
      displayName: 'Amelia Wright',
      bio: 'Literature student fascinated by narrative structures and their impact on society.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'yale.edu'
    },
    {
      email: 'james.patel@princeton.edu',
      username: 'jamespatel',
      displayName: 'James Patel',
      bio: 'Economics student analyzing market behaviors and social implications.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'princeton.edu'
    },
    {
      email: 'sophia.martinez@columbia.edu',
      username: 'sophiam',
      displayName: 'Sophia Martinez',
      bio: 'Psychology major studying cognitive biases and decision-making processes.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'columbia.edu'
    },
    {
      email: 'alex.thompson@uchicago.edu',
      username: 'alexthompson',
      displayName: 'Alex Thompson',
      bio: 'Sociology student examining social structures and their evolution.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'uchicago.edu'
    },
    {
      email: 'maya.singh@harvard.edu',
      username: 'mayasingh',
      displayName: 'Maya Singh',
      bio: 'Pre-med student interested in medical ethics and healthcare policy.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'harvard.edu'
    },
    {
      email: 'ryan.davis@stanford.edu',
      username: 'ryandavis',
      displayName: 'Ryan Davis',
      bio: 'Environmental Science major advocating for sustainable solutions.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'stanford.edu'
    },
    {
      email: 'zoe.wilson@mit.edu',
      username: 'zoewilson',
      displayName: 'Zoe Wilson',
      bio: 'Mathematics student exploring the beauty of logical proofs and abstract thinking.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'mit.edu'
    },
    {
      email: 'carlos.garcia@berkeley.edu',
      username: 'carlosgarcia',
      displayName: 'Carlos Garcia',
      bio: 'History major studying social movements and their lasting impact.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'berkeley.edu'
    },
    {
      email: 'lily.anderson@yale.edu',
      username: 'lilyanderson',
      displayName: 'Lily Anderson',
      bio: 'Art History student analyzing cultural narratives through visual media.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'yale.edu'
    },
    {
      email: 'noah.brown@princeton.edu',
      username: 'noahbrown',
      displayName: 'Noah Brown',
      bio: 'International Relations student passionate about global cooperation.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'princeton.edu'
    },
    {
      email: 'emma.taylor@columbia.edu',
      username: 'emmataylor',
      displayName: 'Emma Taylor',
      bio: 'Journalism student committed to truth-seeking and factual reporting.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'columbia.edu'
    },
    {
      email: 'lucas.miller@uchicago.edu',
      username: 'lucasmiller',
      displayName: 'Lucas Miller',
      bio: 'Philosophy student exploring existentialism and human consciousness.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'uchicago.edu'
    },
    {
      email: 'ava.jones@harvard.edu',
      username: 'avajones',
      displayName: 'Ava Jones',
      bio: 'Neuroscience student investigating the biological basis of reasoning.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'harvard.edu'
    },
    {
      email: 'ethan.lee@stanford.edu',
      username: 'ethanlee',
      displayName: 'Ethan Lee',
      bio: 'Business student analyzing ethical leadership and corporate responsibility.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'stanford.edu'
    },
    {
      email: 'isabella.clark@mit.edu',
      username: 'isabellaclark',
      displayName: 'Isabella Clark',
      bio: 'Physics student fascinated by the fundamental laws governing our universe.',
      role: UserRole.COLLEGE_USER,
      collegeDomain: 'mit.edu'
    },
    {
      email: 'general.user@example.com',
      username: 'generaluser',
      displayName: 'General User',
      bio: 'Independent thinker interested in diverse perspectives and meaningful discussions.',
      role: UserRole.GENERAL_USER,
      collegeDomain: null
    }
  ];

  const savedUsers = [];
  
  for (const userData of dummyUsers) {
    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      savedUsers.push(existingUser);
      console.log(`User already exists: ${existingUser.username}`);
      continue;
    }

    // Find college if specified
    let college = null;
    if (userData.collegeDomain) {
      college = colleges.find(c => c.emailDomain === userData.collegeDomain);
    }

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create user
    const user = userRepository.create({
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName,
      passwordHash,
      role: userData.role,
      collegeId: college?.id || null,
      bio: userData.bio,
    });

    const savedUser = await userRepository.save(user);

    // Create user profile
    const profile = userProfileRepository.create({
      userId: savedUser.id,
      postCount: Math.floor(Math.random() * 20) + 1, // 1-20 posts
      commentCount: Math.floor(Math.random() * 50) + 5, // 5-55 comments
      likesReceived: Math.floor(Math.random() * 100) + 10, // 10-110 likes
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
    });

    await userProfileRepository.save(profile);
    savedUsers.push(savedUser);

    console.log(`Created user: ${savedUser.username} (${savedUser.email})`);
  }

  return savedUsers;
}
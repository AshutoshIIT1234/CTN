import { DataSource } from 'typeorm';
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';

// 15 Real users from different colleges
const realUsersData = [
  {
    email: 'john.smith@nyu.edu',
    username: 'johnsmith',
    displayName: 'John Smith',
    bio: 'Computer Science major at NYU. Passionate about AI and machine learning. Love debating tech ethics.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'New York University',
    collegeDomain: 'nyu.edu',
    posts: [
      {
        title: 'The Ethics of AI in Healthcare',
        content: 'As AI becomes more prevalent in medical diagnosis, we need to seriously consider the ethical implications. Should we trust algorithms with life-or-death decisions? What happens when AI makes a mistake? I believe we need stronger regulatory frameworks before widespread adoption.',
        panelType: 'COLLEGE'
      },
      {
        title: 'Remote Learning: A Permanent Shift?',
        content: 'After experiencing both in-person and remote learning, I think hybrid models are the future. The flexibility is invaluable, but we lose something in human connection. What\'s your take on the future of education?',
        panelType: 'GENERAL'
      }
    ]
  },
  {
    email: 'emily.johnson@duke.edu',
    username: 'emilyjohnson',
    displayName: 'Emily Johnson',
    bio: 'Pre-med student at Duke. Interested in public health policy and healthcare accessibility.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Duke University',
    collegeDomain: 'duke.edu',
    posts: [
      {
        title: 'Healthcare as a Human Right',
        content: 'Universal healthcare isn\'t just about economics—it\'s about recognizing that access to medical care is a fundamental human right. Looking at countries with universal systems, we see better outcomes at lower costs. Why are we still debating this?',
        panelType: 'GENERAL'
      },
      {
        title: 'Mental Health Resources on Campus',
        content: 'Duke has made strides in mental health support, but wait times are still too long. We need more counselors and better crisis intervention. Mental health should be treated with the same urgency as physical health.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'michael.chen@cornell.edu',
    username: 'michaelchen',
    displayName: 'Michael Chen',
    bio: 'Engineering student at Cornell. Building sustainable solutions for tomorrow\'s challenges.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Cornell University',
    collegeDomain: 'cornell.edu',
    posts: [
      {
        title: 'Renewable Energy: The Path Forward',
        content: 'Solar and wind are great, but we need to talk about nuclear energy. Modern reactors are incredibly safe and produce zero emissions. If we\'re serious about climate change, nuclear has to be part of the conversation.',
        panelType: 'GENERAL'
      },
      {
        title: 'Cornell\'s Sustainability Initiatives',
        content: 'Proud of Cornell\'s commitment to carbon neutrality by 2035. Our campus is leading by example with geothermal heating, solar panels, and sustainable dining. Other universities should follow suit.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'sarah.williams@northwestern.edu',
    username: 'sarahwilliams',
    displayName: 'Sarah Williams',
    bio: 'Journalism major at Northwestern. Committed to truth, transparency, and holding power accountable.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Northwestern University',
    collegeDomain: 'northwestern.edu',
    posts: [
      {
        title: 'The Crisis of Trust in Media',
        content: 'Journalism is facing an existential crisis. People don\'t trust traditional media, but they\'ll believe random posts on social media. We need to rebuild trust through transparency, fact-checking, and admitting when we\'re wrong.',
        panelType: 'GENERAL'
      },
      {
        title: 'Student Journalism Matters',
        content: 'The Daily Northwestern has been covering important campus issues that administration would rather ignore. Student journalists are essential for campus accountability. Support your school newspaper!',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'david.martinez@upenn.edu',
    username: 'davidmartinez',
    displayName: 'David Martinez',
    bio: 'Economics student at UPenn. Analyzing markets, policy, and their impact on society.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'University of Pennsylvania',
    collegeDomain: 'upenn.edu',
    posts: [
      {
        title: 'Student Debt: A National Crisis',
        content: 'The student debt crisis is crippling an entire generation. We\'re talking about $1.7 trillion in debt. This isn\'t just an individual problem—it\'s affecting the entire economy. We need systemic solutions, not band-aids.',
        panelType: 'GENERAL'
      },
      {
        title: 'Wharton\'s Role in Ethical Business',
        content: 'Business schools have a responsibility to teach ethics alongside profit maximization. Wharton is doing good work here, but we need more emphasis on stakeholder capitalism vs. shareholder primacy.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'jessica.brown@brown.edu',
    username: 'jessicabrown',
    displayName: 'Jessica Brown',
    bio: 'Political Science major at Brown. Passionate about social justice and democratic reform.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Brown University',
    collegeDomain: 'brown.edu',
    posts: [
      {
        title: 'Voting Rights Under Attack',
        content: 'Voter suppression is real and it\'s happening right now. Restrictive ID laws, reduced polling locations, purged voter rolls—these aren\'t accidents. Democracy only works when everyone can participate.',
        panelType: 'GENERAL'
      },
      {
        title: 'Brown\'s Open Curriculum Philosophy',
        content: 'The open curriculum is what makes Brown special. Trusting students to design their own education creates more engaged, passionate learners. Other schools should consider this model.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'robert.taylor@dartmouth.edu',
    username: 'roberttaylor',
    displayName: 'Robert Taylor',
    bio: 'Environmental Studies major at Dartmouth. Fighting for climate action and environmental justice.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Dartmouth College',
    collegeDomain: 'dartmouth.edu',
    posts: [
      {
        title: 'Climate Change: We\'re Running Out of Time',
        content: 'The IPCC reports are clear: we have less than a decade to make dramatic changes. This isn\'t about polar bears anymore—it\'s about human survival. We need immediate, aggressive action on emissions.',
        panelType: 'GENERAL'
      },
      {
        title: 'Dartmouth\'s Carbon Neutrality Goal',
        content: 'Dartmouth committed to carbon neutrality by 2050, but that\'s not ambitious enough. We need to push for 2040 or earlier. The climate crisis demands urgency, not comfortable timelines.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'amanda.garcia@vanderbilt.edu',
    username: 'amandagarcia',
    displayName: 'Amanda Garcia',
    bio: 'Psychology major at Vanderbilt. Studying cognitive biases and decision-making.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Vanderbilt University',
    collegeDomain: 'vanderbilt.edu',
    posts: [
      {
        title: 'Social Media and Mental Health',
        content: 'Research is clear: excessive social media use correlates with anxiety and depression, especially in young people. We need to treat social media like we treat other potentially addictive substances—with caution and regulation.',
        panelType: 'GENERAL'
      },
      {
        title: 'Vanderbilt\'s Mental Health Support',
        content: 'Vanderbilt has expanded counseling services, but demand still exceeds capacity. We need more funding for mental health resources. Student wellbeing should be a top priority.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'christopher.lee@rice.edu',
    username: 'christopherlee',
    displayName: 'Christopher Lee',
    bio: 'Bioengineering student at Rice. Working on medical devices and healthcare innovation.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Rice University',
    collegeDomain: 'rice.edu',
    posts: [
      {
        title: 'Gene Editing: Promise and Peril',
        content: 'CRISPR technology offers incredible potential for treating genetic diseases, but we need clear ethical guidelines. Designer babies aren\'t science fiction anymore—they\'re a real possibility we need to address.',
        panelType: 'GENERAL'
      },
      {
        title: 'Rice\'s Research Excellence',
        content: 'Rice\'s bioengineering program is doing groundbreaking work in medical devices. Small class sizes mean real mentorship from world-class researchers. If you\'re interested in biotech, Rice should be on your list.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'michelle.anderson@emory.edu',
    username: 'michelleanderson',
    displayName: 'Michelle Anderson',
    bio: 'Public Health major at Emory. Focused on health equity and disease prevention.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Emory University',
    collegeDomain: 'emory.edu',
    posts: [
      {
        title: 'Vaccine Hesitancy: A Public Health Crisis',
        content: 'Vaccine hesitancy isn\'t just about COVID—it\'s threatening our ability to control preventable diseases. We need better science communication and to rebuild trust in public health institutions.',
        panelType: 'GENERAL'
      },
      {
        title: 'Emory\'s Public Health Leadership',
        content: 'Emory\'s partnership with the CDC gives students incredible opportunities for real-world public health experience. We\'re learning from the people on the front lines of disease prevention.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'daniel.wilson@georgetown.edu',
    username: 'danielwilson',
    displayName: 'Daniel Wilson',
    bio: 'International Relations major at Georgetown. Interested in diplomacy and global cooperation.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Georgetown University',
    collegeDomain: 'georgetown.edu',
    posts: [
      {
        title: 'The Future of International Cooperation',
        content: 'Nationalism is on the rise globally, but our biggest challenges—climate change, pandemics, nuclear proliferation—require international cooperation. We need stronger multilateral institutions, not weaker ones.',
        panelType: 'GENERAL'
      },
      {
        title: 'Georgetown\'s DC Advantage',
        content: 'Being in DC gives Georgetown students unparalleled access to policymakers, diplomats, and international organizations. If you want to work in foreign policy, location matters.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'rachel.thomas@carnegie.edu',
    username: 'rachelthomas',
    displayName: 'Rachel Thomas',
    bio: 'Computer Science major at Carnegie Mellon. Specializing in cybersecurity and privacy.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Carnegie Mellon University',
    collegeDomain: 'carnegie.edu',
    posts: [
      {
        title: 'Privacy in the Digital Age',
        content: 'We\'ve normalized constant surveillance by tech companies. Your data is being collected, analyzed, and sold. We need stronger privacy laws like GDPR, but with real enforcement mechanisms.',
        panelType: 'GENERAL'
      },
      {
        title: 'CMU\'s Cybersecurity Excellence',
        content: 'Carnegie Mellon\'s cybersecurity program is world-class. We\'re not just learning theory—we\'re doing real security research and working with industry partners on actual threats.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'kevin.moore@washu.edu',
    username: 'kevinmoore',
    displayName: 'Kevin Moore',
    bio: 'Philosophy major at WashU. Exploring ethics, logic, and the nature of knowledge.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'Washington University in St. Louis',
    collegeDomain: 'washu.edu',
    posts: [
      {
        title: 'The Value of Philosophy in Modern Society',
        content: 'People ask "what can you do with a philosophy degree?" The better question is: how can we navigate complex ethical issues without philosophical training? Critical thinking is more valuable than ever.',
        panelType: 'GENERAL'
      },
      {
        title: 'WashU\'s Philosophy Department',
        content: 'WashU\'s philosophy program emphasizes both analytic rigor and practical application. We\'re not just reading ancient texts—we\'re applying philosophical methods to contemporary problems.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'lauren.jackson@notre.edu',
    username: 'laurenjackson',
    displayName: 'Lauren Jackson',
    bio: 'Business major at Notre Dame. Interested in ethical leadership and corporate responsibility.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'University of Notre Dame',
    collegeDomain: 'notre.edu',
    posts: [
      {
        title: 'Corporate Social Responsibility Matters',
        content: 'Companies have responsibilities beyond maximizing shareholder value. Environmental impact, worker treatment, community investment—these aren\'t optional extras, they\'re core business obligations.',
        panelType: 'GENERAL'
      },
      {
        title: 'Notre Dame\'s Ethics Focus',
        content: 'Notre Dame\'s business school integrates ethics into every course. We\'re learning that good business and ethical business aren\'t mutually exclusive—they\'re inseparable.',
        panelType: 'COLLEGE'
      }
    ]
  },
  {
    email: 'brian.harris@usc.edu',
    username: 'brianharris',
    displayName: 'Brian Harris',
    bio: 'Film major at USC. Exploring how media shapes culture and society.',
    role: UserRole.COLLEGE_USER,
    collegeName: 'University of Southern California',
    collegeDomain: 'usc.edu',
    posts: [
      {
        title: 'Representation in Media Matters',
        content: 'Media representation isn\'t just about being politically correct—it\'s about accurately reflecting our diverse society. When people see themselves represented, it changes how they see their place in the world.',
        panelType: 'GENERAL'
      },
      {
        title: 'USC Film School Experience',
        content: 'USC\'s film school isn\'t just about technical skills—we\'re learning to tell meaningful stories that challenge perspectives and spark conversations. The industry connections don\'t hurt either!',
        panelType: 'COLLEGE'
      }
    ]
  }
];

export async function seedRealUsers(dataSource: DataSource, mongoUri: string) {
  const userRepository = dataSource.getRepository(User);
  const userProfileRepository = dataSource.getRepository(UserProfile);
  const collegeRepository = dataSource.getRepository(College);

  console.log('Starting real users seeding...');
  console.log('');

  // First, ensure all colleges exist
  const collegesCreated = [];
  for (const userData of realUsersData) {
    const existingCollege = await collegeRepository.findOne({
      where: { emailDomain: userData.collegeDomain }
    });

    if (!existingCollege) {
      const college = collegeRepository.create({
        name: userData.collegeName,
        emailDomain: userData.collegeDomain,
        logoUrl: `https://logo.clearbit.com/${userData.collegeDomain}`
      });
      const savedCollege = await collegeRepository.save(college);
      collegesCreated.push(savedCollege);
      console.log(`✅ Created college: ${savedCollege.name}`);
    }
  }

  if (collegesCreated.length > 0) {
    console.log(`\nCreated ${collegesCreated.length} new colleges`);
    console.log('');
  }

  // Create users and collect post data
  const savedUsers = [];
  const postsToCreate = [];

  for (const userData of realUsersData) {
    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`⚠️  User already exists: ${existingUser.username}`);
      savedUsers.push(existingUser);
      
      // Still add posts for existing users
      for (const postData of userData.posts) {
        postsToCreate.push({
          authorId: existingUser.id.toString(),
          authorName: existingUser.displayName,
          authorUsername: existingUser.username,
          authorRole: existingUser.role,
          collegeId: existingUser.collegeId?.toString() || null,
          ...postData
        });
      }
      continue;
    }

    // Find college
    const college = await collegeRepository.findOne({
      where: { emailDomain: userData.collegeDomain }
    });

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
      postCount: userData.posts.length,
      commentCount: Math.floor(Math.random() * 10) + 5, // 5-15 comments
      likesReceived: Math.floor(Math.random() * 50) + 20, // 20-70 likes
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Within last day
    });

    await userProfileRepository.save(profile);
    savedUsers.push(savedUser);

    console.log(`✅ Created user: ${savedUser.username} (${savedUser.displayName}) - ${college?.name}`);

    // Prepare posts for this user
    for (const postData of userData.posts) {
      postsToCreate.push({
        authorId: savedUser.id.toString(),
        authorName: savedUser.displayName,
        authorUsername: savedUser.username,
        authorRole: savedUser.role,
        collegeId: savedUser.collegeId?.toString() || null,
        ...postData
      });
    }
  }

  console.log('');
  console.log(`Created ${savedUsers.length} users with ${postsToCreate.length} posts to insert`);
  console.log('');

  // Now seed MongoDB posts
  console.log('Connecting to MongoDB to seed posts...');
  const mongoClient = new MongoClient(mongoUri);
  let commentsCount = 0;

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const postsCollection = db.collection('posts');

    // Create posts with realistic data
    const posts = postsToCreate.map(postData => ({
      ...postData,
      likes: Math.floor(Math.random() * 30) + 5, // 5-35 likes
      commentCount: Math.floor(Math.random() * 15) + 2, // 2-17 comments
      reportCount: 0,
      likedBy: [],
      isDeleted: false,
      isFlagged: false,
      isHidden: false,
      createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Within last 3 days
      updatedAt: new Date()
    }));

    const result = await postsCollection.insertMany(posts);
    console.log(`✅ Inserted ${result.insertedCount} posts into MongoDB`);

    // Create some realistic comments
    const commentsCollection = db.collection('comments');
    const insertedPosts = await postsCollection.find({
      authorId: { $in: savedUsers.map(u => u.id.toString()) }
    }).toArray();

    const comments = [];
    const commentTexts = [
      "This is a really thought-provoking perspective. I hadn't considered it from this angle.",
      "I respectfully disagree. Here's why I think differently...",
      "Great point! This connects to what we discussed in my ethics class.",
      "Can you elaborate on this? I'd like to understand your reasoning better.",
      "I think there's more nuance to this issue than you're presenting.",
      "This is exactly what I've been thinking about lately. Thanks for articulating it so well.",
      "Interesting take, but have you considered the counterarguments?",
      "I appreciate you bringing this up. It's an important conversation to have.",
      "I'm not sure I follow your logic here. Could you explain further?",
      "This reminds me of a similar debate we had in our philosophy seminar.",
      "Strong argument, but I think you're missing a key factor.",
      "I agree with your main point, but I'd add that...",
      "This is a complex issue that deserves more discussion.",
      "Well said! This is why these conversations matter.",
      "I see where you're coming from, but I have a different perspective."
    ];

    for (const post of insertedPosts) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = savedUsers[Math.floor(Math.random() * savedUsers.length)];
        
        const comment = {
          postId: post._id,
          authorId: randomUser.id.toString(),
          authorName: randomUser.displayName,
          authorUsername: randomUser.username,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          likes: Math.floor(Math.random() * 10), // 0-9 likes
          likedBy: [],
          isDeleted: false,
          createdAt: new Date(post.createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000), // After post creation
          updatedAt: new Date()
        };

        comments.push(comment);
      }
    }

    if (comments.length > 0) {
      const commentResult = await commentsCollection.insertMany(comments);
      commentsCount = commentResult.insertedCount;
      console.log(`✅ Inserted ${commentResult.insertedCount} comments into MongoDB`);
    }

  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    throw error;
  } finally {
    await mongoClient.close();
  }

  console.log('');
  console.log('=== REAL USERS SEEDING SUMMARY ===');
  console.log(`✅ ${savedUsers.length} real users created`);
  console.log(`✅ ${postsToCreate.length} posts created (2 per user)`);
  if (commentsCount > 0) {
    console.log(`✅ ${commentsCount} comments created`);
  }
  console.log('✅ All users are from different colleges');
  console.log('');
  console.log('Login credentials for all users:');
  console.log('Password: password123');
  console.log('');
  console.log('Sample users:');
  savedUsers.slice(0, 5).forEach(user => {
    console.log(`  - ${user.username} (${user.email})`);
  });
  console.log('');

  return savedUsers;
}

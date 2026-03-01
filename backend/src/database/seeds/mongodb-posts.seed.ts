import { MongoClient } from 'mongodb';
import { getDummyPostsData } from './dummy-posts.seed';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// This is a standalone MongoDB seeder for posts
// Run this separately after the main PostgreSQL seeding

async function seedMongoDBPosts() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const postsCollection = db.collection('posts');

    // Clear existing posts (optional)
    // await postsCollection.deleteMany({});
    // console.log('Cleared existing posts');

    // Get dummy posts data
    const postTemplates = getDummyPostsData();

    // You would need to get user data from PostgreSQL to create realistic posts
    // For now, we'll create posts with placeholder user data
    const dummyUsers = [
      { id: '1', username: 'sarahchen', displayName: 'Sarah Chen', role: 'COLLEGE_USER', collegeId: '1' },
      { id: '2', username: 'marcusj', displayName: 'Marcus Johnson', role: 'COLLEGE_USER', collegeId: '2' },
      { id: '3', username: 'elenarod', displayName: 'Elena Rodriguez', role: 'COLLEGE_USER', collegeId: '3' },
      { id: '4', username: 'davidkim', displayName: 'David Kim', role: 'COLLEGE_USER', collegeId: '4' },
      { id: '5', username: 'ameliaw', displayName: 'Amelia Wright', role: 'COLLEGE_USER', collegeId: '5' },
      { id: '6', username: 'jamespatel', displayName: 'James Patel', role: 'COLLEGE_USER', collegeId: '6' },
      { id: '7', username: 'sophiam', displayName: 'Sophia Martinez', role: 'COLLEGE_USER', collegeId: '7' },
      { id: '8', username: 'alexthompson', displayName: 'Alex Thompson', role: 'COLLEGE_USER', collegeId: '8' },
      { id: '9', username: 'mayasingh', displayName: 'Maya Singh', role: 'COLLEGE_USER', collegeId: '1' },
      { id: '10', username: 'ryandavis', displayName: 'Ryan Davis', role: 'COLLEGE_USER', collegeId: '2' },
      { id: '11', username: 'zoewilson', displayName: 'Zoe Wilson', role: 'COLLEGE_USER', collegeId: '3' },
      { id: '12', username: 'carlosgarcia', displayName: 'Carlos Garcia', role: 'COLLEGE_USER', collegeId: '4' },
      { id: '13', username: 'lilyanderson', displayName: 'Lily Anderson', role: 'COLLEGE_USER', collegeId: '5' },
      { id: '14', username: 'noahbrown', displayName: 'Noah Brown', role: 'COLLEGE_USER', collegeId: '6' },
      { id: '15', username: 'emmataylor', displayName: 'Emma Taylor', role: 'COLLEGE_USER', collegeId: '7' },
      { id: '16', username: 'lucasmiller', displayName: 'Lucas Miller', role: 'COLLEGE_USER', collegeId: '8' },
      { id: '17', username: 'avajones', displayName: 'Ava Jones', role: 'COLLEGE_USER', collegeId: '1' },
      { id: '18', username: 'ethanlee', displayName: 'Ethan Lee', role: 'COLLEGE_USER', collegeId: '2' },
      { id: '19', username: 'isabellaclark', displayName: 'Isabella Clark', role: 'COLLEGE_USER', collegeId: '3' },
      { id: '20', username: 'generaluser', displayName: 'General User', role: 'GENERAL_USER', collegeId: null }
    ];

    const posts = [];

    for (let i = 0; i < postTemplates.length; i++) {
      const template = postTemplates[i];
      const randomUser = dummyUsers[i % dummyUsers.length];

      // For college posts, try to use a college user
      let selectedUser = randomUser;
      if (template.panelType === 'COLLEGE') {
        const collegeUsers = dummyUsers.filter(u => u.collegeId);
        if (collegeUsers.length > 0) {
          selectedUser = collegeUsers[i % collegeUsers.length];
        }
      }

      const post = {
        authorId: selectedUser.id,
        authorName: selectedUser.displayName,
        authorUsername: selectedUser.username,
        authorRole: selectedUser.role,
        collegeId: selectedUser.collegeId,
        panelType: template.panelType,
        title: template.title,
        content: template.content,
        likes: Math.floor(Math.random() * 50) + 1, // 1-50 likes
        commentCount: Math.floor(Math.random() * 20) + 1, // 1-20 comments
        reportCount: 0,
        likedBy: [],
        isDeleted: false,
        isFlagged: false,
        isHidden: false,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        updatedAt: new Date()
      };

      posts.push(post);
    }

    // Insert posts
    const result = await postsCollection.insertMany(posts);
    console.log(`Inserted ${result.insertedCount} posts into MongoDB`);

    // Create some sample comments
    const commentsCollection = db.collection('comments');
    const sampleComments = [];

    // Get some post IDs for comments
    const insertedPosts = await postsCollection.find({}).limit(10).toArray();

    for (const post of insertedPosts) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post

      for (let j = 0; j < numComments; j++) {
        const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];

        const comments = [
          "This is a fascinating perspective! I hadn't considered this angle before.",
          "I respectfully disagree. Here's why I think differently...",
          "Great point! This reminds me of a similar discussion we had in class.",
          "Can you provide more evidence to support this claim?",
          "I think there's a middle ground here that we're missing.",
          "This is exactly what I've been thinking about lately.",
          "Interesting, but I think we need to consider the broader implications.",
          "Thanks for sharing this. It's given me a lot to think about.",
          "I'm not sure I follow your logic here. Could you elaborate?",
          "This connects well with what we learned about in our philosophy course."
        ];

        const comment = {
          postId: post._id,
          authorId: randomUser.id,
          authorName: randomUser.displayName,
          authorUsername: randomUser.username,
          content: comments[Math.floor(Math.random() * comments.length)],
          likes: Math.floor(Math.random() * 10), // 0-9 likes
          likedBy: [],
          isDeleted: false,
          createdAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000), // Within last 6 days
          updatedAt: new Date()
        };

        sampleComments.push(comment);
      }
    }

    if (sampleComments.length > 0) {
      const commentResult = await commentsCollection.insertMany(sampleComments);
      console.log(`Inserted ${commentResult.insertedCount} comments into MongoDB`);
    }

    console.log('MongoDB seeding completed successfully!');
    console.log('');
    console.log('=== MONGODB SEEDING SUMMARY ===');
    console.log(`✅ ${posts.length} posts created`);
    console.log(`✅ ${sampleComments.length} comments created`);
    console.log('');

  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedMongoDBPosts();
}

export { seedMongoDBPosts };
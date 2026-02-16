// Simple test script to verify unified feed functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testUnifiedFeed() {
  try {
    console.log('Testing Unified Feed API endpoints...\n');

    // Test national feed endpoint
    console.log('1. Testing National Feed...');
    try {
      const nationalResponse = await axios.get(`${API_BASE}/posts/national?page=1&limit=10`);
      console.log(`✓ National feed: ${nationalResponse.data.posts?.length || 0} posts found`);
    } catch (error) {
      console.log(`✗ National feed error: ${error.response?.status || error.message}`);
    }

    // Test college feed endpoint (without auth - should fail gracefully)
    console.log('\n2. Testing College Feed (without auth)...');
    try {
      const collegeResponse = await axios.get(`${API_BASE}/posts/college?page=1&limit=10`);
      console.log(`✓ College feed: ${collegeResponse.data.posts?.length || 0} posts found`);
    } catch (error) {
      console.log(`✗ College feed error (expected): ${error.response?.status || error.message}`);
    }

    console.log('\n3. Testing Frontend Unified Feed Logic...');
    
    // Simulate the frontend unified feed logic
    try {
      const [nationalResponse, collegeResponse] = await Promise.all([
        axios.get(`${API_BASE}/posts/national?page=1&limit=10`).catch(() => ({ data: { posts: [] } })),
        axios.get(`${API_BASE}/posts/college?page=1&limit=10`).catch(() => ({ data: { posts: [] } }))
      ]);
      
      // Combine and sort posts by creation date
      const allPosts = [
        ...(nationalResponse.data.posts || []),
        ...(collegeResponse.data.posts || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log(`✓ Unified feed simulation: ${allPosts.length} total posts combined`);
      console.log(`  - National posts: ${nationalResponse.data.posts?.length || 0}`);
      console.log(`  - College posts: ${collegeResponse.data.posts?.length || 0}`);
      
      if (allPosts.length > 0) {
        console.log(`  - Latest post: "${allPosts[0].title?.substring(0, 50)}..."`);
      }
      
    } catch (error) {
      console.log(`✗ Unified feed simulation error: ${error.message}`);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testUnifiedFeed();
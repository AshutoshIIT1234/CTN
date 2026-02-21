# Implementation Plan: Critical Thinking Network

## Overview

This implementation plan breaks down the Critical Thinking Network platform into discrete, incremental tasks. The platform uses Next.js (TypeScript) for the frontend, NestJS for the backend, and a multi-database architecture (PostgreSQL, MongoDB, Redis). Each task builds on previous work, with property-based tests integrated throughout to validate correctness early.

## Tasks

- [ ] 1. Set up project infrastructure and database connections
  - Initialize NestJS backend with TypeScript configuration
  - Initialize Next.js frontend with TypeScript and Tailwind CSS
  - Configure PostgreSQL connection with TypeORM
  - Configure MongoDB connection with Mongoose
  - Configure Redis connection for caching
  - Set up environment variables and configuration management
  - Create database migration scripts for PostgreSQL schema
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 2. Implement authentication and user management
  - [ ] 2.1 Create User entity and database schema
    - Define User entity with all fields (id, email, username, passwordHash, role, collegeId, etc.)
    - Define College entity with email domain registry
    - Create database migrations for users and colleges tables
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 11.1, 11.2, 11.4, 11.5_

  - [ ]*2.2 Write property test for username uniqueness
    - **Property 48: Username uniqueness validation**
    - **Validates: Requirements 11.2, 11.3**

  - [ ]*2.3 Write property test for username character validation
    - **Property 49: Username character validation**
    - **Validates: Requirements 11.4**

  - [ ]*2.4 Write property test for username length validation
    - **Property 50: Username length validation**
    - **Validates: Requirements 11.5**

  - [ ] 2.5 Implement authentication service
    - Create registration endpoint with email and username validation
    - Implement college email domain verification logic
    - Create login endpoint with JWT token generation
    - Implement role assignment based on email type
    - Add password hashing with bcrypt
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]*2.6 Write property test for normal email registration
    - **Property 1: Normal email registration creates general users**
    - **Validates: Requirements 1.2**

  - [ ]*2.7 Write property test for college email domain verification
    - **Property 2: College email domain verification**
    - **Validates: Requirements 1.3**

  - [ ]*2.8 Write property test for college email registration
    - **Property 3: College email registration creates college users**
    - **Validates: Requirements 1.4**

  - [ ]*2.9 Write property test for role assignment consistency
    - **Property 4: Role assignment consistency**
    - **Validates: Requirements 1.5**

  - [ ] 2.10 Implement JWT authentication guards
    - Create JWT strategy for Passport
    - Create role-based guards (RolesGuard)
    - Add authentication middleware
    - _Requirements: 1.5_

- [ ] 3. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement user profile system
  - [ ] 4.1 Create UserProfile entity and endpoints
    - Define UserProfile entity with stats (postCount, commentCount, likesReceived)
    - Create GET /users/:userId/profile endpoint
    - Create PATCH /users/profile endpoint for updates
    - Create POST /users/profile/picture endpoint for profile picture upload
    - _Requirements: 11.6, 11.7, 11.8_

  - [ ]*4.2 Write property test for own profile data completeness
    - **Property 51: Own profile data completeness**
    - **Validates: Requirements 11.6**

  - [ ]*4.3 Write property test for public profile data visibility
    - **Property 52: Public profile data visibility**
    - **Validates: Requirements 11.7**

  - [ ]*4.4 Write property test for profile update persistence
    - **Property 53: Profile update persistence**
    - **Validates: Requirements 11.8**

  - [ ] 4.5 Implement user search functionality
    - Create GET /users/search endpoint with query parameter
    - Implement multi-field search (username, displayName, college name)
    - Add relevance-based sorting (exact matches first)
    - Limit results to 50 users
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6_

  - [ ]*4.6 Write property test for search access control
    - **Property 55: Search access control**
    - **Validates: Requirements 12.1, 12.7**

  - [ ]*4.7 Write property test for multi-field search
    - **Property 56: Multi-field search**
    - **Validates: Requirements 12.2**

  - [ ]*4.8 Write property test for search result limit
    - **Property 59: Search result limit**
    - **Validates: Requirements 12.6**

- [ ] 5. Implement National Discussion Panel (MongoDB)
  - [ ] 5.1 Create Post and Comment schemas
    - Define Post schema with MongoDB (authorId, title, content, likes, commentCount, panelType)
    - Define Comment schema with threading support (parentCommentId)
    - Define Like schema for posts and comments
    - Define Report schema for content moderation
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.7_

  - [ ] 5.2 Implement post creation and feed endpoints
    - Create POST /posts/national endpoint for creating posts
    - Create GET /posts/national/feed endpoint with pagination
    - Add validation for title and content requirements
    - Store author identity with each post
    - _Requirements: 2.3, 2.4, 2.8_

  - [ ]*5.3 Write property test for post creation validation
    - **Property 7: Post creation validation**
    - **Validates: Requirements 2.3**

  - [ ]*5.4 Write property test for author identity preservation
    - **Property 8: Author identity preservation**
    - **Validates: Requirements 2.4**

  - [ ]*5.5 Write property test for username display in content
    - **Property 54: Username display in content**
    - **Validates: Requirements 11.9**

  - [ ] 5.6 Implement post interactions
    - Create POST /posts/:postId/like endpoint
    - Create POST /posts/:postId/comments endpoint
    - Create POST /posts/:postId/report endpoint
    - Implement comment threading logic
    - Update like counts and comment counts
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ]*5.7 Write property test for guest interaction prevention
    - **Property 6: Guest interaction prevention**
    - **Validates: Requirements 2.2**

  - [ ]*5.8 Write property test for authenticated user interaction access
    - **Property 10: Authenticated user interaction access**
    - **Validates: Requirements 2.6**

  - [ ]*5.9 Write property test for report creation
    - **Property 11: Report creation**
    - **Validates: Requirements 2.7**

- [ ] 6. Checkpoint - Ensure national panel tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement College Discussion Panel
  - [ ] 7.1 Create college-specific post endpoints
    - Create POST /posts/college endpoint with college association
    - Create GET /posts/college/:collegeId/feed endpoint
    - Add college branding (logo, name) to responses
    - Implement college-based post filtering
    - _Requirements: 3.1, 3.3, 3.4, 3.6, 3.8_

  - [ ]*7.2 Write property test for non-college user access denial
    - **Property 12: Non-college user access denial**
    - **Validates: Requirements 3.2**

  - [ ]*7.3 Write property test for college post filtering
    - **Property 13: College post filtering**
    - **Validates: Requirements 3.3**

  - [ ]*7.4 Write property test for college post isolation
    - **Property 14: College post isolation**
    - **Validates: Requirements 3.4, 3.5**

  - [ ]*7.5 Write property test for college branding inclusion
    - **Property 15: College branding inclusion**
    - **Validates: Requirements 3.6**

  - [ ] 7.6 Implement college panel access control
    - Add guards to verify user's college matches requested college panel
    - Prevent cross-college panel access
    - Enable interactions for college members only
    - _Requirements: 3.2, 3.5, 3.7_

  - [ ]*7.7 Write property test for college user interaction access
    - **Property 16: College user interaction access**
    - **Validates: Requirements 3.7**

- [ ] 8. Implement Resource System structure (PostgreSQL)
  - [ ] 8.1 Create Resource entities and schema
    - Define Resource entity with 5-level hierarchy fields
    - Define ResourceAccess entity for tracking unlocks
    - Create database migrations for resources tables
    - Add resource type enum validation
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_

  - [ ]*8.2 Write property test for five-level hierarchy completeness
    - **Property 17: Five-level hierarchy completeness**
    - **Validates: Requirements 4.1**

  - [ ]*8.3 Write property test for resource type validation
    - **Property 18: Resource type validation**
    - **Validates: Requirements 4.3**

  - [ ]*8.4 Write property test for file metadata completeness
    - **Property 21: File metadata completeness**
    - **Validates: Requirements 4.6**

  - [ ] 8.5 Implement resource browsing endpoints
    - Create GET /resources/browse endpoint with college selection
    - Implement hierarchy navigation (college → type → department → batch → files)
    - Return resource tree structure with metadata
    - _Requirements: 4.2, 4.4, 4.5, 4.6_

  - [ ]*8.6 Write property test for department organization
    - **Property 19: Department organization**
    - **Validates: Requirements 4.4**

  - [ ]*8.7 Write property test for batch organization
    - **Property 20: Batch organization**
    - **Validates: Requirements 4.5**

- [ ] 9. Implement own college resource access
  - [ ] 9.1 Create resource access control logic
    - Implement canAccessResource method checking user's college
    - Create GET /resources/:resourceId endpoint with access checks
    - Create GET /resources/:resourceId/download endpoint
    - Allow free access for own college resources
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]*9.2 Write property test for own college folder access
    - **Property 22: Own college folder access**
    - **Validates: Requirements 5.1**

  - [ ]*9.3 Write property test for own college file access without payment
    - **Property 23: Own college file access without payment**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]*9.4 Write property test for general user resource denial
    - **Property 24: General user resource denial**
    - **Validates: Requirements 5.4**

  - [ ]*9.5 Write property test for own college access tracking
    - **Property 25: Own college access tracking**
    - **Validates: Requirements 5.5**

- [ ] 10. Checkpoint - Ensure resource access tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement cross-college resource access and payment
  - [ ] 11.1 Implement cross-college browsing
    - Allow browsing other colleges' resource hierarchies
    - Display file names as preview only for locked files
    - Show payment prompt for locked file access
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]*11.2 Write property test for cross-college hierarchy browsing
    - **Property 26: Cross-college hierarchy browsing**
    - **Validates: Requirements 6.2**

  - [ ]*11.3 Write property test for cross-college folder visibility
    - **Property 27: Cross-college folder visibility**
    - **Validates: Requirements 6.3**

  - [ ]*11.4 Write property test for cross-college file preview
    - **Property 28: Cross-college file preview**
    - **Validates: Requirements 6.4**

  - [ ] 11.5 Implement payment service
    - Create PaymentSession entity
    - Create POST /payments/initiate endpoint
    - Create POST /payments/verify endpoint
    - Integrate with payment gateway (Stripe/Razorpay)
    - _Requirements: 6.5, 6.6, 6.7_

  - [ ] 11.6 Implement resource unlock workflow
    - Create POST /resources/:resourceId/unlock endpoint
    - Record unlock in ResourceAccess table
    - Grant access to specific file after payment
    - Prevent duplicate payments for already unlocked files
    - _Requirements: 6.7, 6.8_

  - [ ]*11.7 Write property test for locked file access prevention
    - **Property 29: Locked file access prevention**
    - **Validates: Requirements 6.5, 6.6**

  - [ ]*11.8 Write property test for payment unlocks file access
    - **Property 30: Payment unlocks file access**
    - **Validates: Requirements 6.7**

  - [ ]*11.9 Write property test for unlock record persistence
    - **Property 31: Unlock record persistence**
    - **Validates: Requirements 6.8**

  - [ ]*11.10 Write property test for payment does not grant college panel access
    - **Property 32: Payment does not grant college panel access**
    - **Validates: Requirements 6.9**

- [ ] 12. Implement Moderator Dashboard
  - [ ] 12.1 Create Moderator entity and role assignment
    - Define Moderator entity linking user to college
    - Create admin endpoint for assigning moderator role
    - Add moderator-specific guards
    - _Requirements: 7.1, 7.5, 7.6, 7.7_

  - [ ] 12.2 Implement resource upload for moderators
    - Create POST /resources/upload endpoint (moderator-only)
    - Validate resource type, department, and batch
    - Store file in correct hierarchical location
    - Restrict uploads to moderator's assigned college
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ]*12.3 Write property test for resource upload validation
    - **Property 33: Resource upload validation**
    - **Validates: Requirements 7.2**

  - [ ]*12.4 Write property test for resource hierarchical placement
    - **Property 34: Resource hierarchical placement**
    - **Validates: Requirements 7.3**

  - [ ]*12.5 Write property test for moderator college restriction
    - **Property 35: Moderator college restriction**
    - **Validates: Requirements 7.5, 7.6**

  - [ ] 12.6 Implement content moderation features
    - Add moderation flags to college panel posts
    - Create endpoints for reviewing reported content
    - Restrict moderation to moderator's college
    - _Requirements: 7.4_

  - [ ]*12.7 Write property test for moderator permission boundaries
    - **Property 36: Moderator permission boundaries**
    - **Validates: Requirements 7.7**

- [ ] 13. Implement Admin Dashboard
  - [ ] 13.1 Create admin-level endpoints
    - Create POST /admin/colleges endpoint for adding colleges
    - Create DELETE /admin/colleges/:id endpoint
    - Create POST /admin/colleges/domains endpoint for approving domains
    - Create POST /admin/moderators/assign endpoint
    - Create DELETE /admin/moderators/:id endpoint
    - _Requirements: 8.4, 8.5, 8.6_

  - [ ]*13.2 Write property test for college creation workflow
    - **Property 39: College creation workflow**
    - **Validates: Requirements 8.4**

  - [ ]*13.3 Write property test for domain approval workflow
    - **Property 40: Domain approval workflow**
    - **Validates: Requirements 8.5**

  - [ ]*13.4 Write property test for moderator role management
    - **Property 41: Moderator role management**
    - **Validates: Requirements 8.6**

  - [ ] 13.5 Implement admin content management
    - Create DELETE /admin/posts/:id endpoint (all panels)
    - Create DELETE /admin/resources/:id endpoint (all colleges)
    - Add admin guards for platform-wide access
    - _Requirements: 8.2, 8.3, 8.8_

  - [ ]*13.6 Write property test for admin cross-panel post management
    - **Property 37: Admin cross-panel post management**
    - **Validates: Requirements 8.2**

  - [ ]*13.7 Write property test for admin cross-college resource management
    - **Property 38: Admin cross-college resource management**
    - **Validates: Requirements 8.3**

  - [ ]*13.8 Write property test for admin platform-wide moderation
    - **Property 42: Admin platform-wide moderation**
    - **Validates: Requirements 8.8**

  - [ ] 13.9 Implement payment and unlock tracking
    - Create GET /admin/payments endpoint
    - Create GET /admin/unlocks endpoint
    - Display payment records and unlock history
    - _Requirements: 8.7_

- [ ] 14. Checkpoint - Ensure admin and moderator tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement frontend authentication and navigation
  - [ ] 15.1 Create authentication context and pages
    - Create AuthContext with login/logout/register methods
    - Create login page with email/password form
    - Create registration page with email/username/password form
    - Implement JWT token storage and refresh
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 15.2 Create navigation panel component
    - Create NavigationPanel component with role-based rendering
    - Implement navigation item visibility rules
    - Implement navigation item enabled/disabled states
    - Add visual indicators for disabled sections
    - Display sections in correct order
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_

  - [ ]*15.3 Write property test for role-based navigation panel
    - **Property 43: Role-based navigation panel**
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [ ]*15.4 Write property test for navigation section ordering
    - **Property 45: Navigation section ordering**
    - **Validates: Requirements 9.5**

  - [ ]*15.5 Write property test for navigation visual indicators
    - **Property 46: Navigation visual indicators**
    - **Validates: Requirements 9.8**

- [ ] 16. Implement frontend National Discussion Panel
  - [ ] 16.1 Create National Panel page and components
    - Create NationalPanel page component
    - Create PostCard component for displaying posts
    - Create PostForm component for creating posts
    - Create CommentSection component with threading
    - Implement like and report buttons
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 16.2 Implement guest mode restrictions
    - Disable post creation for guests
    - Disable commenting for guests
    - Disable liking for guests
    - Show login prompt on interaction attempts
    - _Requirements: 2.2_

  - [ ]*16.3 Write property test for comment threading and like counts
    - **Property 9: Comment threading and like counts**
    - **Validates: Requirements 2.5**

- [ ] 17. Implement frontend College Discussion Panel
  - [ ] 17.1 Create College Panel page and components
    - Create CollegePanel page component
    - Display college branding (logo and name)
    - Reuse PostCard and PostForm components
    - Filter posts by college
    - Implement access control checks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 18. Implement frontend Resource Browser
  - [ ] 18.1 Create Resource Browser page and components
    - Create ResourceBrowser page component
    - Create CollegeSelector dropdown
    - Create ResourceTree component for hierarchy navigation
    - Create ResourceFileCard component with lock/unlock states
    - Implement payment modal for locked files
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 18.2 Implement payment flow
    - Create PaymentModal component
    - Integrate with payment gateway
    - Handle payment success/failure
    - Update UI after successful unlock
    - _Requirements: 6.5, 6.6, 6.7, 6.8_

- [ ] 19. Implement frontend user profile and search
  - [ ] 19.1 Create user profile pages
    - Create UserProfile page component
    - Display profile information based on ownership
    - Create EditProfileModal for own profile
    - Implement profile picture upload
    - _Requirements: 11.6, 11.7, 11.8_

  - [ ] 19.2 Create user search functionality
    - Create UserSearch component
    - Implement search input with debouncing
    - Display search results with user cards
    - Navigate to user profile on click
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]*19.3 Write property test for search result data completeness
    - **Property 57: Search result data completeness**
    - **Validates: Requirements 12.3**

  - [ ]*19.4 Write property test for search result relevance ordering
    - **Property 58: Search result relevance ordering**
    - **Validates: Requirements 12.4**

- [ ] 20. Implement frontend Moderator Dashboard
  - [ ] 20.1 Create Moderator Dashboard page
    - Create ModeratorDashboard page component
    - Create ResourceUploadForm component
    - Implement file upload with progress indicator
    - Display moderator's college resources
    - Add content moderation interface
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 21. Implement frontend Admin Dashboard
  - [ ] 21.1 Create Admin Dashboard page
    - Create AdminDashboard page component
    - Create CollegeManagement section
    - Create UserManagement section
    - Create ContentModeration section
    - Create PaymentTracking section
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 22. Implement Redis caching layer
  - [ ] 22.1 Add caching to frequently accessed data
    - Cache user sessions
    - Cache resource hierarchies
    - Cache post feeds (national and college)
    - Cache user unlock records
    - Implement cache invalidation strategies
    - _Requirements: 9.7, 10.3_

  - [ ] 22.2 Implement cache warming and TTL
    - Set appropriate TTL for different cache types
    - Implement cache warming for popular content
    - Add cache hit/miss monitoring
    - _Requirements: 10.3_

- [ ] 23. Implement file storage service
  - [ ] 23.1 Set up file storage
    - Configure AWS S3 or similar cloud storage
    - Implement file upload service
    - Implement file download service with access control
    - Add file size and type validation
    - _Requirements: 4.6, 7.3_

- [ ] 24. Final checkpoint - Integration testing
  - [ ] 24.1 Run all property-based tests
    - Execute all 59 property tests
    - Verify all properties pass
    - Fix any failing properties
    - _All Requirements_

  - [ ]*24.2 Write integration tests for critical user journeys
    - Guest viewing national panel
    - User registration and login flow
    - College user accessing college panel
    - College user browsing and downloading own college resources
    - College user purchasing cross-college resources
    - Moderator uploading resources
    - Admin managing colleges and users

  - [ ] 24.3 Performance testing
    - Test database query performance
    - Test Redis cache effectiveness
    - Test file upload/download performance
    - Optimize slow queries and endpoints

- [ ] 25. Deployment and monitoring
  - Set up production environment
  - Configure CI/CD pipeline
  - Set up error tracking (Sentry)
  - Set up performance monitoring
  - Set up database backups
  - Deploy to production

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The platform uses fast-check for property-based testing with 5 iterations per test for fast execution
- All 59 correctness properties from the design document are covered by property tests

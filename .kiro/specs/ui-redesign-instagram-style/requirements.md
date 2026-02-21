# Requirements Document: UI Redesign - Instagram-Style Interface

## Introduction

This specification defines the requirements for redesigning the Critical Thinking Network (CTN) landing and main interface to match a modern, Instagram-inspired design system. The redesign focuses on creating a clean, academic, and highly usable interface that combines Instagram's usability with LinkedIn's professionalism.

## Glossary

- **CTN**: Critical Thinking Network - the social media platform for college students
- **Feed**: The main content area displaying posts in chronological or algorithmic order
- **Sidebar**: The left navigation panel containing primary navigation options
- **Right_Panel**: The right sidebar displaying supplementary information (Active Now, Top Thinkers, Trending Topics)
- **Post_Card**: An individual post display component containing header, content, and action buttons
- **Guest_User**: A non-authenticated user with limited access to platform features
- **Filter_Pills**: Horizontal navigation buttons for filtering feed content (Latest, Trending, Debate)
- **Action_Row**: The row of interactive buttons on a post (Like, Comment, Share, Save)
- **Skeleton_Loader**: A placeholder UI element shown while content is loading

## Requirements

### Requirement 1: Global Layout Structure

**User Story:** As a user, I want a consistent three-column layout, so that I can easily navigate and consume content.

#### Acceptance Criteria

1. THE Layout SHALL display three columns: left sidebar (240px), main content (680px), and right panel (320px)
2. THE Layout SHALL use 24px gaps between columns
3. THE Layout SHALL use #F5F7FB as the background color
4. WHEN the viewport width is below 1024px, THE Layout SHALL collapse the right panel
5. WHEN the viewport width is below 768px, THE Layout SHALL show only the main content with a bottom navigation bar

### Requirement 2: Left Sidebar Navigation

**User Story:** As a user, I want clear navigation options in the sidebar, so that I can access different sections of the platform.

#### Acceptance Criteria

1. THE Sidebar SHALL display the CTN logo with a rounded square icon and bold "CTN" text
2. THE Sidebar SHALL include navigation items in this order: National, College, Resources, Explore, Notifications, Trending, Profile, Settings, Create
3. WHEN a navigation item is active, THE Sidebar SHALL display it with a soft blue background (#E8F0FF), blue icon (#3B82F6), and bold label
4. WHEN a navigation item is inactive, THE Sidebar SHALL display it with a grey icon and muted text (#6B7280)
5. WHEN a Guest_User views locked items, THE Sidebar SHALL display a lock icon and reduced opacity (0.5)
6. THE Sidebar SHALL display a "Login" button at the bottom for Guest_User
7. WHEN the viewport is tablet-sized, THE Sidebar SHALL show icons only without labels

### Requirement 3: Feed Filter Pills

**User Story:** As a user, I want to filter feed content by type, so that I can view posts that interest me.

#### Acceptance Criteria

1. THE Feed SHALL display filter pills at the top: Latest, Trending, Debate
2. WHEN a filter pill is active, THE Filter_Pills SHALL display with blue background (#3B82F6) and white text
3. WHEN a filter pill is inactive, THE Filter_Pills SHALL display with white background and dark text (#111827)
4. THE Filter_Pills SHALL have rounded corners, subtle shadows, and hover highlight effects
5. WHEN a user clicks a filter pill, THE Feed SHALL update to show filtered content

### Requirement 4: Post Card Design

**User Story:** As a user, I want posts displayed in an attractive card format, so that content is easy to read and interact with.

#### Acceptance Criteria

1. THE Post_Card SHALL display a header with circular avatar, username (bold), timestamp (muted), and 3-dot menu
2. THE Post_Card SHALL display content with a bold title and body text with line-height 1.6
3. THE Post_Card SHALL display an Action_Row with Like, Comment, Share, and Save buttons using outline icons
4. WHEN a user interacts with an action button, THE Post_Card SHALL fill the icon and provide visual feedback
5. THE Post_Card SHALL display a footer with likes count, "view comments" link, and comment input hint
6. THE Post_Card SHALL use white background (#FFFFFF), subtle shadows, and rounded corners
7. WHEN a user hovers over a Post_Card, THE Post_Card SHALL lift slightly with expanded shadow

### Requirement 5: Guest User Experience

**User Story:** As a guest user, I want to see content but understand which features require login, so that I know what I'm missing.

#### Acceptance Criteria

1. WHEN a Guest_User views the interface, THE System SHALL disable interactive buttons (Like, Comment, Share, Save)
2. WHEN a Guest_User views the sidebar, THE System SHALL show lock icons on restricted items
3. WHEN a Guest_User attempts to interact with locked features, THE System SHALL display a login modal
4. THE Post_Card SHALL display "Login to comment..." hint for Guest_User
5. THE System SHALL allow Guest_User to view posts and scroll the feed without authentication

### Requirement 6: Right Panel Information

**User Story:** As a user, I want to see platform activity and trending information, so that I can discover popular content and active users.

#### Acceptance Criteria

1. THE Right_Panel SHALL display an "Active Now" card showing online users and today's discussion count
2. THE Right_Panel SHALL display a "Top Thinkers" card with avatar circles, college names, and post counts
3. THE Right_Panel SHALL display a "Trending Topics" card with topic names and discussion counts
4. THE Right_Panel SHALL use white card backgrounds with subtle shadows and rounded corners
5. WHEN the viewport is below 1024px, THE Right_Panel SHALL be hidden

### Requirement 7: Color System

**User Story:** As a user, I want a consistent color scheme throughout the interface, so that the platform feels cohesive and professional.

#### Acceptance Criteria

1. THE System SHALL use #3B82F6 as the primary blue color for active states and CTAs
2. THE System SHALL use #E8F0FF as the soft blue background for active navigation items
3. THE System SHALL use #F5F7FB as the main background color
4. THE System SHALL use #FFFFFF for card backgrounds
5. THE System SHALL use #E5E7EB for borders
6. THE System SHALL use #111827 for primary text and #6B7280 for secondary text

### Requirement 8: Typography System

**User Story:** As a user, I want readable and well-structured text, so that I can easily consume content.

#### Acceptance Criteria

1. THE System SHALL use the Inter font family for all text
2. THE System SHALL use font-weight 600 for titles
3. THE System SHALL use font-weight 500 for usernames
4. THE System SHALL use font-weight 400 for body text
5. THE System SHALL use font-weight 300 for metadata (timestamps, counts)

### Requirement 9: Micro-interactions

**User Story:** As a user, I want smooth animations and feedback, so that the interface feels responsive and polished.

#### Acceptance Criteria

1. WHEN a user hovers over a Post_Card, THE Post_Card SHALL animate with a lift effect and shadow expansion
2. WHEN a user clicks the Like button, THE Action_Row SHALL animate the heart icon with a fill and pop effect
3. WHEN a user hovers over sidebar items, THE Sidebar SHALL fade the background and shift icon colors
4. WHEN a modal opens, THE System SHALL animate with fade and scale-in effects plus background blur
5. THE System SHALL complete all animations within 200-300ms for smooth feel

### Requirement 10: Infinite Scroll and Performance

**User Story:** As a user, I want smooth scrolling and fast loading, so that I can browse content without interruption.

#### Acceptance Criteria

1. THE Feed SHALL implement infinite scroll to load more posts as the user scrolls down
2. THE Feed SHALL lazy load posts to improve initial page load performance
3. WHEN content is loading, THE Feed SHALL display Skeleton_Loader components
4. WHEN a user likes a post, THE System SHALL update the UI instantly without waiting for server response
5. THE System SHALL load posts in batches of 10-20 items per scroll trigger

### Requirement 11: Responsive Mobile Layout

**User Story:** As a mobile user, I want an optimized interface for small screens, so that I can use the platform on any device.

#### Acceptance Criteria

1. WHEN the viewport is mobile-sized (below 768px), THE System SHALL hide the sidebar and right panel
2. WHEN the viewport is mobile-sized, THE System SHALL display a bottom navigation bar with icons: Home, Explore, Create, Notifications, Profile
3. WHEN the viewport is tablet-sized (768px-1024px), THE Sidebar SHALL show icons only without labels
4. THE System SHALL maintain touch-friendly button sizes (minimum 44x44px) on mobile devices
5. THE Post_Card SHALL stack content vertically and use full width on mobile devices

### Requirement 12: Explore Feature

**User Story:** As a user, I want to discover new content and users, so that I can expand my network and find interesting discussions.

#### Acceptance Criteria

1. THE Sidebar SHALL include an "Explore" navigation item with a search icon
2. WHEN a user clicks Explore, THE System SHALL navigate to a discovery page
3. THE Explore page SHALL display trending posts, suggested users, and popular topics
4. THE Explore page SHALL allow filtering by content type and topic
5. THE Explore page SHALL use the same Post_Card design as the main feed

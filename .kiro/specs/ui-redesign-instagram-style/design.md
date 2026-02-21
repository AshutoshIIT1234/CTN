# Design Document: UI Redesign - Instagram-Style Interface

## Overview

This design document outlines the technical approach for redesigning the Critical Thinking Network (CTN) interface to match a modern, Instagram-inspired design system. The redesign focuses on creating a clean, academic interface that combines Instagram's usability with LinkedIn's professionalism while maintaining high readability and structured content presentation.

The design leverages existing React components and Next.js architecture, updating them to match the new visual specifications while maintaining performance and accessibility standards.

## Architecture

### Component Hierarchy

```
App Layout
├── MainLayout
│   ├── Sidebar (Left Navigation - 240px)
│   │   ├── Logo
│   │   ├── Navigation Menu
│   │   │   ├── National
│   │   │   ├── College (locked for guests)
│   │   │   ├── Resources (locked for guests)
│   │   │   ├── Explore (NEW)
│   │   │   ├── Notifications (locked for guests)
│   │   │   ├── Trending
│   │   │   ├── Profile (locked for guests)
│   │   │   └── Settings (locked for guests)
│   │   ├── Create Button
│   │   └── User Profile / Login Button
│   │
│   ├── Main Content Area (680px)
│   │   ├── Filter Pills
│   │   │   ├── Latest (active)
│   │   │   ├── Trending
│   │   │   └── Debate
│   │   ├── Post Feed
│   │   │   └── PostCard[] (infinite scroll)
│   │   └── Skeleton Loaders
│   │
│   └── Right Panel (320px)
│       ├── Active Now Card
│       ├── Top Thinkers Card
│       └── Trending Topics Card
│
└── Mobile Bottom Navigation (< 768px)
    ├── Home
    ├── Explore
    ├── Create
    ├── Notifications
    └── Profile
```

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion for micro-interactions
- **State Management**: Zustand (existing authStore)
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Infinite Scroll**: React Intersection Observer API

## Components and Interfaces

### 1. Layout Components

#### MainLayout Component

**Purpose**: Provides the three-column layout structure with responsive behavior.

**Props**:
```typescript
interface MainLayoutProps {
  children: ReactNode
  showRightPanel?: boolean
}
```

**Implementation Details**:
- Uses CSS Grid for three-column layout
- Column widths: 240px (sidebar), 680px (main), 320px (right panel)
- Gap: 24px between columns
- Background: #F5F7FB
- Responsive breakpoints:
  - < 768px: Single column with bottom nav
  - 768px - 1024px: Sidebar + Main (icons only sidebar)
  - > 1024px: Full three-column layout

#### Sidebar Component

**Purpose**: Left navigation panel with menu items and user profile.

**Props**:
```typescript
interface SidebarProps {
  className?: string
}
```

**State**:
```typescript
interface SidebarState {
  activeItem: string
  showCreateModal: boolean
}
```

**Menu Items Structure**:
```typescript
interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
  requiresAuth: boolean
  badge?: boolean
}
```

**Styling Specifications**:
- Active item: bg-[#E8F0FF], text-[#3B82F6], font-semibold
- Inactive item: text-[#6B7280], hover:bg-gray-50
- Locked item (guest): opacity-50, lock icon overlay
- Logo: Rounded square (40x40px), gradient background
- Transitions: 200ms ease for all hover states

#### RightPanel Component

**Purpose**: Displays supplementary information (Active Now, Top Thinkers, Trending Topics).

**Props**:
```typescript
interface RightPanelProps {
  className?: string
}
```

**Card Structure**:
```typescript
interface ActiveNowData {
  onlineUsers: number
  todayDiscussions: number
}

interface TopThinker {
  id: string
  name: string
  college: string
  postCount: number
  avatarUrl?: string
}

interface TrendingTopic {
  id: string
  name: string
  discussionCount: number
  emoji?: string
}
```

**Styling**:
- Card background: #FFFFFF
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Padding: 16px
- Gap between cards: 24px

### 2. Feed Components

#### FilterPills Component

**Purpose**: Horizontal filter navigation for feed content.

**Props**:
```typescript
interface FilterPillsProps {
  activeFilter: 'latest' | 'trending' | 'debate'
  onFilterChange: (filter: string) => void
}
```

**Styling**:
- Active pill: bg-[#3B82F6], text-white, font-semibold
- Inactive pill: bg-white, text-[#111827], border-[#E5E7EB]
- Border radius: 9999px (fully rounded)
- Padding: 8px 16px
- Shadow: 0 1px 2px rgba(0, 0, 0, 0.05)
- Hover: shadow-md, slight scale (1.02)
- Transition: all 200ms ease

#### PostCard Component

**Purpose**: Individual post display with Instagram-style interactions.

**Props**:
```typescript
interface PostCardProps {
  post: Post
  onUpdate: () => void
  onLoginRequired?: () => void
}

interface Post {
  id: string
  authorId: string
  authorUsername: string
  authorAvatar?: string
  title?: string
  content: string
  imageUrls?: string[]
  likes: number
  commentCount: number
  isLiked: boolean
  createdAt: string
  panelType: 'NATIONAL' | 'COLLEGE'
  collegeName?: string
}
```

**State**:
```typescript
interface PostCardState {
  liked: boolean
  likeCount: number
  isLiking: boolean
  showComments: boolean
  showLikeAnimation: boolean
}
```

**Interaction Handlers**:
- `handleLike()`: Optimistic UI update, API call, revert on error
- `handleDoubleClick()`: Trigger like animation and like action
- `handleComment()`: Toggle comment section, require auth
- `handleShare()`: Use Web Share API if available

**Styling**:
- Card background: #FFFFFF
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Hover: translateY(-2px), shadow-lg
- Transition: all 200ms ease

**Header Section**:
- Avatar: 32px circle, gradient background
- Username: font-semibold, text-[#111827]
- Timestamp: text-xs, text-[#6B7280]
- 3-dot menu: hover:opacity-60

**Content Section**:
- Title: font-semibold, text-base
- Body: line-height 1.6, text-sm
- Images: max-height 600px, object-contain

**Action Row**:
- Icons: 28px, stroke-width 2
- Like (filled when active): text-red-500
- Comment, Share, Save: text-[#111827]
- Hover: opacity-60
- Tap animation: scale(0.85)

#### PostSkeleton Component

**Purpose**: Loading placeholder for posts.

**Implementation**:
```typescript
interface PostSkeletonProps {
  count?: number
}
```

**Structure**:
- Animated pulse effect
- Mimics PostCard structure
- Background: #E5E7EB
- Border radius: matches PostCard

### 3. Mobile Components

#### MobileBottomNav Component

**Purpose**: Bottom navigation bar for mobile devices.

**Props**:
```typescript
interface MobileBottomNavProps {
  activeRoute: string
}
```

**Navigation Items**:
```typescript
interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  requiresAuth: boolean
}
```

**Styling**:
- Fixed bottom position
- Background: #FFFFFF
- Border-top: 1px solid #E5E7EB
- Height: 56px + safe-area-inset-bottom
- Shadow: 0 -1px 3px rgba(0, 0, 0, 0.1)
- Icons: 24px
- Active: text-[#3B82F6]
- Inactive: text-[#6B7280]

### 4. Modal Components

#### LoginModal Component

**Purpose**: Prompt guest users to log in when accessing locked features.

**Props**:
```typescript
interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}
```

**Animation**:
- Backdrop: fade-in, blur(8px)
- Modal: scale-in from 0.95 to 1.0
- Duration: 200ms ease-out

## Data Models

### User Model

```typescript
interface User {
  id: string
  username: string
  email: string
  college?: {
    id: string
    name: string
  }
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN'
  avatarUrl?: string
  createdAt: string
}
```

### Post Model

```typescript
interface Post {
  id: string
  authorId: string
  authorUsername: string
  title?: string
  content: string
  imageUrls?: string[]
  panelType: 'NATIONAL' | 'COLLEGE'
  collegeId?: string
  collegeName?: string
  likes: number
  commentCount: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}
```

### Feed Filter State

```typescript
interface FeedState {
  filter: 'latest' | 'trending' | 'debate'
  posts: Post[]
  page: number
  hasMore: boolean
  isLoading: boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Layout Consistency

*For any* viewport width, the layout should maintain proper column widths and gaps according to the responsive breakpoints defined in the design system.

**Validates: Requirements 1.1, 1.4, 1.5**

### Property 2: Navigation State Accuracy

*For any* navigation item, when it matches the current route, it should display with active styling (blue background, blue icon, bold text), and all other items should display inactive styling.

**Validates: Requirements 2.3, 2.4**

### Property 3: Guest User Restrictions

*For any* guest user (non-authenticated), all locked navigation items should display with reduced opacity and lock icons, and clicking them should trigger the login modal instead of navigation.

**Validates: Requirements 2.5, 5.1, 5.2, 5.3**

### Property 4: Filter Pill State

*For any* active filter pill, it should display with blue background and white text, while all inactive pills display with white background and dark text.

**Validates: Requirements 3.2, 3.3**

### Property 5: Post Card Hover Effect

*For any* post card, hovering should trigger a lift animation (translateY(-2px)) and expanded shadow within 200ms.

**Validates: Requirements 4.7, 9.1**

### Property 6: Like Button Optimistic Update

*For any* like action, the UI should update instantly (toggle heart fill, increment/decrement count) before the API call completes, and revert if the API call fails.

**Validates: Requirements 10.4**

### Property 7: Double-Click Like Animation

*For any* post card double-click by an authenticated user, if the post is not already liked, it should trigger both the like action and display the heart animation overlay for 1000ms.

**Validates: Requirements 9.2**

### Property 8: Infinite Scroll Loading

*For any* scroll event that reaches within 200px of the bottom, if more posts are available and no load is in progress, the system should fetch the next batch of posts and display skeleton loaders.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 9: Responsive Layout Transitions

*For any* viewport resize across breakpoints (768px, 1024px), the layout should smoothly transition between mobile (bottom nav), tablet (icon sidebar), and desktop (full three-column) layouts.

**Validates: Requirements 11.1, 11.2, 11.3**

### Property 10: Color System Consistency

*For any* UI element using primary blue, it should use #3B82F6, and for any active state background, it should use #E8F0FF, maintaining consistency across all components.

**Validates: Requirements 7.1, 7.2**

### Property 11: Typography Hierarchy

*For any* text element, it should use the correct font-weight according to its type: 600 for titles, 500 for usernames, 400 for body text, 300 for metadata.

**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

### Property 12: Animation Timing

*For any* micro-interaction animation (hover, click, modal open), it should complete within 200-300ms to maintain a smooth, responsive feel.

**Validates: Requirements 9.5**

### Property 13: Mobile Touch Targets

*For any* interactive element on mobile viewports (< 768px), it should have a minimum touch target size of 44x44px for accessibility.

**Validates: Requirements 11.4**

### Property 14: Guest Comment Interaction

*For any* guest user attempting to comment, the system should display "Login to comment..." hint and trigger the login modal on click instead of allowing comment input.

**Validates: Requirements 5.4**

### Property 15: Right Panel Visibility

*For any* viewport width below 1024px, the right panel should be hidden, and for widths above 1024px, it should be visible.

**Validates: Requirements 6.5, 11.2**

## Error Handling

### Network Errors

**Like Action Failure**:
- Revert optimistic UI update (toggle like state back, restore count)
- Log error to console
- Optional: Show toast notification (future enhancement)

**Post Loading Failure**:
- Display error message in feed
- Provide "Retry" button
- Maintain current posts in view

**Image Loading Failure**:
- Display placeholder image
- Show broken image icon
- Don't block post rendering

### Authentication Errors

**Expired Session**:
- Redirect to login page
- Preserve intended action in redirect URL
- Clear auth store

**Unauthorized Action**:
- Show login modal
- Display appropriate message
- Prevent action execution

### Validation Errors

**Invalid Post Data**:
- Skip rendering invalid post
- Log warning to console
- Continue rendering other posts

**Missing Required Props**:
- Use default values where possible
- Log error in development
- Graceful degradation in production

## Testing Strategy

### Unit Testing

**Component Tests**:
- Sidebar: Test active state, locked items, navigation clicks
- PostCard: Test like button, comment toggle, share functionality
- FilterPills: Test filter selection, active state
- RightPanel: Test data display, link navigation
- MobileBottomNav: Test navigation, active state

**Hook Tests**:
- useInfiniteScroll: Test scroll detection, loading state
- useOptimisticUpdate: Test optimistic updates, rollback

**Utility Tests**:
- formatDistanceToNow: Test date formatting
- Color utilities: Test color consistency

### Property-Based Testing

Each correctness property will be implemented as a property-based test using fast-check (JavaScript property testing library). Tests will run with minimum 100 iterations to ensure comprehensive coverage.

**Test Configuration**:
```typescript
// jest.config.js
module.exports = {
  testMatch: ['**/*.property.test.ts'],
  testTimeout: 10000, // Allow time for 100+ iterations
}
```

**Property Test Example**:
```typescript
// PostCard.property.test.ts
import fc from 'fast-check'

describe('PostCard Properties', () => {
  it('Property 6: Like button optimistic update', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          likes: fc.nat(),
          isLiked: fc.boolean(),
        }),
        async (post) => {
          // Test that UI updates before API completes
          // and reverts on API failure
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

**Property Tests to Implement**:
1. Layout consistency across viewport widths
2. Navigation active state accuracy
3. Guest user restriction enforcement
4. Filter pill state management
5. Post card hover effects
6. Like button optimistic updates
7. Double-click like animation
8. Infinite scroll triggering
9. Responsive layout transitions
10. Color system consistency
11. Typography hierarchy
12. Animation timing
13. Mobile touch target sizes
14. Guest comment interactions
15. Right panel visibility

### Integration Testing

**Feed Flow**:
- Load initial posts
- Scroll to trigger infinite load
- Filter posts by type
- Like/unlike posts
- Open comment section

**Authentication Flow**:
- Guest user views feed
- Clicks locked feature
- Sees login modal
- Logs in
- Accesses feature

**Responsive Behavior**:
- Resize viewport across breakpoints
- Verify layout changes
- Test mobile bottom nav
- Test sidebar collapse

### Visual Regression Testing

**Snapshot Tests**:
- Sidebar (active/inactive states)
- PostCard (with/without images)
- FilterPills (all states)
- RightPanel cards
- MobileBottomNav

**Interaction Snapshots**:
- Hover states
- Active states
- Loading states
- Error states

### Performance Testing

**Metrics to Monitor**:
- Initial page load: < 2s
- Time to interactive: < 3s
- Infinite scroll trigger: < 100ms
- Like action response: < 50ms (optimistic)
- Animation frame rate: 60fps

**Tools**:
- Lighthouse CI for performance budgets
- React DevTools Profiler for component rendering
- Chrome DevTools Performance tab

### Accessibility Testing

**Manual Tests**:
- Keyboard navigation through sidebar
- Screen reader announcements
- Focus indicators
- Color contrast ratios (WCAG AA)

**Automated Tests**:
- jest-axe for accessibility violations
- Test touch target sizes on mobile
- Test ARIA labels and roles

## Implementation Notes

### Existing Code Reuse

The current codebase already has:
- InstagramLayout component (needs updates)
- Sidebar component (needs menu item updates)
- RightPanel component (needs styling updates)
- InstagramPostCard component (mostly complete)
- MobileBottomNav component (needs updates)

### Key Updates Required

1. **Sidebar**: Add Explore menu item, update styling for active/inactive states
2. **FilterPills**: Create new component for feed filtering
3. **Layout**: Update column widths and gaps to match spec
4. **Colors**: Update Tailwind config to use exact color values
5. **Typography**: Ensure Inter font is loaded and weights are correct
6. **Animations**: Add micro-interactions using Framer Motion
7. **Infinite Scroll**: Implement using Intersection Observer
8. **Mobile**: Update bottom nav with correct icons and styling

### Performance Optimizations

1. **Image Lazy Loading**: Use Next.js Image component with lazy loading
2. **Code Splitting**: Lazy load modal components
3. **Memoization**: Use React.memo for PostCard to prevent unnecessary re-renders
4. **Virtual Scrolling**: Consider react-window for very long feeds (future enhancement)
5. **API Caching**: Use SWR or React Query for data fetching and caching

### Accessibility Considerations

1. **Semantic HTML**: Use proper heading hierarchy, nav elements, buttons
2. **ARIA Labels**: Add labels for icon-only buttons
3. **Focus Management**: Trap focus in modals, restore focus on close
4. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
5. **Screen Reader**: Announce dynamic content changes (likes, comments)
6. **Color Contrast**: Ensure all text meets WCAG AA standards (4.5:1 for normal text)

### Browser Compatibility

- **Target**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Minimum**: Last 2 versions
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Fallbacks**: Provide graceful degradation for older browsers
- **Polyfills**: Use Next.js built-in polyfills for modern JavaScript features

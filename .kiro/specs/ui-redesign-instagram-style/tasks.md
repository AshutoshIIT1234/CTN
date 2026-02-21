# Implementation Plan: UI Redesign - Instagram-Style Interface

## Overview

This implementation plan breaks down the UI redesign into discrete coding tasks that build incrementally. Each task focuses on updating or creating specific components to match the Instagram-style design specifications. The plan prioritizes core visual updates first, then adds interactive features, and finally implements performance optimizations.

## Tasks

- [x] 1. Update global styles and design tokens
  - Update Tailwind config with exact color values (#3B82F6, #E8F0FF, #F5F7FB, etc.)
  - Update globals.css with new background color and typography settings
  - Ensure Inter font is properly loaded with weights 300, 400, 500, 600
  - Add custom utility classes for Instagram-style cards and buttons
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Update MainLayout component for three-column structure
  - [x] 2.1 Implement CSS Grid layout with exact column widths (240px, 680px, 320px)
    - Set 24px gaps between columns
    - Apply #F5F7FB background color
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Add responsive breakpoints for layout changes
    - Below 768px: Single column with bottom nav
    - 768px-1024px: Sidebar + Main (icons only)
    - Above 1024px: Full three-column layout
    - _Requirements: 1.4, 1.5, 11.1, 11.2, 11.3_

  - [ ]* 2.3 Write property test for layout consistency
    - **Property 1: Layout Consistency**
    - **Validates: Requirements 1.1, 1.4, 1.5**

- [x] 3. Update Sidebar component with new design
  - [x] 3.1 Update logo area with rounded square icon and bold "CTN" text
    - 40x40px rounded square with gradient background
    - Bold "CTN" text next to logo
    - _Requirements: 2.1_

  - [x] 3.2 Add Explore menu item after Resources
    - Use Search icon from lucide-react
    - Position between Resources and Notifications
    - _Requirements: 2.2, 12.1_

  - [x] 3.3 Update active/inactive styling for menu items
    - Active: bg-[#E8F0FF], text-[#3B82F6], font-semibold
    - Inactive: text-[#6B7280], hover:bg-gray-50
    - Locked (guest): opacity-50, lock icon overlay
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 3.4 Update sidebar width to exactly 240px
    - Ensure consistent spacing and padding
    - _Requirements: 1.1_

  - [x] 3.5 Add icon-only mode for tablet viewports
    - Hide labels, show only icons
    - Maintain 240px width or collapse to 80px
    - _Requirements: 2.7_

  - [ ]* 3.6 Write property test for navigation state accuracy
    - **Property 2: Navigation State Accuracy**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 3.7 Write property test for guest user restrictions
    - **Property 3: Guest User Restrictions**
    - **Validates: Requirements 2.5, 5.1, 5.2, 5.3**

- [x] 4. Create FilterPills component for feed filtering
  - [x] 4.1 Create FilterPills component with Latest, Trending, Debate options
    - Implement pill button styling (rounded, shadow, hover effects)
    - Active: bg-[#3B82F6], text-white
    - Inactive: bg-white, text-[#111827], border
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Add filter state management and onChange handler
    - Connect to feed filtering logic
    - Update URL query params on filter change
    - _Requirements: 3.5_

  - [ ]* 4.3 Write property test for filter pill state
    - **Property 4: Filter Pill State**
    - **Validates: Requirements 3.2, 3.3**

- [x] 5. Update PostCard component styling
  - [x] 5.1 Update card container styling
    - White background, subtle shadow, rounded corners
    - Border: 1px solid #E5E7EB
    - _Requirements: 4.6_

  - [x] 5.2 Update header section (avatar, username, timestamp, menu)
    - 32px circular avatar with gradient background
    - Username: font-semibold, text-[#111827]
    - Timestamp: text-xs, text-[#6B7280]
    - _Requirements: 4.1_

  - [x] 5.3 Update content section (title, body text)
    - Title: font-semibold, text-base
    - Body: line-height 1.6, text-sm
    - _Requirements: 4.2_

  - [x] 5.4 Update action row (Like, Comment, Share, Save)
    - 28px icons, stroke-width 2
    - Like filled when active (red-500)
    - Hover: opacity-60
    - _Requirements: 4.3, 4.4_

  - [x] 5.5 Update footer (likes count, comments link, input hint)
    - Likes count: font-semibold
    - "View comments" link for guests
    - "Login to comment..." hint for guests
    - _Requirements: 4.5, 5.4_

  - [x] 5.6 Add hover lift effect
    - translateY(-2px) on hover
    - Expanded shadow
    - 200ms transition
    - _Requirements: 4.7, 9.1_

  - [ ]* 5.7 Write property test for post card hover effect
    - **Property 5: Post Card Hover Effect**
    - **Validates: Requirements 4.7, 9.1**

- [x] 6. Implement optimistic like updates
  - [x] 6.1 Update handleLike function for instant UI updates
    - Toggle like state immediately
    - Update count immediately
    - Revert on API error
    - _Requirements: 10.4_

  - [ ]* 6.2 Write property test for like button optimistic update
    - **Property 6: Like Button Optimistic Update**
    - **Validates: Requirements 10.4**

- [x] 7. Add double-click like animation
  - [x] 7.1 Implement double-click handler on post card
    - Detect double-click on post content area
    - Trigger like action if not already liked
    - _Requirements: 9.2_

  - [x] 7.2 Add heart animation overlay
    - Large heart icon (96px)
    - Scale-in animation (0 to 1.2 to 1)
    - Display for 1000ms
    - Use Framer Motion AnimatePresence
    - _Requirements: 9.2_

  - [ ]* 7.3 Write property test for double-click like animation
    - **Property 7: Double-Click Like Animation**
    - **Validates: Requirements 9.2**

- [x] 8. Update RightPanel component
  - [x] 8.1 Update Active Now card styling
    - White background, subtle shadow, rounded corners
    - Display online users count and today's discussions
    - _Requirements: 6.1_

  - [x] 8.2 Update Top Thinkers card styling
    - Avatar circles (40px)
    - College name and post count
    - Hover effect on each item
    - _Requirements: 6.2_

  - [x] 8.3 Update Trending Topics card styling
    - Topic name with emoji
    - Discussion count
    - Hover effect on each item
    - _Requirements: 6.3_

  - [x] 8.4 Ensure all cards use consistent styling
    - Background: #FFFFFF
    - Border: 1px solid #E5E7EB
    - Border radius: 8px
    - Padding: 16px
    - _Requirements: 6.4_

  - [x] 8.5 Add responsive hiding for viewports < 1024px
    - Hide entire right panel on smaller screens
    - _Requirements: 6.5_

  - [ ]* 8.6 Write property test for right panel visibility
    - **Property 15: Right Panel Visibility**
    - **Validates: Requirements 6.5, 11.2**

- [x] 9. Implement infinite scroll for feed
  - [x] 9.1 Create useInfiniteScroll hook using Intersection Observer
    - Detect when user scrolls near bottom (200px threshold)
    - Trigger load more callback
    - Prevent multiple simultaneous loads
    - _Requirements: 10.1_

  - [x] 9.2 Add skeleton loaders for loading states
    - Create PostSkeleton component
    - Display 3 skeletons while loading
    - Animated pulse effect
    - _Requirements: 10.3_

  - [x] 9.3 Integrate infinite scroll into feed page
    - Load posts in batches of 10-20
    - Update hasMore state
    - Handle loading and error states
    - _Requirements: 10.1, 10.2_

  - [ ]* 9.4 Write property test for infinite scroll loading
    - **Property 8: Infinite Scroll Loading**
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 10. Update MobileBottomNav component
  - [x] 10.1 Update navigation items (Home, Explore, Create, Notifications, Profile)
    - Use correct icons from lucide-react
    - 24px icon size
    - _Requirements: 11.2_

  - [x] 10.2 Update styling for active/inactive states
    - Active: text-[#3B82F6]
    - Inactive: text-[#6B7280]
    - _Requirements: 11.2_

  - [x] 10.3 Ensure minimum touch target size (44x44px)
    - Add padding to meet accessibility standards
    - _Requirements: 11.4_

  - [x] 10.4 Add safe-area-inset-bottom for iOS devices
    - Use CSS env() for safe area
    - _Requirements: 11.2_

  - [ ]* 10.5 Write property test for mobile touch targets
    - **Property 13: Mobile Touch Target Sizes**
    - **Validates: Requirements 11.4**

- [x] 11. Implement LoginModal for guest users
  - [x] 11.1 Create LoginModal component
    - Backdrop with blur effect
    - Modal with scale-in animation
    - Login message and CTA button
    - _Requirements: 5.3_

  - [x] 11.2 Add modal trigger for locked features
    - Trigger on locked sidebar items
    - Trigger on comment attempt
    - Trigger on like/save attempt
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 11.3 Add modal animations using Framer Motion
    - Backdrop fade-in
    - Modal scale-in from 0.95 to 1.0
    - 200ms duration
    - _Requirements: 9.4_

  - [ ]* 11.4 Write property test for guest comment interaction
    - **Property 14: Guest Comment Interaction**
    - **Validates: Requirements 5.4**

- [x] 12. Add micro-interactions and animations
  - [x] 12.1 Add sidebar hover effects
    - Background fade on hover
    - Icon color shift
    - 200ms transition
    - _Requirements: 9.3_

  - [x] 12.2 Add action button tap animations
    - Scale to 0.85 on tap
    - Use Framer Motion whileTap
    - _Requirements: 9.2_

  - [x] 12.3 Ensure all animations complete within 200-300ms
    - Review all transition durations
    - Update to match spec
    - _Requirements: 9.5_

  - [ ]* 12.4 Write property test for animation timing
    - **Property 12: Animation Timing**
    - **Validates: Requirements 9.5**

- [x] 13. Create Explore page
  - [x] 13.1 Create explore page route (/explore or /search)
    - Use same layout as main feed
    - _Requirements: 12.2_

  - [x] 13.2 Add search interface and filtering
    - Search input at top
    - Filter by content type and topic
    - _Requirements: 12.3, 12.4_

  - [x] 13.3 Display trending posts and suggested users
    - Reuse PostCard component
    - Add suggested users section
    - _Requirements: 12.3_

  - [x] 13.4 Use same PostCard design as main feed
    - Ensure consistency
    - _Requirements: 12.5_

- [x] 14. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Fix any failing tests
  - Verify visual consistency across components
  - Test responsive behavior at all breakpoints
  - Ask the user if questions arise

- [x] 15. Performance optimizations
  - [x] 15.1 Add React.memo to PostCard component
    - Prevent unnecessary re-renders
    - Compare props for equality

  - [x] 15.2 Implement image lazy loading
    - Use Next.js Image component
    - Add loading="lazy" attribute

  - [x] 15.3 Add code splitting for modal components
    - Use dynamic imports for LoginModal
    - Use dynamic imports for CreatePostModal

  - [ ]* 15.4 Run performance tests
    - Measure initial page load time
    - Measure time to interactive
    - Ensure 60fps animations

- [x] 16. Accessibility improvements
  - [x] 16.1 Add ARIA labels to icon-only buttons
    - Sidebar icons in tablet mode
    - Mobile bottom nav icons
    - Action buttons (like, comment, share)

  - [x] 16.2 Ensure keyboard navigation works
    - Tab through sidebar items
    - Tab through post actions
    - Tab through filter pills

  - [x] 16.3 Add focus indicators
    - Visible focus ring on all interactive elements
    - Use focus-visible for better UX

  - [ ]* 16.4 Run accessibility tests
    - Use jest-axe for automated checks
    - Test with screen reader
    - Verify color contrast ratios

- [x] 17. Final checkpoint - Comprehensive testing
  - Run full test suite (unit + property + integration)
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS, Android)
  - Verify all requirements are met
  - Ask the user for final review

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on visual updates first, then interactivity, then performance

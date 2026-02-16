import { render, screen, cleanup } from '@testing-library/react'
import { MainLayout } from './MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import fc from 'fast-check'

// Mock dependencies
jest.mock('@/store/authStore')
jest.mock('next/navigation')
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

describe('MainLayout Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  afterEach(() => {
    cleanup()
  })

  // Feature: critical-thinking-network, Property 43: Role-based navigation
  describe('Property 43: Role-based navigation', () => {
    it('should display appropriate navigation options based on user role', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            role: fc.constantFrom(
              UserRole.GUEST,
              UserRole.GENERAL_USER, 
              UserRole.COLLEGE_USER,
              UserRole.MODERATOR,
              UserRole.ADMIN
            ),
            collegeId: fc.option(fc.uuid(), { nil: undefined }),
            isAuthenticated: fc.boolean()
          }),
          (testData) => {
            // Clean up any previous renders
            cleanup()
            
            // Mock the auth store based on test data
            const mockUser = testData.isAuthenticated ? {
              id: testData.userId,
              username: testData.username,
              email: testData.email,
              role: testData.role,
              collegeId: testData.collegeId,
              createdAt: new Date()
            } : null

            mockUseAuthStore.mockReturnValue({
              user: mockUser,
              token: testData.isAuthenticated ? 'mock-token' : null,
              college: null,
              isAuthenticated: testData.isAuthenticated,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

      // Remove unused container variable
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      )

            // Verify navigation items based on role using more specific queries
            const criticalThinkingLinks = screen.getAllByText('Critical Thinking')
            const collegeDiscussionLinks = screen.queryAllByText('College Discussion')
            const academicResourcesLinks = screen.queryAllByText('Academic Resources')
            const moderatorLinks = screen.queryAllByText('Moderator')
            const adminLinks = screen.queryAllByText('Admin')
            const exploreLinks = screen.queryAllByText('Explore')

            // Critical Thinking should always be visible (at least one instance)
            expect(criticalThinkingLinks.length).toBeGreaterThan(0)

            if (!testData.isAuthenticated) {
              // Guest users should not see authenticated-only features
              expect(exploreLinks.length).toBeGreaterThan(0) // Explore is visible to guests
              expect(collegeDiscussionLinks.length).toBe(0)
              expect(academicResourcesLinks.length).toBe(0)
              expect(moderatorLinks.length).toBe(0)
              expect(adminLinks.length).toBe(0)
              // Home section should not be present
              const homeLinks = screen.queryAllByText('Home')
              expect(homeLinks.length).toBe(0)
            } else {
              // Authenticated users should see explore
              expect(exploreLinks.length).toBeGreaterThan(0)

              // Role-specific navigation
              switch (testData.role) {
                case UserRole.GUEST:
                  expect(collegeDiscussionLinks.length).toBe(0)
                  expect(academicResourcesLinks.length).toBe(0)
                  expect(moderatorLinks.length).toBe(0)
                  expect(adminLinks.length).toBe(0)
                  break

                case UserRole.GENERAL_USER:
                  // General users should see disabled Academic Resources and College Discussion
                  expect(collegeDiscussionLinks.length).toBeGreaterThan(0)
                  expect(academicResourcesLinks.length).toBeGreaterThan(0)
                  expect(moderatorLinks.length).toBe(0)
                  expect(adminLinks.length).toBe(0)
                  break

                case UserRole.COLLEGE_USER:
                  expect(collegeDiscussionLinks.length).toBeGreaterThan(0)
                  expect(academicResourcesLinks.length).toBeGreaterThan(0)
                  expect(moderatorLinks.length).toBe(0)
                  expect(adminLinks.length).toBe(0)
                  break

                case UserRole.MODERATOR:
                  expect(collegeDiscussionLinks.length).toBeGreaterThan(0)
                  expect(academicResourcesLinks.length).toBeGreaterThan(0)
                  expect(moderatorLinks.length).toBeGreaterThan(0)
                  expect(adminLinks.length).toBe(0)
                  break

                case UserRole.ADMIN:
                  expect(collegeDiscussionLinks.length).toBeGreaterThan(0)
                  expect(academicResourcesLinks.length).toBeGreaterThan(0)
                  expect(moderatorLinks.length).toBeGreaterThan(0)
                  expect(adminLinks.length).toBeGreaterThan(0)
                  break
              }
            }
          }
        ),
        { numRuns: 2 }
      )
    })

    it('should show login button for unauthenticated users', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No user
          () => {
            // Clean up any previous renders
            cleanup()
            
            mockUseAuthStore.mockReturnValue({
              user: null,
              token: null,
              college: null,
              isAuthenticated: false,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

            render(
              <MainLayout>
                <div>Test Content</div>
              </MainLayout>
            )

            // Should show sign in button for unauthenticated users
            const signInButtons = screen.getAllByText('Sign In')
            expect(signInButtons.length).toBeGreaterThan(0)

            // Should not show user dropdown (check for user avatar/initial)
            const userAvatars = screen.queryAllByText((content, element) => {
              // Look for single uppercase letters that would be user initials
              return /^[A-Z]$/.test(content) && element?.className?.includes('font-semibold')
            })
            expect(userAvatars.length).toBe(0)
          }
        ),
        { numRuns: 2 }
      )
    })

    it('should show user dropdown for authenticated users', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            role: fc.constantFrom(UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR, UserRole.ADMIN)
          }),
          (testData) => {
            // Clean up any previous renders
            cleanup()
            
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              email: testData.email,
              role: testData.role,
              createdAt: new Date()
            }

            mockUseAuthStore.mockReturnValue({
              user: mockUser,
              token: 'mock-token',
              college: null,
              isAuthenticated: true,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

            render(
              <MainLayout>
                <div>Test Content</div>
              </MainLayout>
            )

            // Should show user initial in dropdown
            const userInitials = screen.getAllByText(testData.username[0].toUpperCase())
            expect(userInitials.length).toBeGreaterThan(0)

            // Should not show sign in button
            const signInButtons = screen.queryAllByText('Sign In')
            expect(signInButtons.length).toBe(0)
          }
        ),
        { numRuns: 2 }
      )
    })
  })

  // Feature: critical-thinking-network, Property 44: Navigation section labeling
  describe('Property 44: Navigation section labeling', () => {
    it('should display correct section labels for navigation items', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            role: fc.constantFrom(UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR, UserRole.ADMIN)
          }),
          (testData) => {
            cleanup()
            
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              email: testData.email,
              role: testData.role,
              createdAt: new Date()
            }

            mockUseAuthStore.mockReturnValue({
              user: mockUser,
              token: 'mock-token',
              college: null,
              isAuthenticated: true,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

            render(
              <MainLayout>
                <div>Test Content</div>
              </MainLayout>
            )

            // Verify correct section labels are displayed
            expect(screen.getAllByText('Critical Thinking').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Academic Resources').length).toBeGreaterThan(0)
            expect(screen.getAllByText('College Discussion').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Profile').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)

            // Verify Home section is not present
            expect(screen.queryAllByText('Home').length).toBe(0)

            // Verify section headers are present
            expect(screen.getAllByText('Main').length).toBeGreaterThan(0)
            expect(screen.getAllByText('More').length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 2 }
      )
    })
  })

  // Feature: critical-thinking-network, Property 45: Navigation section ordering
  describe('Property 45: Navigation section ordering', () => {
    it('should display navigation sections in correct order', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress(),
            role: fc.constantFrom(UserRole.COLLEGE_USER, UserRole.MODERATOR, UserRole.ADMIN)
          }),
          (testData) => {
            cleanup()
            
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              email: testData.email,
              role: testData.role,
              createdAt: new Date()
            }

            mockUseAuthStore.mockReturnValue({
              user: mockUser,
              token: 'mock-token',
              college: null,
              isAuthenticated: true,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

            const { container } = render(
              <MainLayout>
                <div>Test Content</div>
              </MainLayout>
            )

            // Get all navigation links in the main section
            const mainSection = container.querySelector('nav')
            const navigationLinks = mainSection?.querySelectorAll('a')
            
            if (navigationLinks && navigationLinks.length >= 6) {
              const linkTexts = Array.from(navigationLinks).map(link => link.textContent?.trim()).filter(Boolean)
              
              // Verify the order of main navigation items (without Home)
              const expectedOrder = ['Critical Thinking', 'Academic Resources', 'College Discussion', 'Profile', 'Explore']
              const actualMainOrder = linkTexts.slice(0, 5) // First 5 should be main navigation
              
              expectedOrder.forEach((expectedItem, index) => {
                if (actualMainOrder[index]) {
                  expect(actualMainOrder[index]).toContain(expectedItem)
                }
              })
            }
          }
        ),
        { numRuns: 2 }
      )
    })
  })

  // Feature: critical-thinking-network, Property 46: Navigation visual indicators
  describe('Property 46: Navigation visual indicators', () => {
    it('should show visual indicators for disabled navigation sections', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            email: fc.emailAddress()
          }),
          (testData) => {
            cleanup()
            
            // Test with general user who should see disabled sections
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              email: testData.email,
              role: UserRole.GENERAL_USER,
              createdAt: new Date()
            }

            mockUseAuthStore.mockReturnValue({
              user: mockUser,
              token: 'mock-token',
              college: null,
              isAuthenticated: true,
              isLoading: false,
              setUser: jest.fn(),
              setToken: jest.fn(),
              setCollege: jest.fn(),
              logout: jest.fn(),
              setLoading: jest.fn()
            })

            const { container } = render(
              <MainLayout>
                <div>Test Content</div>
              </MainLayout>
            )

            // Check for disabled visual indicators (grayed out text and icons)
            const disabledLinks = container.querySelectorAll('a[class*="text-gray-600"]')
            expect(disabledLinks.length).toBeGreaterThan(0)

            // Check for opacity indicators on disabled items
            const opacityElements = container.querySelectorAll('[class*="opacity-50"]')
            expect(opacityElements.length).toBeGreaterThan(0)

            // Check for disabled state indicators (dots)
            const disabledDots = container.querySelectorAll('.bg-gray-600.rounded-full')
            expect(disabledDots.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 2 }
      )
    })
  })

  // Unit tests for specific scenarios
  describe('Specific navigation scenarios', () => {
    beforeEach(() => {
      cleanup()
    })
    
    it('should show all navigation items for admin users', () => {
      const mockAdmin = {
        id: 'admin-id',
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date()
      }

      mockUseAuthStore.mockReturnValue({
        user: mockAdmin,
        token: 'mock-token',
        college: null,
        isAuthenticated: true,
        isLoading: false,
        setUser: jest.fn(),
        setToken: jest.fn(),
        setCollege: jest.fn(),
        logout: jest.fn(),
        setLoading: jest.fn()
      })

      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      )

      // Admin should see all navigation items (except Home which is removed)
      expect(screen.getAllByText('Critical Thinking').length).toBeGreaterThan(0)
      expect(screen.getAllByText('College Discussion').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Academic Resources').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Moderator').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
      
      // Verify Home section is not present
      expect(screen.queryAllByText('Home').length).toBe(0)
    })

    it('should show limited navigation for general users', () => {
      const mockGeneralUser = {
        id: 'user-id',
        username: 'generaluser',
        email: 'user@gmail.com',
        role: UserRole.GENERAL_USER,
        createdAt: new Date()
      }

      mockUseAuthStore.mockReturnValue({
        user: mockGeneralUser,
        token: 'mock-token',
        college: null,
        isAuthenticated: true,
        isLoading: false,
        setUser: jest.fn(),
        setToken: jest.fn(),
        setCollege: jest.fn(),
        logout: jest.fn(),
        setLoading: jest.fn()
      })

      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      )

      // Should show limited navigation for general users (without Home)
      expect(screen.getAllByText('Critical Thinking').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
      
      // Should see disabled college-specific features (visible but disabled)
      expect(screen.getAllByText('College Discussion').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Academic Resources').length).toBeGreaterThan(0)
      expect(screen.queryAllByText('Moderator').length).toBe(0)
      expect(screen.queryAllByText('Admin').length).toBe(0)
      
      // Verify Home section is not present
      expect(screen.queryAllByText('Home').length).toBe(0)
    })
  })
})

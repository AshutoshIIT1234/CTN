import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as fc from 'fast-check';

import { AdminService } from './admin.service';
import { User, UserRole } from '../../entities/user.entity';
import { College } from '../../entities/college.entity';
import { Moderator } from '../../entities/moderator.entity';
import { Resource, ResourceType } from '../../entities/resource.entity';
import { ResourceAccess } from '../../entities/resource-access.entity';
import { PaymentSession } from '../../entities/payment-session.entity';
import { PostService } from '../post/post.service';
import { ResourceService } from '../resource/resource.service';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: Repository<User>;
  let collegeRepository: Repository<College>;
  let moderatorRepository: Repository<Moderator>;
  let resourceRepository: Repository<Resource>;
  let resourceAccessRepository: Repository<ResourceAccess>;
  let paymentSessionRepository: Repository<PaymentSession>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(College),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Moderator),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Resource),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ResourceAccess),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PaymentSession),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: PostService,
          useValue: {
            adminGetAllPosts: jest.fn(),
            adminDeletePost: jest.fn(),
            adminFlagPost: jest.fn(),
            adminHidePost: jest.fn(),
          },
        },
        {
          provide: ResourceService,
          useValue: {
            adminGetAllResources: jest.fn(),
            adminDeleteResource: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    collegeRepository = module.get<Repository<College>>(getRepositoryToken(College));
    moderatorRepository = module.get<Repository<Moderator>>(getRepositoryToken(Moderator));
    resourceRepository = module.get<Repository<Resource>>(getRepositoryToken(Resource));
    resourceAccessRepository = module.get<Repository<ResourceAccess>>(getRepositoryToken(ResourceAccess));
    paymentSessionRepository = module.get<Repository<PaymentSession>>(getRepositoryToken(PaymentSession));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Feature: critical-thinking-network, Property 39: College creation workflow
  describe('Property 39: College creation workflow', () => {
    it('should allow admins to create colleges with valid domain verification', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            emailDomain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            logoUrl: fc.option(fc.webUrl(), { nil: undefined }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock no existing college with same domain
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(null);

            // Mock college creation
            const mockCollege = {
              id: 'college-id',
              name: testData.collegeName,
              emailDomain: testData.emailDomain,
              logoUrl: testData.logoUrl || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            jest.spyOn(collegeRepository, 'create').mockReturnValue(mockCollege as any);
            jest.spyOn(collegeRepository, 'save').mockResolvedValue(mockCollege as any);

            // Admin should be able to create college
            const result = await service.createCollege(testData.adminId, {
              name: testData.collegeName,
              emailDomain: testData.emailDomain,
              logoUrl: testData.logoUrl,
            });

            expect(result).toBeDefined();
            expect(result.name).toBe(testData.collegeName);
            expect(result.emailDomain).toBe(testData.emailDomain);
            expect(result.logoUrl).toBe(testData.logoUrl || '');

            // Verify college was created with correct data
            expect(collegeRepository.create).toHaveBeenCalledWith({
              name: testData.collegeName,
              emailDomain: testData.emailDomain,
              logoUrl: testData.logoUrl || '',
            });

            // Verify domain uniqueness check was performed
            expect(collegeRepository.findOne).toHaveBeenCalledWith({
              where: { emailDomain: testData.emailDomain }
            });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should reject college creation with duplicate email domains', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            emailDomain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            existingCollegeName: fc.string({ minLength: 3, maxLength: 100 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock existing college with same domain
            const existingCollege = {
              id: 'existing-college-id',
              name: testData.existingCollegeName,
              emailDomain: testData.emailDomain,
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(existingCollege as any);

            // Should reject college creation with duplicate domain
            await expect(
              service.createCollege(testData.adminId, {
                name: testData.collegeName,
                emailDomain: testData.emailDomain,
              }),
            ).rejects.toThrow('Email domain already registered to another college');

            // Verify domain uniqueness check was performed
            expect(collegeRepository.findOne).toHaveBeenCalledWith({
              where: { emailDomain: testData.emailDomain }
            });

            // Verify college creation was not attempted
            expect(collegeRepository.create).not.toHaveBeenCalled();
            expect(collegeRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should reject college creation with invalid email domain formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            invalidEmailDomain: fc.oneof(
              fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
              fc.constant('invalid-domain'),
              fc.constant('domain.'),
              fc.constant('.domain'),
              fc.constant('domain..com'),
              fc.constant('domain with spaces.com'),
            ),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock no existing college (domain check passes)
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(null);

            // Should reject college creation with invalid domain format
            await expect(
              service.createCollege(testData.adminId, {
                name: testData.collegeName,
                emailDomain: testData.invalidEmailDomain,
              }),
            ).rejects.toThrow('Invalid email domain format');

            // Verify college creation was not attempted
            expect(collegeRepository.create).not.toHaveBeenCalled();
            expect(collegeRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should allow admins to delete colleges without users or resources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            emailDomain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: testData.emailDomain,
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock no users or resources in college
            jest.spyOn(userRepository, 'count').mockResolvedValue(0);
            jest.spyOn(resourceRepository, 'count').mockResolvedValue(0);

            // Mock college removal
            jest.spyOn(collegeRepository, 'remove').mockResolvedValue(mockCollege as any);

            // Admin should be able to delete empty college
            await service.deleteCollege(testData.adminId, testData.collegeId);

            // Verify college was removed
            expect(collegeRepository.remove).toHaveBeenCalledWith(mockCollege);

            // Verify checks were performed
            expect(userRepository.count).toHaveBeenCalledWith({ where: { collegeId: testData.collegeId } });
            expect(resourceRepository.count).toHaveBeenCalledWith({ where: { collegeId: testData.collegeId } });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent deletion of colleges with existing users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            userCount: fc.integer({ min: 1, max: 100 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: 'test.edu',
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock college has users
            jest.spyOn(userRepository, 'count').mockResolvedValue(testData.userCount);

            // Should prevent deletion of college with users
            await expect(
              service.deleteCollege(testData.adminId, testData.collegeId),
            ).rejects.toThrow('Cannot delete college with existing users');

            // Verify college removal was not attempted
            expect(collegeRepository.remove).not.toHaveBeenCalled();

            // Verify user count check was performed
            expect(userRepository.count).toHaveBeenCalledWith({ where: { collegeId: testData.collegeId } });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent deletion of colleges with existing resources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            resourceCount: fc.integer({ min: 1, max: 100 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: 'test.edu',
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock college has no users but has resources
            jest.spyOn(userRepository, 'count').mockResolvedValue(0);
            jest.spyOn(resourceRepository, 'count').mockResolvedValue(testData.resourceCount);

            // Should prevent deletion of college with resources
            await expect(
              service.deleteCollege(testData.adminId, testData.collegeId),
            ).rejects.toThrow('Cannot delete college with existing resources');

            // Verify college removal was not attempted
            expect(collegeRepository.remove).not.toHaveBeenCalled();

            // Verify resource count check was performed
            expect(resourceRepository.count).toHaveBeenCalledWith({ where: { collegeId: testData.collegeId } });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should deny non-admin users from college management functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            role: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            emailDomain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
          }),
          async (testData) => {
            // Mock non-admin user
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              displayName: testData.username,
              role: testData.role,
              college: testData.role === UserRole.COLLEGE_USER || testData.role === UserRole.MODERATOR 
                ? { id: 'user-college-id', name: 'User College' } 
                : null,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

            // All college management functions should deny access to non-admins
            await expect(
              service.createCollege(testData.userId, {
                name: testData.collegeName,
                emailDomain: testData.emailDomain,
              }),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.updateCollege(testData.userId, testData.collegeId, {
                name: testData.collegeName,
              }),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.deleteCollege(testData.userId, testData.collegeId),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.getAllCollegesWithStats(testData.userId),
            ).rejects.toThrow('Admin access required');
          },
        ),
        { numRuns: 2 },
      );
    });
  });

  // Feature: critical-thinking-network, Property 40: Admin dashboard functionality
  describe('Property 40: Admin dashboard functionality', () => {
    it('should provide comprehensive platform statistics for admins', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            totalUsers: fc.integer({ min: 0, max: 10000 }),
            totalColleges: fc.integer({ min: 0, max: 100 }),
            totalResources: fc.integer({ min: 0, max: 5000 }),
            totalPayments: fc.integer({ min: 0, max: 1000 }),
            guestUsers: fc.integer({ min: 0, max: 1000 }),
            generalUsers: fc.integer({ min: 0, max: 3000 }),
            collegeUsers: fc.integer({ min: 0, max: 5000 }),
            moderators: fc.integer({ min: 0, max: 50 }),
            admins: fc.integer({ min: 1, max: 10 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock repository counts and getUserCountsByRole
            jest.spyOn(userRepository, 'count')
              .mockResolvedValueOnce(testData.totalUsers); // Total users

            jest.spyOn(collegeRepository, 'count').mockResolvedValue(testData.totalColleges);
            jest.spyOn(moderatorRepository, 'count').mockResolvedValue(testData.moderators);
            jest.spyOn(resourceRepository, 'count').mockResolvedValue(testData.totalResources);
            jest.spyOn(paymentSessionRepository, 'count').mockResolvedValue(testData.totalPayments);

            // Mock getUserCountsByRole query builder
            const mockQueryBuilder = {
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([
                { role: UserRole.GUEST, count: testData.guestUsers.toString() },
                { role: UserRole.GENERAL_USER, count: testData.generalUsers.toString() },
                { role: UserRole.COLLEGE_USER, count: testData.collegeUsers.toString() },
                { role: UserRole.MODERATOR, count: testData.moderators.toString() },
                { role: UserRole.ADMIN, count: testData.admins.toString() },
              ]),
            };
            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

            // Admin should be able to get platform statistics
            const result = await service.getPlatformStats(testData.adminId);

            expect(result).toBeDefined();
            expect(result.totalUsers).toBe(testData.totalUsers);
            expect(result.totalColleges).toBe(testData.totalColleges);
            expect(result.totalModerators).toBe(testData.moderators);
            expect(result.totalResources).toBe(testData.totalResources);
            expect(result.totalPayments).toBe(testData.totalPayments);

            // Verify user role breakdown
            expect(result.usersByRole).toBeDefined();
            expect(result.usersByRole[UserRole.GUEST]).toBe(testData.guestUsers);
            expect(result.usersByRole[UserRole.GENERAL_USER]).toBe(testData.generalUsers);
            expect(result.usersByRole[UserRole.COLLEGE_USER]).toBe(testData.collegeUsers);
            expect(result.usersByRole[UserRole.MODERATOR]).toBe(testData.moderators);
            expect(result.usersByRole[UserRole.ADMIN]).toBe(testData.admins);
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should allow admins to manage user roles with proper validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            targetUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            currentRole: fc.constantFrom(...Object.values(UserRole)),
            newRole: fc.constantFrom(...Object.values(UserRole)),
            collegeId: fc.option(fc.uuid(), { nil: undefined }),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            // Mock target user
            const mockTargetUser = {
              id: testData.targetUserId,
              username: testData.targetUsername,
              displayName: testData.targetUsername,
              role: testData.currentRole,
              collegeId: testData.collegeId,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup

            // Mock college if needed for college users
            if (testData.newRole === UserRole.COLLEGE_USER || testData.newRole === UserRole.MODERATOR) {
              // Mock that user already has a college (required for these roles)
              mockTargetUser.collegeId = testData.collegeId || 'default-college-id';
            }

            // Skip test if trying to assign college/moderator role without college
            if ((testData.newRole === UserRole.COLLEGE_USER || testData.newRole === UserRole.MODERATOR) && !mockTargetUser.collegeId) {
              // This should throw an error, so we test that
              await expect(service.assignUserRole(testData.adminId, testData.targetUserId, testData.newRole))
                .rejects.toThrow();
              return;
            }

            // Mock user save
            const updatedUser = {
              ...mockTargetUser,
              role: testData.newRole,
            };
            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

            // Admin should be able to assign role
            const result = await service.assignUserRole(testData.adminId, testData.targetUserId, testData.newRole);

            expect(result).toBeDefined();
            expect(result.role).toBe(testData.newRole);

            // Verify user was updated
            expect(userRepository.save).toHaveBeenCalledWith(
              expect.objectContaining({
                role: testData.newRole,
              })
            );
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should provide comprehensive user management with filtering and pagination', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            page: fc.integer({ min: 1, max: 10 }),
            limit: fc.integer({ min: 5, max: 100 }),
            searchTerm: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
            roleFilter: fc.option(fc.constantFrom(...Object.values(UserRole)), { nil: undefined }),
            collegeFilter: fc.option(fc.uuid(), { nil: undefined }),
            totalUsers: fc.integer({ min: 0, max: 1000 }),
            userCount: fc.integer({ min: 0, max: 50 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Generate mock users
            const mockUsers = Array.from({ length: Math.min(testData.userCount, testData.limit) }, (_, index) => ({
              id: `user-${index}`,
              username: `user${index}`,
              displayName: `User ${index}`,
              email: `user${index}@test.com`,
              role: testData.roleFilter || UserRole.GENERAL_USER,
              collegeId: testData.collegeFilter || null,
              college: testData.collegeFilter ? {
                id: testData.collegeFilter,
                name: `College ${index}`,
              } : null,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            }));

            // Mock query builder for getAllUsers
            const mockQueryBuilder = {
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(testData.totalUsers),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(mockUsers),
            };
            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

            // Admin should be able to get users with filtering
            const result = await service.getAllUsers(testData.adminId, {
              page: testData.page,
              limit: testData.limit,
              search: testData.searchTerm,
              role: testData.roleFilter,
              collegeId: testData.collegeFilter,
            });

            expect(result).toBeDefined();
            expect(result.users).toBeDefined();
            expect(Array.isArray(result.users)).toBe(true);
            expect(result.users.length).toBe(Math.min(testData.userCount, testData.limit));
            expect(result.total).toBe(testData.totalUsers);
            expect(result.page).toBe(testData.page);
            expect(result.limit).toBe(testData.limit);

            // Verify query builder was used correctly
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.college', 'college');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.profile', 'profile');

            // Verify filtering was applied if provided
            if (testData.searchTerm) {
              expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(user.username ILIKE :search OR user.email ILIKE :search OR user.displayName ILIKE :search)',
                { search: `%${testData.searchTerm}%` }
              );
            }
            if (testData.roleFilter) {
              expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: testData.roleFilter });
            }
            if (testData.collegeFilter) {
              expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.collegeId = :collegeId', { collegeId: testData.collegeFilter });
            }

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith((testData.page - 1) * testData.limit);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(testData.limit);
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should provide payment records with comprehensive details for admins', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            page: fc.integer({ min: 1, max: 10 }),
            limit: fc.integer({ min: 5, max: 100 }),
            totalPayments: fc.integer({ min: 0, max: 1000 }),
            paymentCount: fc.integer({ min: 0, max: 50 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Generate mock payment records with proper structure
            const mockPayments = Array.from({ length: Math.min(testData.paymentCount, testData.limit) }, (_, index) => ({
              id: `payment-${index}`,
              sessionId: `session-${index}`,
              userId: `user-${index}`,
              resourceId: `resource-${index}`,
              amount: 10.00 + index,
              currency: 'USD',
              status: index % 3 === 0 ? 'completed' : index % 3 === 1 ? 'pending' : 'failed',
              createdAt: new Date(),
              completedAt: index % 3 === 0 ? new Date() : undefined,
              user: {
                id: `user-${index}`,
                username: `user${index}`,
                email: `user${index}@test.com`,
              },
              resource: {
                id: `resource-${index}`,
                fileName: `resource${index}.pdf`,
                college: {
                  name: `College ${index}`,
                },
              },
            }));

            // Mock payment session find
            jest.spyOn(paymentSessionRepository, 'find').mockResolvedValue(mockPayments as any);

            // Admin should be able to get payment records
            const result = await service.getAllPaymentRecords(testData.adminId);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(Math.min(testData.paymentCount, testData.limit));

            // Verify payment records have required fields
            result.forEach((payment, index) => {
              expect(payment.id).toBe(`payment-${index}`);
              expect(payment.amount).toBe(10.00 + index);
              expect(['completed', 'pending', 'failed']).toContain(payment.status);
              expect(payment.user).toBeDefined();
              expect(payment.user.username).toBe(`user${index}`);
              expect(payment.resource).toBeDefined();
              expect(payment.resource.college).toBeDefined();
            });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should enforce admin-only access to all dashboard functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            role: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR),
          }),
          async (testData) => {
            // Mock non-admin user
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              displayName: testData.username,
              role: testData.role,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

            // Non-admin users should be denied access to admin functions
            await expect(service.getPlatformStats(testData.userId))
              .rejects.toThrow('Admin access required');

            await expect(service.getAllUsers(testData.userId, { page: 1, limit: 10 }))
              .rejects.toThrow('Admin access required');

            await expect(service.getAllPaymentRecords(testData.userId))
              .rejects.toThrow('Admin access required');

            await expect(service.assignUserRole(testData.userId, 'target-user-id', UserRole.GENERAL_USER))
              .rejects.toThrow('Admin access required');

            await expect(service.createCollege(testData.userId, {
              name: 'Test College',
              emailDomain: 'test.edu',
            })).rejects.toThrow('Admin access required');

            await expect(service.deleteCollege(testData.userId, 'college-id'))
              .rejects.toThrow('Admin access required');
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should maintain data consistency during role assignments', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            targetUserId: fc.uuid(),
            currentRole: fc.constantFrom(...Object.values(UserRole)),
            newRole: fc.constantFrom(...Object.values(UserRole)),
            collegeId: fc.uuid(),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock admin user
            const mockAdmin = {
              id: testData.adminId,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any);

            // Mock target user with college if needed
            const mockTargetUser = {
              id: testData.targetUserId,
              role: testData.currentRole,
              collegeId: testData.currentRole === UserRole.COLLEGE_USER || testData.currentRole === UserRole.MODERATOR ? testData.collegeId : null,
            };

            // If assigning college/moderator role, ensure user has college
            if (testData.newRole === UserRole.COLLEGE_USER || testData.newRole === UserRole.MODERATOR) {
              mockTargetUser.collegeId = testData.collegeId;
            }

            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any);

            // Skip test if trying to assign college/moderator role without college
            if ((testData.newRole === UserRole.COLLEGE_USER || testData.newRole === UserRole.MODERATOR) && !mockTargetUser.collegeId) {
              // This should throw an error, so we test that
              await expect(service.assignUserRole(testData.adminId, testData.targetUserId, testData.newRole))
                .rejects.toThrow();
              return;
            }

            // Mock user save
            const updatedUser = {
              ...mockTargetUser,
              role: testData.newRole,
            };
            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

            // Perform role assignment
            const result = await service.assignUserRole(testData.adminId, testData.targetUserId, testData.newRole);

            // Verify consistency
            expect(result.role).toBe(testData.newRole);
          },
        ),
        { numRuns: 2 },
      );
    });
  });

  // Feature: critical-thinking-network, Property 40: Domain approval workflow
  describe('Property 40: Domain approval workflow', () => {
    it('should allow admins to approve valid college email domains', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: '',
              logoUrl: '',
              createdAt: new Date(),
            };
            jest.spyOn(collegeRepository, 'findOne')
              .mockResolvedValueOnce(null) // No existing domain conflict
              .mockResolvedValueOnce(mockCollege as any); // College lookup

            // Mock college save
            const updatedCollege = {
              ...mockCollege,
              emailDomain: testData.domain,
            };
            jest.spyOn(collegeRepository, 'save').mockResolvedValue(updatedCollege as any);

            // Admin should be able to approve domain
            const result = await service.approveDomain(testData.adminId, {
              domain: testData.domain,
              collegeId: testData.collegeId,
            });

            expect(result).toBeDefined();
            expect(result.emailDomain).toBe(testData.domain);

            // Verify domain conflict check was performed
            expect(collegeRepository.findOne).toHaveBeenCalledWith({
              where: { emailDomain: testData.domain }
            });

            // Verify college was updated
            expect(collegeRepository.save).toHaveBeenCalledWith(
              expect.objectContaining({
                emailDomain: testData.domain,
              })
            );
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should reject domain approval with invalid domain formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            invalidDomain: fc.oneof(
              fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
              fc.constant('invalid-domain'),
              fc.constant('domain.'),
              fc.constant('.domain'),
              fc.constant('domain..com'),
              fc.constant('domain with spaces.com'),
            ),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Should reject domain approval with invalid format
            await expect(
              service.approveDomain(testData.adminId, {
                domain: testData.invalidDomain,
                collegeId: testData.collegeId,
              }),
            ).rejects.toThrow('Invalid email domain format');

            // Verify no college operations were attempted
            expect(collegeRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent domain approval conflicts between colleges', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            existingCollegeId: fc.uuid(),
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            existingCollegeName: fc.string({ minLength: 3, maxLength: 100 }),
          }).filter(data => data.collegeId !== data.existingCollegeId), // Ensure different colleges
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock existing college with same domain
            const existingCollege = {
              id: testData.existingCollegeId,
              name: testData.existingCollegeName,
              emailDomain: testData.domain,
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(existingCollege as any);

            // Should reject domain approval due to conflict
            await expect(
              service.approveDomain(testData.adminId, {
                domain: testData.domain,
                collegeId: testData.collegeId,
              }),
            ).rejects.toThrow('Domain already approved for another college');

            // Verify domain conflict check was performed
            expect(collegeRepository.findOne).toHaveBeenCalledWith({
              where: { emailDomain: testData.domain }
            });

            // Verify no college save was attempted
            expect(collegeRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should allow admins to revoke domain approval for colleges without users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college with approved domain
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: testData.domain,
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock no users in college
            jest.spyOn(userRepository, 'count').mockResolvedValue(0);

            // Mock college save
            const updatedCollege = {
              ...mockCollege,
              emailDomain: '',
            };
            jest.spyOn(collegeRepository, 'save').mockResolvedValue(updatedCollege as any);

            // Admin should be able to revoke domain approval
            const result = await service.revokeDomainApproval(testData.adminId, testData.collegeId);

            expect(result).toBeDefined();
            expect(result.emailDomain).toBe('');

            // Verify user count check was performed
            expect(userRepository.count).toHaveBeenCalledWith({
              where: { collegeId: testData.collegeId }
            });

            // Verify college was updated
            expect(collegeRepository.save).toHaveBeenCalledWith(
              expect.objectContaining({
                emailDomain: '',
              })
            );
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent domain approval revocation for colleges with existing users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            userCount: fc.integer({ min: 1, max: 100 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock college with approved domain
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: testData.domain,
              logoUrl: '',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock college has users
            jest.spyOn(userRepository, 'count').mockResolvedValue(testData.userCount);

            // Should prevent domain approval revocation
            await expect(
              service.revokeDomainApproval(testData.adminId, testData.collegeId),
            ).rejects.toThrow('Cannot revoke domain approval for college with existing users');

            // Verify user count check was performed
            expect(userRepository.count).toHaveBeenCalledWith({
              where: { collegeId: testData.collegeId }
            });

            // Verify college save was not attempted
            expect(collegeRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should provide comprehensive approved domains list for admins', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeCount: fc.integer({ min: 0, max: 10 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Generate mock colleges with approved domains
            const mockColleges = Array.from({ length: testData.collegeCount }, (_, index) => ({
              id: `college-${index}`,
              name: `College ${index}`,
              emailDomain: `college${index}.edu`,
              logoUrl: '',
              createdAt: new Date(),
            }));

            jest.spyOn(collegeRepository, 'find').mockResolvedValue(mockColleges as any);

            // Mock user counts for each college
            mockColleges.forEach((_, index) => {
              jest.spyOn(userRepository, 'count').mockResolvedValueOnce(index * 10);
            });

            // Admin should be able to get approved domains
            const result = await service.getApprovedDomains(testData.adminId);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(testData.collegeCount);

            // Verify each domain entry has required fields
            result.forEach((domain, index) => {
              expect(domain.domain).toBe(`college${index}.edu`);
              expect(domain.college.id).toBe(`college-${index}`);
              expect(domain.college.name).toBe(`College ${index}`);
              expect(domain.approvedAt).toBeDefined();
              expect(domain.userCount).toBe(index * 10);
            });

            // Verify colleges were queried correctly
            expect(collegeRepository.find).toHaveBeenCalledWith({
              where: { emailDomain: expect.anything() },
              order: { emailDomain: 'ASC' }
            });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should correctly verify domain approval status for registration', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            isApproved: fc.boolean(),
          }),
          async (testData) => {
            if (testData.isApproved) {
              // Mock approved domain
              const mockCollege = {
                id: testData.collegeId,
                name: testData.collegeName,
                emailDomain: testData.domain,
                logoUrl: '',
              };
              jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);
            } else {
              // Mock no approved domain
              jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(null);
            }

            // Check domain approval status
            const result = await service.isDomainApproved(testData.domain);

            expect(result).toBeDefined();
            expect(result.approved).toBe(testData.isApproved);

            if (testData.isApproved) {
              expect(result.college).toBeDefined();
              expect(result.college!.id).toBe(testData.collegeId);
              expect(result.college!.name).toBe(testData.collegeName);
            } else {
              expect(result.college).toBeUndefined();
            }

            // Verify domain lookup was performed
            expect(collegeRepository.findOne).toHaveBeenCalledWith({
              where: { emailDomain: testData.domain }
            });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should deny non-admin users from domain approval functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            role: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR),
            domain: fc.string({ minLength: 5, maxLength: 50 }).filter(s => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(s)),
            collegeId: fc.uuid(),
          }),
          async (testData) => {
            // Mock non-admin user
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              displayName: testData.username,
              role: testData.role,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

            // All domain approval functions should deny access to non-admins
            await expect(
              service.approveDomain(testData.userId, {
                domain: testData.domain,
                collegeId: testData.collegeId,
              }),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.revokeDomainApproval(testData.userId, testData.collegeId),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.getApprovedDomains(testData.userId),
            ).rejects.toThrow('Admin access required');

            // Note: isDomainApproved is public and doesn't require admin access
          },
        ),
        { numRuns: 2 },
      );
    });
  });

  // Feature: critical-thinking-network, Property 41: Moderator role management
  describe('Property 41: Moderator role management', () => {
    it('should allow admins to assign moderator role to users with college association', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            targetUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            currentRole: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            // Mock target user
            const mockTargetUser = {
              id: testData.targetUserId,
              username: testData.targetUsername,
              displayName: testData.targetUsername,
              role: testData.currentRole,
              collegeId: null,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: 'test.edu',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock no existing moderator record
            jest.spyOn(moderatorRepository, 'findOne').mockResolvedValue(null);

            // Mock user save
            const updatedUser = {
              ...mockTargetUser,
              role: UserRole.MODERATOR,
              collegeId: testData.collegeId,
            };
            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

            // Mock moderator creation
            const mockModerator = {
              id: 'moderator-id',
              userId: testData.targetUserId,
              collegeId: testData.collegeId,
              assignedBy: testData.adminId,
              assignedAt: new Date(),
            };
            jest.spyOn(moderatorRepository, 'create').mockReturnValue(mockModerator as any);
            jest.spyOn(moderatorRepository, 'save').mockResolvedValue(mockModerator as any);

            // Admin should be able to assign moderator role
            const result = await service.assignModeratorRole(
              testData.adminId,
              testData.targetUserId,
              testData.collegeId
            );

            expect(result).toBeDefined();
            expect(result.user.role).toBe(UserRole.MODERATOR);
            expect(result.user.collegeId).toBe(testData.collegeId);
            expect(result.moderator).toBeDefined();
            expect(result.moderator.userId).toBe(testData.targetUserId);
            expect(result.moderator.collegeId).toBe(testData.collegeId);

            // Verify moderator record was created
            expect(moderatorRepository.create).toHaveBeenCalledWith({
              userId: testData.targetUserId,
              collegeId: testData.collegeId,
              assignedBy: testData.adminId,
            });

            // Verify user was updated
            expect(userRepository.save).toHaveBeenCalledWith(
              expect.objectContaining({
                role: UserRole.MODERATOR,
                collegeId: testData.collegeId,
              })
            );
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent duplicate moderator role assignments', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            targetUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            // Mock target user (already a moderator)
            const mockTargetUser = {
              id: testData.targetUserId,
              username: testData.targetUsername,
              displayName: testData.targetUsername,
              role: UserRole.MODERATOR,
              collegeId: testData.collegeId,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup

            // Mock college exists
            const mockCollege = {
              id: testData.collegeId,
              name: testData.collegeName,
              emailDomain: 'test.edu',
            };
            jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);

            // Mock existing moderator record
            const existingModerator = {
              id: 'existing-moderator-id',
              userId: testData.targetUserId,
              collegeId: testData.collegeId,
            };
            jest.spyOn(moderatorRepository, 'findOne').mockResolvedValue(existingModerator as any);

            // Should prevent duplicate moderator assignment
            await expect(
              service.assignModeratorRole(
                testData.adminId,
                testData.targetUserId,
                testData.collegeId
              ),
            ).rejects.toThrow('User is already a moderator');

            // Verify no user or moderator updates were attempted
            expect(userRepository.save).not.toHaveBeenCalled();
            expect(moderatorRepository.create).not.toHaveBeenCalled();
            expect(moderatorRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should allow admins to revoke moderator role and update user appropriately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            targetUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            hasCollege: fc.boolean(),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            // Mock target user (currently a moderator)
            const mockTargetUser = {
              id: testData.targetUserId,
              username: testData.targetUsername,
              displayName: testData.targetUsername,
              role: UserRole.MODERATOR,
              collegeId: testData.hasCollege ? testData.collegeId : null,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup

            // Mock existing moderator record
            const existingModerator = {
              id: 'moderator-id',
              userId: testData.targetUserId,
              collegeId: testData.collegeId,
            };
            jest.spyOn(moderatorRepository, 'findOne').mockResolvedValue(existingModerator as any);

            // Mock moderator removal
            jest.spyOn(moderatorRepository, 'remove').mockResolvedValue(existingModerator as any);

            // Mock user save
            const expectedRole = testData.hasCollege ? UserRole.COLLEGE_USER : UserRole.GENERAL_USER;
            const updatedUser = {
              ...mockTargetUser,
              role: expectedRole,
            };
            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

            // Admin should be able to revoke moderator role
            const result = await service.revokeModeratorRole(testData.adminId, testData.targetUserId);

            expect(result).toBeDefined();
            expect(result.role).toBe(expectedRole);

            // Verify moderator record was removed
            expect(moderatorRepository.remove).toHaveBeenCalledWith(existingModerator);

            // Verify user role was updated appropriately
            expect(userRepository.save).toHaveBeenCalledWith(
              expect.objectContaining({
                role: expectedRole,
              })
            );
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent revoking moderator role from non-moderators', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            targetUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            currentRole: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.ADMIN),
          }).filter(data => data.adminId !== data.targetUserId), // Prevent self-assignment
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            // Mock target user (not a moderator)
            const mockTargetUser = {
              id: testData.targetUserId,
              username: testData.targetUsername,
              displayName: testData.targetUsername,
              role: testData.currentRole,
              collegeId: null,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup

            // Should prevent revoking moderator role from non-moderator
            await expect(
              service.revokeModeratorRole(testData.adminId, testData.targetUserId),
            ).rejects.toThrow('User is not currently a moderator');

            // Verify no moderator or user updates were attempted
            expect(moderatorRepository.remove).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should provide comprehensive moderator list for admins', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            moderatorCount: fc.integer({ min: 0, max: 10 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Generate mock moderators with users and colleges
            const mockModerators = Array.from({ length: testData.moderatorCount }, (_, index) => ({
              id: `moderator-${index}`,
              userId: `user-${index}`,
              collegeId: `college-${index}`,
              assignedBy: testData.adminId,
              assignedAt: new Date(),
              user: {
                id: `user-${index}`,
                username: `moderator${index}`,
                displayName: `Moderator ${index}`,
                email: `moderator${index}@test.edu`,
              },
              college: {
                id: `college-${index}`,
                name: `College ${index}`,
                emailDomain: `college${index}.edu`,
              },
            }));

            jest.spyOn(moderatorRepository, 'find').mockResolvedValue(mockModerators as any);

            // Admin should be able to get all moderators
            const result = await service.getAllModerators(testData.adminId);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(testData.moderatorCount);

            // Verify each moderator entry has required fields
            result.forEach((moderator, index) => {
              expect(moderator.id).toBe(`moderator-${index}`);
              expect(moderator.user.id).toBe(`user-${index}`);
              expect(moderator.user.username).toBe(`moderator${index}`);
              expect(moderator.college.id).toBe(`college-${index}`);
              expect(moderator.college.name).toBe(`College ${index}`);
              expect(moderator.assignedAt).toBeDefined();
            });

            // Verify moderators were queried correctly
            expect(moderatorRepository.find).toHaveBeenCalledWith({
              relations: ['user', 'college'],
              order: { assignedAt: 'DESC' }
            });
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent admins from assigning moderator role to non-existent users or colleges', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            targetUserId: fc.uuid(),
            collegeId: fc.uuid(),
            userExists: fc.boolean(),
            collegeExists: fc.boolean(),
          }).filter(data => data.adminId !== data.targetUserId && (!data.userExists || !data.collegeExists)), // Only test error cases
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup

            if (testData.userExists) {
              // Mock target user exists
              const mockTargetUser = {
                id: testData.targetUserId,
                username: 'testuser',
                displayName: 'Test User',
                role: UserRole.GENERAL_USER,
                collegeId: null,
              };
              jest.spyOn(userRepository, 'findOne')
                .mockResolvedValueOnce(mockTargetUser as any); // Target user lookup
            } else {
              // Mock target user doesn't exist
              jest.spyOn(userRepository, 'findOne')
                .mockResolvedValueOnce(null); // Target user lookup
            }

            if (testData.collegeExists && testData.userExists) {
              // Mock college exists
              const mockCollege = {
                id: testData.collegeId,
                name: 'Test College',
                emailDomain: 'test.edu',
              };
              jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);
            } else {
              // Mock college doesn't exist
              jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(null);
            }

            // Should reject moderator assignment for non-existent user or college
            if (!testData.userExists) {
              await expect(
                service.assignModeratorRole(testData.adminId, testData.targetUserId, testData.collegeId),
              ).rejects.toThrow('Target user not found');
            } else if (!testData.collegeExists) {
              await expect(
                service.assignModeratorRole(testData.adminId, testData.targetUserId, testData.collegeId),
              ).rejects.toThrow('College not found');
            }

            // Verify no moderator creation was attempted
            expect(moderatorRepository.create).not.toHaveBeenCalled();
            expect(moderatorRepository.save).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should deny non-admin users from moderator management functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            role: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR),
            targetUserId: fc.uuid(),
            collegeId: fc.uuid(),
          }),
          async (testData) => {
            // Mock non-admin user
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              displayName: testData.username,
              role: testData.role,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

            // All moderator management functions should deny access to non-admins
            await expect(
              service.assignModeratorRole(testData.userId, testData.targetUserId, testData.collegeId),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.revokeModeratorRole(testData.userId, testData.targetUserId),
            ).rejects.toThrow('Admin access required');

            await expect(
              service.getAllModerators(testData.userId),
            ).rejects.toThrow('Admin access required');
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should prevent self-assignment and self-revocation of moderator role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            collegeId: fc.uuid(),
            currentRole: fc.constantFrom(UserRole.ADMIN, UserRole.MODERATOR),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne')
              .mockResolvedValueOnce(mockAdmin as any); // Admin lookup for verifyAdminAccess

            // For self-assignment/revocation, we need to mock the college lookup too
            if (testData.currentRole === UserRole.ADMIN) {
              // Mock college exists for assignment case
              const mockCollege = {
                id: testData.collegeId,
                name: 'Test College',
                emailDomain: 'test.edu',
              };
              jest.spyOn(collegeRepository, 'findOne').mockResolvedValue(mockCollege as any);
            }

            // Should prevent self-assignment and self-revocation
            if (testData.currentRole === UserRole.ADMIN) {
              await expect(
                service.assignModeratorRole(testData.adminId, testData.adminId, testData.collegeId),
              ).rejects.toThrow('Cannot change your own role');
            } else {
              await expect(
                service.revokeModeratorRole(testData.adminId, testData.adminId),
              ).rejects.toThrow('Cannot change your own role');
            }

            // Verify no role changes were attempted
            expect(userRepository.save).not.toHaveBeenCalled();
            expect(moderatorRepository.create).not.toHaveBeenCalled();
            expect(moderatorRepository.remove).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 2 },
      );
    });
  });

  // Feature: critical-thinking-network, Property 42: Admin platform-wide moderation
  describe('Property 42: Admin platform-wide moderation', () => {
    it('should allow admins to view and moderate posts across all panels', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            postId: fc.uuid(),
            postTitle: fc.string({ minLength: 5, maxLength: 100 }),
            postContent: fc.string({ minLength: 10, maxLength: 500 }),
            panelType: fc.constantFrom('NATIONAL', 'COLLEGE'),
            collegeId: fc.option(fc.uuid(), { nil: undefined }),
            moderationAction: fc.constantFrom('delete', 'flag', 'hide'),
            flagReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock post service methods
            const mockPostsResult = {
              posts: [{
                id: testData.postId,
                title: testData.postTitle,
                content: testData.postContent,
                panelType: testData.panelType,
                collegeId: testData.collegeId,
                authorId: 'author-id',
                authorUsername: 'author',
                createdAt: new Date(),
                isDeleted: false,
                isHidden: false,
                isFlagged: false,
              }],
              total: 1,
              page: 1,
              limit: 20,
              hasMore: false,
            };

            jest.spyOn(service['postService'], 'adminGetAllPosts').mockResolvedValue(mockPostsResult as any);
            jest.spyOn(service['postService'], 'adminDeletePost').mockResolvedValue({ message: 'Post deleted successfully' } as any);
            jest.spyOn(service['postService'], 'adminFlagPost').mockResolvedValue({ message: 'Post flagged successfully', isFlagged: true } as any);
            jest.spyOn(service['postService'], 'adminHidePost').mockResolvedValue({ message: 'Post hidden successfully', isHidden: true } as any);

            // Admin should be able to get all posts for moderation
            const postsResult = await service.getAllPostsForModeration(testData.adminId, {
              panelType: testData.panelType as any,
              collegeId: testData.collegeId,
            });

            expect(postsResult).toBeDefined();
            expect(postsResult.posts).toBeDefined();
            expect(postsResult.posts.length).toBe(1);
            expect(postsResult.posts[0].id).toBe(testData.postId);

            // Admin should be able to perform moderation actions
            let moderationResult;
            switch (testData.moderationAction) {
              case 'delete':
                moderationResult = await service.deletePost(testData.adminId, testData.postId);
                expect(moderationResult.message).toBe('Post deleted successfully');
                break;
              case 'flag':
                moderationResult = await service.flagPost(testData.adminId, testData.postId, testData.flagReason);
                expect(moderationResult.message).toBe('Post flagged successfully');
                expect(moderationResult.isFlagged).toBe(true);
                break;
              case 'hide':
                moderationResult = await service.hidePost(testData.adminId, testData.postId);
                expect(moderationResult.message).toBe('Post hidden successfully');
                expect(moderationResult.isHidden).toBe(true);
                break;
            }

            expect(moderationResult).toBeDefined();

            // Verify post service methods were called correctly
            expect(service['postService'].adminGetAllPosts).toHaveBeenCalledWith(testData.adminId, {
              panelType: testData.panelType,
              collegeId: testData.collegeId,
            });

            switch (testData.moderationAction) {
              case 'delete':
                expect(service['postService'].adminDeletePost).toHaveBeenCalledWith(testData.adminId, testData.postId);
                break;
              case 'flag':
                expect(service['postService'].adminFlagPost).toHaveBeenCalledWith(testData.adminId, testData.postId, testData.flagReason);
                break;
              case 'hide':
                expect(service['postService'].adminHidePost).toHaveBeenCalledWith(testData.adminId, testData.postId);
                break;
            }
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should allow admins to view and moderate resources across all colleges', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            resourceId: fc.uuid(),
            fileName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.endsWith('.pdf') || s.endsWith('.docx') || s.endsWith('.pptx')),
            collegeId: fc.uuid(),
            collegeName: fc.string({ minLength: 3, maxLength: 100 }),
            resourceType: fc.constantFrom(ResourceType.TOPPER_NOTES, ResourceType.PYQS, ResourceType.CASE_DECKS, ResourceType.PRESENTATIONS, ResourceType.STRATEGIES),
            department: fc.string({ minLength: 3, maxLength: 50 }),
            batch: fc.string({ minLength: 4, maxLength: 10 }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock resource service methods
            const mockResourcesResult = {
              resources: [{
                id: testData.resourceId,
                fileName: testData.fileName,
                collegeId: testData.collegeId,
                resourceType: testData.resourceType,
                department: testData.department,
                batch: testData.batch,
                uploadDate: new Date(),
                college: {
                  id: testData.collegeId,
                  name: testData.collegeName,
                },
                uploader: {
                  id: 'uploader-id',
                  username: 'uploader',
                },
              }],
              total: 1,
              page: 1,
              limit: 20,
            };

            jest.spyOn(service['resourceService'], 'adminGetAllResources').mockResolvedValue(mockResourcesResult as any);
            jest.spyOn(service['resourceService'], 'adminDeleteResource').mockResolvedValue(undefined);

            // Admin should be able to get all resources for moderation
            const resourcesResult = await service.getAllResourcesForModeration(testData.adminId, {
              collegeId: testData.collegeId,
              resourceType: testData.resourceType,
              department: testData.department,
              batch: testData.batch,
            });

            expect(resourcesResult).toBeDefined();
            expect(resourcesResult.resources).toBeDefined();
            expect(resourcesResult.resources.length).toBe(1);
            expect(resourcesResult.resources[0].id).toBe(testData.resourceId);
            expect(resourcesResult.resources[0].fileName).toBe(testData.fileName);

            // Admin should be able to delete resources
            await service.deleteResource(testData.adminId, testData.resourceId);

            // Verify resource service methods were called correctly
            expect(service['resourceService'].adminGetAllResources).toHaveBeenCalledWith(testData.adminId, {
              collegeId: testData.collegeId,
              resourceType: testData.resourceType,
              department: testData.department,
              batch: testData.batch,
            });

            expect(service['resourceService'].adminDeleteResource).toHaveBeenCalledWith(testData.adminId, testData.resourceId);
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should deny non-admin users from platform-wide moderation functions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            role: fc.constantFrom(UserRole.GUEST, UserRole.GENERAL_USER, UserRole.COLLEGE_USER, UserRole.MODERATOR),
            postId: fc.uuid(),
            resourceId: fc.uuid(),
          }),
          async (testData) => {
            // Mock non-admin user
            const mockUser = {
              id: testData.userId,
              username: testData.username,
              displayName: testData.username,
              role: testData.role,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

            // All platform-wide moderation functions should deny access to non-admins
            await expect(service.getAllPostsForModeration(testData.userId, {}))
              .rejects.toThrow('Admin access required');

            await expect(service.deletePost(testData.userId, testData.postId))
              .rejects.toThrow('Admin access required');

            await expect(service.flagPost(testData.userId, testData.postId, 'test reason'))
              .rejects.toThrow('Admin access required');

            await expect(service.hidePost(testData.userId, testData.postId))
              .rejects.toThrow('Admin access required');

            await expect(service.getAllResourcesForModeration(testData.userId, {}))
              .rejects.toThrow('Admin access required');

            await expect(service.deleteResource(testData.userId, testData.resourceId))
              .rejects.toThrow('Admin access required');
          },
        ),
        { numRuns: 2 },
      );
    });

    it('should provide comprehensive filtering options for content moderation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.uuid(),
            adminUsername: fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
            page: fc.integer({ min: 1, max: 10 }),
            limit: fc.integer({ min: 5, max: 100 }),
            panelType: fc.option(fc.constantFrom('NATIONAL', 'COLLEGE'), { nil: undefined }),
            collegeId: fc.option(fc.uuid(), { nil: undefined }),
            includeDeleted: fc.boolean(),
            includeHidden: fc.boolean(),
            searchTerm: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
            resourceType: fc.option(fc.constantFrom(ResourceType.TOPPER_NOTES, ResourceType.PYQS, ResourceType.CASE_DECKS), { nil: undefined }),
            department: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
            batch: fc.option(fc.string({ minLength: 4, maxLength: 10 }), { nil: undefined }),
          }),
          async (testData) => {
            // Mock ADMIN user
            const mockAdmin = {
              id: testData.adminId,
              username: testData.adminUsername,
              displayName: testData.adminUsername,
              role: UserRole.ADMIN,
            };
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdmin as any);

            // Mock service responses
            const mockPostsResult = {
              posts: [],
              total: 0,
              page: testData.page,
              limit: testData.limit,
              hasMore: false,
            };

            const mockResourcesResult = {
              resources: [],
              total: 0,
              page: testData.page,
              limit: testData.limit,
            };

            jest.spyOn(service['postService'], 'adminGetAllPosts').mockResolvedValue(mockPostsResult as any);
            jest.spyOn(service['resourceService'], 'adminGetAllResources').mockResolvedValue(mockResourcesResult as any);

            // Test post moderation with filtering
            const postOptions = {
              page: testData.page,
              limit: testData.limit,
              panelType: testData.panelType as any,
              collegeId: testData.collegeId,
              includeDeleted: testData.includeDeleted,
              includeHidden: testData.includeHidden,
              search: testData.searchTerm,
            };

            const postsResult = await service.getAllPostsForModeration(testData.adminId, postOptions);

            expect(postsResult).toBeDefined();
            expect(postsResult.page).toBe(testData.page);
            expect(postsResult.limit).toBe(testData.limit);

            // Test resource moderation with filtering
            const resourceOptions = {
              page: testData.page,
              limit: testData.limit,
              collegeId: testData.collegeId,
              resourceType: testData.resourceType,
              department: testData.department,
              batch: testData.batch,
              search: testData.searchTerm,
            };

            const resourcesResult = await service.getAllResourcesForModeration(testData.adminId, resourceOptions);

            expect(resourcesResult).toBeDefined();
            expect(resourcesResult.page).toBe(testData.page);
            expect(resourcesResult.limit).toBe(testData.limit);

            // Verify service methods were called with correct parameters
            expect(service['postService'].adminGetAllPosts).toHaveBeenCalledWith(testData.adminId, postOptions);
            expect(service['resourceService'].adminGetAllResources).toHaveBeenCalledWith(testData.adminId, resourceOptions);
          },
        ),
        { numRuns: 2 },
      );
    });
  });
});

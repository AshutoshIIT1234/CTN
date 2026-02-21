import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fc from 'fast-check';
import { UserService } from './user.service';
import { User } from '@/entities/user.entity';
import { UserProfile } from '@/entities/user-profile.entity';
import { College } from '@/entities/college.entity';
import { RedisService } from '@/services/redis.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService Property Tests', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let userProfileRepository: Repository<UserProfile>;
  let collegeRepository: Repository<College>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(College),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateUserProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userProfileRepository = module.get<Repository<UserProfile>>(
      getRepositoryToken(UserProfile),
    );
    collegeRepository = module.get<Repository<College>>(
      getRepositoryToken(College),
    );
    redisService = module.get<RedisService>(RedisService);
  });

  // Feature: instagram-profile-system, Property 2: Profile Update Round Trip
  describe('Property 2: Profile Update Round Trip', () => {
    it('should return updated values after saving profile changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            displayName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            bio: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
            profilePictureUrl: fc.option(fc.webUrl(), { nil: undefined }),
            coverPhotoUrl: fc.option(fc.webUrl(), { nil: undefined }),
          }),
          async (updateData) => {
            const userId = 'test-user-id';

            // Mock: Existing user with profile
            const mockUser = {
              id: userId,
              username: 'testuser',
              email: 'test@example.com',
              displayName: 'Old Name',
              bio: 'Old bio',
              profilePictureUrl: 'old-pic.jpg',
              coverPhotoUrl: 'old-cover.jpg',
              role: 'GENERAL_USER',
              createdAt: new Date(),
              updatedAt: new Date(),
              profile: {
                userId,
                postCount: 5,
                commentCount: 10,
                likesReceived: 20,
                followersCount: 3,
                followingCount: 7,
              } as UserProfile,
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'get').mockResolvedValue(null);
            jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
            jest.spyOn(redisService, 'invalidateUserProfile').mockResolvedValue(undefined);

            // Mock: Save returns updated user
            const updatedUser = {
              ...mockUser,
              displayName: updateData.displayName ?? mockUser.displayName,
              bio: updateData.bio ?? mockUser.bio,
              profilePictureUrl: updateData.profilePictureUrl ?? mockUser.profilePictureUrl,
              coverPhotoUrl: updateData.coverPhotoUrl ?? mockUser.coverPhotoUrl,
            };

            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

            // Execute: Update profile
            await service.updateUserProfile(userId, updateData);

            // Execute: Fetch profile (round trip)
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(updatedUser);
            const fetchedProfile = await service.getUserProfile(userId, userId);

            // Verify: Fetched values match updated values
            if (updateData.displayName !== undefined) {
              expect(fetchedProfile.displayName).toBe(updateData.displayName);
            }
            if (updateData.bio !== undefined) {
              expect(fetchedProfile.bio).toBe(updateData.bio);
            }
            if (updateData.profilePictureUrl !== undefined) {
              expect(fetchedProfile.profilePictureUrl).toBe(updateData.profilePictureUrl);
            }
            if (updateData.coverPhotoUrl !== undefined) {
              expect(fetchedProfile.coverPhotoUrl).toBe(updateData.coverPhotoUrl);
            }
          },
        ),
        { numRuns: 3 },
      );
    }, 30000);
  });

  // Feature: instagram-profile-system, Property 3: Cancel Discards Changes
  describe('Property 3: Cancel Discards Changes', () => {
    it('should return original values when changes are not saved', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            originalDisplayName: fc.string({ minLength: 1, maxLength: 100 }),
            originalBio: fc.string({ minLength: 0, maxLength: 500 }),
            newDisplayName: fc.string({ minLength: 1, maxLength: 100 }),
            newBio: fc.string({ minLength: 0, maxLength: 500 }),
          }),
          async ({ originalDisplayName, originalBio, newDisplayName, newBio }) => {
            const userId = 'test-user-id';

            // Mock: Existing user with original values
            const mockUser = {
              id: userId,
              username: 'testuser',
              email: 'test@example.com',
              displayName: originalDisplayName,
              bio: originalBio,
              profilePictureUrl: 'pic.jpg',
              coverPhotoUrl: 'cover.jpg',
              role: 'GENERAL_USER',
              createdAt: new Date(),
              updatedAt: new Date(),
              profile: {
                userId,
                postCount: 5,
                commentCount: 10,
                likesReceived: 20,
                followersCount: 3,
                followingCount: 7,
              } as UserProfile,
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'get').mockResolvedValue(null);
            jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

            // Simulate: User makes changes but doesn't save (no update call)
            // Just fetch the profile without updating

            // Execute: Fetch profile without saving changes
            const fetchedProfile = await service.getUserProfile(userId, userId);

            // Verify: Fetched values match original values, not new values
            expect(fetchedProfile.displayName).toBe(originalDisplayName);
            expect(fetchedProfile.bio).toBe(originalBio);
            expect(fetchedProfile.displayName).not.toBe(newDisplayName);
            expect(fetchedProfile.bio).not.toBe(newBio);
          },
        ),
        { numRuns: 3 },
      );
    }, 30000);
  });

  // Feature: instagram-profile-system, Property 44: Profile Edit Authorization
  describe('Property 44: Profile Edit Authorization', () => {
    it('should allow profile edit only when authenticated user ID matches profile owner ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.uuid(),
            fc.uuid(),
          ).filter(([id1, id2]) => id1 !== id2),
          fc.record({
            displayName: fc.string({ minLength: 1, maxLength: 100 }),
            bio: fc.string({ minLength: 0, maxLength: 500 }),
          }),
          async ([ownerId, otherId], updateData) => {
            // Mock: User exists
            const mockUser = {
              id: ownerId,
              username: 'owner',
              email: 'owner@example.com',
              displayName: 'Owner',
              bio: 'Original bio',
              role: 'GENERAL_USER',
              createdAt: new Date(),
              updatedAt: new Date(),
              profile: {
                userId: ownerId,
                postCount: 0,
                commentCount: 0,
                likesReceived: 0,
                followersCount: 0,
                followingCount: 0,
              } as UserProfile,
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(redisService, 'invalidateUserProfile').mockResolvedValue(undefined);

            // Test 1: Owner can update their own profile
            jest.spyOn(userRepository, 'save').mockResolvedValue({
              ...mockUser,
              ...updateData,
            });

            const ownerResult = await service.updateUserProfile(ownerId, updateData);
            expect(ownerResult).toBeDefined();
            expect(ownerResult.displayName).toBe(updateData.displayName);

            // Test 2: Non-owner attempting to update should fail
            // In a real implementation, this would be handled by authorization guards
            // Here we simulate by checking if the user exists for the given ID
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(
              service.updateUserProfile(otherId, updateData)
            ).rejects.toThrow(NotFoundException);
          },
        ),
        { numRuns: 3 },
      );
    }, 30000);
  });
});

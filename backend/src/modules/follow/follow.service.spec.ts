import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fc from 'fast-check';
import { FollowService } from './follow.service';
import { Follower } from '../../entities/follower.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';

describe('FollowService Property Tests', () => {
  let service: FollowService;
  let followerRepository: Repository<Follower>;
  let userProfileRepository: Repository<UserProfile>;
  let userRepository: Repository<User>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: getRepositoryToken(Follower),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
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
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    followerRepository = module.get<Repository<Follower>>(
      getRepositoryToken(Follower),
    );
    userProfileRepository = module.get<Repository<UserProfile>>(
      getRepositoryToken(UserProfile),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Feature: instagram-profile-system, Property 4: Follow Action Creates Relationship
  describe('Property 4: Follow Action Creates Relationship', () => {
    it('should create a follow relationship for any two distinct users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          fc.string({ minLength: 3, maxLength: 30 }),
          fc.string({ minLength: 3, maxLength: 30 }),
          async ([followerId, followingId], followerName, followingName) => {
            // Mock: Users exist
            const mockFollower = {
              id: followerId,
              username: followerName,
              displayName: followerName,
            } as User;

            const mockFollowing = {
              id: followingId,
              username: followingName,
              displayName: followingName,
            } as User;

            jest
              .spyOn(userRepository, 'findOne')
              .mockImplementation(async ({ where }: any) => {
                if (where.id === followerId) return mockFollower;
                if (where.id === followingId) return mockFollowing;
                return null;
              });

            // Mock: Not already following
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(null);

            // Mock: Create follow relationship
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
              createdAt: new Date(),
            } as Follower;

            jest.spyOn(followerRepository, 'create').mockReturnValue(mockFollow);
            jest.spyOn(followerRepository, 'save').mockResolvedValue(mockFollow);

            // Mock: User profiles
            const mockFollowerProfile = {
              userId: followerId,
              followingCount: 0,
              followersCount: 0,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            const mockFollowingProfile = {
              userId: followingId,
              followingCount: 0,
              followersCount: 0,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            jest
              .spyOn(userProfileRepository, 'findOne')
              .mockImplementation(async ({ where }: any) => {
                if (where.userId === followerId) return mockFollowerProfile;
                if (where.userId === followingId) return mockFollowingProfile;
                return null;
              });

            jest.spyOn(userProfileRepository, 'save').mockResolvedValue({} as any);

            // Execute: Follow user
            await service.followUser(followerId, followingId);

            // Verify: Follow relationship was created
            expect(followerRepository.create).toHaveBeenCalledWith({
              followerId,
              followingId,
            });
            expect(followerRepository.save).toHaveBeenCalledWith(mockFollow);

            // Verify: Can query the follow status
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(mockFollow);
            const status = await service.getFollowStatus(followerId, followingId);
            expect(status).toBe(true);
          },
        ),
        { numRuns: 5 },
      );
    });
  });

  // Feature: instagram-profile-system, Property 5: Unfollow Action Removes Relationship
  describe('Property 5: Unfollow Action Removes Relationship', () => {
    it('should remove follow relationship for any existing follow', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          async ([followerId, followingId]) => {
            // Mock: Existing follow relationship
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
              createdAt: new Date(),
            } as Follower;

            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(mockFollow);
            jest.spyOn(followerRepository, 'remove').mockResolvedValue(mockFollow);

            // Mock: User profiles
            const mockFollowerProfile = {
              userId: followerId,
              followingCount: 1,
              followersCount: 0,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            const mockFollowingProfile = {
              userId: followingId,
              followingCount: 0,
              followersCount: 1,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            jest
              .spyOn(userProfileRepository, 'findOne')
              .mockImplementation(async ({ where }: any) => {
                if (where.userId === followerId) return mockFollowerProfile;
                if (where.userId === followingId) return mockFollowingProfile;
                return null;
              });

            jest.spyOn(userProfileRepository, 'save').mockResolvedValue({} as any);

            // Execute: Unfollow user
            await service.unfollowUser(followerId, followingId);

            // Verify: Follow relationship was removed
            expect(followerRepository.remove).toHaveBeenCalledWith(mockFollow);

            // Verify: Follow status should be false after unfollow
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(null);
            const status = await service.getFollowStatus(followerId, followingId);
            expect(status).toBe(false);
          },
        ),
        { numRuns: 5 },
      );
    });
  });

  // Feature: instagram-profile-system, Property 6: Follow Actions Maintain Count Invariants
  describe('Property 6: Follow Actions Maintain Count Invariants', () => {
    it('should increment counts by exactly 1 when following', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          fc.integer({ min: 0, max: 100 }), // Initial following count
          fc.integer({ min: 0, max: 100 }), // Initial followers count
          async ([followerId, followingId], initialFollowing, initialFollowers) => {
            // Mock: Users exist
            jest.spyOn(userRepository, 'findOne').mockResolvedValue({
              id: followerId,
              username: 'test',
              displayName: 'Test User',
            } as User);

            // Mock: Not already following
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(null);

            // Mock: Create follow
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
            } as Follower;

            jest.spyOn(followerRepository, 'create').mockReturnValue(mockFollow);
            jest.spyOn(followerRepository, 'save').mockResolvedValue(mockFollow);

            // Mock: User profiles with initial counts
            const mockFollowerProfile = {
              userId: followerId,
              followingCount: initialFollowing,
              followersCount: 0,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            const mockFollowingProfile = {
              userId: followingId,
              followingCount: 0,
              followersCount: initialFollowers,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            jest
              .spyOn(userProfileRepository, 'findOne')
              .mockImplementation(async ({ where }: any) => {
                if (where.userId === followerId) return mockFollowerProfile;
                if (where.userId === followingId) return mockFollowingProfile;
                return null;
              });

            let savedFollowerProfile: UserProfile;
            let savedFollowingProfile: UserProfile;

            jest
              .spyOn(userProfileRepository, 'save')
              .mockImplementation(async (profile: UserProfile) => {
                if (profile.userId === followerId) {
                  savedFollowerProfile = profile;
                } else if (profile.userId === followingId) {
                  savedFollowingProfile = profile;
                }
                return profile;
              });

            // Execute: Follow user
            await service.followUser(followerId, followingId);

            // Verify: Counts increased by exactly 1
            expect(savedFollowerProfile.followingCount).toBe(initialFollowing + 1);
            expect(savedFollowingProfile.followersCount).toBe(initialFollowers + 1);

            // Verify: Counts are non-negative
            expect(savedFollowerProfile.followingCount).toBeGreaterThanOrEqual(0);
            expect(savedFollowingProfile.followersCount).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 5 },
      );
    });

    it('should decrement counts by exactly 1 when unfollowing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          fc.integer({ min: 1, max: 100 }), // Initial following count (at least 1)
          fc.integer({ min: 1, max: 100 }), // Initial followers count (at least 1)
          async ([followerId, followingId], initialFollowing, initialFollowers) => {
            // Mock: Existing follow
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
            } as Follower;

            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(mockFollow);
            jest.spyOn(followerRepository, 'remove').mockResolvedValue(mockFollow);

            // Mock: User profiles with initial counts
            const mockFollowerProfile = {
              userId: followerId,
              followingCount: initialFollowing,
              followersCount: 0,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            const mockFollowingProfile = {
              userId: followingId,
              followingCount: 0,
              followersCount: initialFollowers,
              postCount: 0,
              commentCount: 0,
              likesReceived: 0,
            } as UserProfile;

            jest
              .spyOn(userProfileRepository, 'findOne')
              .mockImplementation(async ({ where }: any) => {
                if (where.userId === followerId) return mockFollowerProfile;
                if (where.userId === followingId) return mockFollowingProfile;
                return null;
              });

            let savedFollowerProfile: UserProfile;
            let savedFollowingProfile: UserProfile;

            jest
              .spyOn(userProfileRepository, 'save')
              .mockImplementation(async (profile: UserProfile) => {
                if (profile.userId === followerId) {
                  savedFollowerProfile = profile;
                } else if (profile.userId === followingId) {
                  savedFollowingProfile = profile;
                }
                return profile;
              });

            // Execute: Unfollow user
            await service.unfollowUser(followerId, followingId);

            // Verify: Counts decreased by exactly 1
            expect(savedFollowerProfile.followingCount).toBe(initialFollowing - 1);
            expect(savedFollowingProfile.followersCount).toBe(initialFollowers - 1);

            // Verify: Counts are non-negative
            expect(savedFollowerProfile.followingCount).toBeGreaterThanOrEqual(0);
            expect(savedFollowingProfile.followersCount).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 5 },
      );
    });
  });

  // Feature: instagram-profile-system, Property 7: Follow Status Reflects Database State
  describe('Property 7: Follow Status Reflects Database State', () => {
    it('should return true when follow relationship exists in database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          async ([followerId, followingId]) => {
            // Mock: Follow relationship exists
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
              createdAt: new Date(),
            } as Follower;

            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(mockFollow);

            // Execute: Get follow status
            const status = await service.getFollowStatus(followerId, followingId);

            // Verify: Status reflects database state (true)
            expect(status).toBe(true);
            expect(followerRepository.findOne).toHaveBeenCalledWith({
              where: { followerId, followingId },
            });
          },
        ),
        { numRuns: 5 },
      );
    });

    it('should return false when follow relationship does not exist in database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          async ([followerId, followingId]) => {
            // Mock: No follow relationship
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(null);

            // Execute: Get follow status
            const status = await service.getFollowStatus(followerId, followingId);

            // Verify: Status reflects database state (false)
            expect(status).toBe(false);
            expect(followerRepository.findOne).toHaveBeenCalledWith({
              where: { followerId, followingId },
            });
          },
        ),
        { numRuns: 5 },
      );
    });
  });

  // Additional edge case tests
  describe('Edge Cases', () => {
    it('should prevent self-follow', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          // Execute and verify: Should throw BadRequestException
          await expect(service.followUser(userId, userId)).rejects.toThrow(
            BadRequestException,
          );
          await expect(service.followUser(userId, userId)).rejects.toThrow(
            'You cannot follow yourself',
          );
        }),
        { numRuns: 5 },
      );
    });

    it('should prevent duplicate follows', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          async ([followerId, followingId]) => {
            // Mock: Users exist
            jest.spyOn(userRepository, 'findOne').mockResolvedValue({
              id: followerId,
              username: 'test',
            } as User);

            // Mock: Already following
            const mockFollow = {
              id: 'follow-id',
              followerId,
              followingId,
            } as Follower;

            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(mockFollow);

            // Execute and verify: Should throw BadRequestException
            await expect(service.followUser(followerId, followingId)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.followUser(followerId, followingId)).rejects.toThrow(
              'Already following this user',
            );
          },
        ),
        { numRuns: 5 },
      );
    });

    it('should handle unfollow when not following', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(fc.uuid(), fc.uuid()).filter(([id1, id2]) => id1 !== id2),
          async ([followerId, followingId]) => {
            // Mock: Not following
            jest.spyOn(followerRepository, 'findOne').mockResolvedValue(null);

            // Execute and verify: Should throw BadRequestException
            await expect(service.unfollowUser(followerId, followingId)).rejects.toThrow(
              BadRequestException,
            );
            await expect(service.unfollowUser(followerId, followingId)).rejects.toThrow(
              'Not following this user',
            );
          },
        ),
        { numRuns: 5 },
      );
    });
  });
});

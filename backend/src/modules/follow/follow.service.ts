import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from '../../entities/follower.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../schemas/notification.schema';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follower)
    private followerRepository: Repository<Follower>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  async followUser(followerId: string, followingId: string): Promise<void> {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      this.userRepository.findOne({ where: { id: followerId } }),
      this.userRepository.findOne({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.followerRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    // Create follow relationship
    const follow = this.followerRepository.create({
      followerId,
      followingId,
    });

    await this.followerRepository.save(follow);

    // Update profile stats
    await this.updateFollowCounts(followerId, followingId, 1);

    // Create notification
    await this.notificationService.createNotification({
      userId: followingId,
      type: NotificationType.FOLLOW,
      actorId: follower.id,
      actorName: follower.displayName || follower.username,
      actorUsername: follower.username,
      message: `${follower.displayName || follower.username} started following you`,
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // Find the follow relationship
    const follow = await this.followerRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new BadRequestException('Not following this user');
    }

    // Delete follow relationship
    await this.followerRepository.remove(follow);

    // Update profile stats
    await this.updateFollowCounts(followerId, followingId, -1);
  }

  async getFollowStatus(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followerRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const skip = (page - 1) * limit;

    const followers = await this.followerRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return followers.map((f) => f.follower);
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const skip = (page - 1) * limit;

    const following = await this.followerRepository.find({
      where: { followerId: userId },
      relations: ['following'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return following.map((f) => f.following);
  }

  async getFollowerCount(userId: string): Promise<number> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    return profile?.followersCount || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    return profile?.followingCount || 0;
  }

  private async updateFollowCounts(
    followerId: string,
    followingId: string,
    delta: number,
  ): Promise<void> {
    // Get or create profiles
    let [followerProfile, followingProfile] = await Promise.all([
      this.userProfileRepository.findOne({ where: { userId: followerId } }),
      this.userProfileRepository.findOne({ where: { userId: followingId } }),
    ]);

    if (!followerProfile) {
      followerProfile = this.userProfileRepository.create({
        userId: followerId,
        followingCount: 0,
        followersCount: 0,
        postCount: 0,
        commentCount: 0,
        likesReceived: 0,
      });
    }

    if (!followingProfile) {
      followingProfile = this.userProfileRepository.create({
        userId: followingId,
        followingCount: 0,
        followersCount: 0,
        postCount: 0,
        commentCount: 0,
        likesReceived: 0,
      });
    }

    // Update counts
    followerProfile.followingCount = Math.max(0, followerProfile.followingCount + delta);
    followingProfile.followersCount = Math.max(0, followingProfile.followersCount + delta);

    await Promise.all([
      this.userProfileRepository.save(followerProfile),
      this.userProfileRepository.save(followingProfile),
    ]);
  }
}

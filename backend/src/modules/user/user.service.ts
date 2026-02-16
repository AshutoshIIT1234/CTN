import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';
import { RedisService } from '../../services/redis.service';

export interface UserProfileData {
  id: string;
  username: string;
  displayName?: string;
  email?: string; // Only visible for own profile
  role: string;
  college?: {
    id: string;
    name: string;
    logoUrl: string;
  };
  bio?: string;
  profilePictureUrl?: string;
  joinDate: Date;
  stats: {
    postCount: number;
    commentCount: number;
    likesReceived: number;
  };
}

export interface UserSearchResult {
  id: string;
  username: string;
  displayName?: string;
  profilePictureUrl?: string;
  role: string;
  college?: {
    id: string;
    name: string;
  };
}

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  profilePictureUrl?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
    private redisService: RedisService
  ) {}

  async getUserProfile(userId: string, requestingUserId: string): Promise<UserProfileData> {
    // Try to get from cache first
    const cacheKey = `profile:${userId}:${requestingUserId}`;
    const cachedProfile = await this.redisService.get(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college', 'profile']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure user profile exists
    let userProfile = user.profile;
    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    const isOwnProfile = userId === requestingUserId;

    const profileData: UserProfileData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      bio: user.bio,
      profilePictureUrl: user.profilePictureUrl,
      joinDate: user.createdAt,
      stats: {
        postCount: userProfile.postCount,
        commentCount: userProfile.commentCount,
        likesReceived: userProfile.likesReceived
      }
    };

    // Include email only for own profile
    if (isOwnProfile) {
      profileData.email = user.email;
    }

    // Include college information if available
    if (user.college) {
      profileData.college = {
        id: user.college.id,
        name: user.college.name,
        logoUrl: user.college.logoUrl
      };
    }

    // Cache the profile data for 30 minutes
    await this.redisService.set(cacheKey, profileData, 1800);

    return profileData;
  }

  async updateUserProfile(userId: string, updateData: ProfileUpdateData): Promise<UserProfileData> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college', 'profile']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (updateData.displayName !== undefined) {
      user.displayName = updateData.displayName;
    }
    if (updateData.bio !== undefined) {
      user.bio = updateData.bio;
    }
    if (updateData.profilePictureUrl !== undefined) {
      user.profilePictureUrl = updateData.profilePictureUrl;
    }

    await this.userRepository.save(user);

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);

    // Return updated profile
    return this.getUserProfile(userId, userId);
  }

  async uploadProfilePicture(userId: string, fileBuffer: Buffer, filename: string): Promise<string> {
    // In a real implementation, you would upload to a cloud storage service
    // For now, we'll simulate a URL
    const profilePictureUrl = `/uploads/profiles/${userId}/${filename}`;
    
    await this.userRepository.update(userId, {
      profilePictureUrl
    });

    return profilePictureUrl;
  }

  async searchUsers(query: string, limit: number = 50): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Try to get from cache first
    const cachedResults = await this.redisService.getUserSearchResults(query);
    if (cachedResults) {
      return cachedResults;
    }

    const searchTerm = `%${query.trim()}%`;

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.college', 'college')
      .where('user.username ILIKE :searchTerm', { searchTerm })
      .orWhere('user.displayName ILIKE :searchTerm', { searchTerm })
      .orWhere('college.name ILIKE :searchTerm', { searchTerm })
      .orderBy('user.username', 'ASC')
      .limit(limit)
      .getMany();

    const results = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      role: user.role,
      college: user.college ? {
        id: user.college.id,
        name: user.college.name
      } : undefined
    }));

    // Cache search results for 10 minutes
    await this.redisService.setUserSearchResults(query, results, 600);

    return results;
  }

  async getUserStats(userId: string): Promise<{ postCount: number; commentCount: number; likesReceived: number }> {
    let userProfile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    return {
      postCount: userProfile.postCount,
      commentCount: userProfile.commentCount,
      likesReceived: userProfile.likesReceived
    };
  }

  async incrementPostCount(userId: string): Promise<void> {
    let userProfile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    userProfile.postCount += 1;
    userProfile.lastActive = new Date();
    await this.userProfileRepository.save(userProfile);

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);
  }

  async incrementCommentCount(userId: string): Promise<void> {
    let userProfile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    userProfile.commentCount += 1;
    userProfile.lastActive = new Date();
    await this.userProfileRepository.save(userProfile);

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);
  }

  async incrementLikesReceived(userId: string): Promise<void> {
    let userProfile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    userProfile.likesReceived += 1;
    await this.userProfileRepository.save(userProfile);

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);
  }

  private async createUserProfile(userId: string): Promise<UserProfile> {
    const userProfile = this.userProfileRepository.create({
      userId,
      postCount: 0,
      commentCount: 0,
      likesReceived: 0,
      lastActive: new Date()
    });

    return await this.userProfileRepository.save(userProfile);
  }
}
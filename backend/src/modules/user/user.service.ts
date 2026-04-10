import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';
import { UserSettings } from '../../entities/user-settings.entity';
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
  coverPhotoUrl?: string;
  joinDate: Date;
  stats: {
    postCount: number;
    commentCount: number;
    likesReceived: number;
    followersCount: number;
    followingCount: number;
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
  followerCount?: number;
}

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
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
    @InjectRepository(UserSettings)
    private userSettingsRepository: Repository<UserSettings>,
    private redisService: RedisService
  ) { }

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
      coverPhotoUrl: user.coverPhotoUrl,
      joinDate: user.createdAt,
      stats: {
        postCount: userProfile.postCount,
        commentCount: userProfile.commentCount,
        likesReceived: userProfile.likesReceived,
        followersCount: userProfile.followersCount || 0,
        followingCount: userProfile.followingCount || 0,
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
    if (updateData.coverPhotoUrl !== undefined) {
      user.coverPhotoUrl = updateData.coverPhotoUrl;
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

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);

    return profilePictureUrl;
  }

  async uploadCoverPhoto(userId: string, coverPhotoUrl: string): Promise<void> {
    await this.userRepository.update(userId, {
      coverPhotoUrl
    });

    // Invalidate cached profile data
    await this.redisService.invalidateUserProfile(userId);
  }

  async getProfileStats(userId: string): Promise<{
    postCount: number;
    commentCount: number;
    likesReceived: number;
    followersCount: number;
    followingCount: number;
  }> {
    // Try to get from cache first
    const cacheKey = `profile:stats:${userId}`;
    const cachedStats = await this.redisService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    let userProfile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserProfile(userId);
    }

    const stats = {
      postCount: userProfile.postCount,
      commentCount: userProfile.commentCount,
      likesReceived: userProfile.likesReceived,
      followersCount: userProfile.followersCount || 0,
      followingCount: userProfile.followingCount || 0,
    };

    // Cache stats for 5 minutes
    await this.redisService.set(cacheKey, stats, 300);

    return stats;
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

  async getSuggestedUsers(limit: number = 4): Promise<UserSearchResult[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.college', 'college')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('profile.followersCount', 'DESC', 'NULLS LAST')
      .limit(limit)
      .getMany();

    return users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      role: user.role,
      followerCount: user.profile?.followersCount || 0,
      college: user.college ? {
        id: user.college.id,
        name: user.college.name
      } : undefined
    }));
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
      followersCount: 0,
      followingCount: 0,
      lastActive: new Date()
    });

    return await this.userProfileRepository.save(userProfile);
  }

  async getNotificationSettings(userId: string) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    return {
      likes: settings.notifyLikes,
      comments: settings.notifyComments,
      replies: settings.notifyReplies,
      follows: settings.notifyFollows,
      messages: settings.notifyMessages,
      emailNotifications: settings.emailNotifications
    };
  }

  async updateNotificationSettings(userId: string, data: any) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    if (data.likes !== undefined) settings.notifyLikes = data.likes;
    if (data.comments !== undefined) settings.notifyComments = data.comments;
    if (data.replies !== undefined) settings.notifyReplies = data.replies;
    if (data.follows !== undefined) settings.notifyFollows = data.follows;
    if (data.messages !== undefined) settings.notifyMessages = data.messages;
    if (data.emailNotifications !== undefined) settings.emailNotifications = data.emailNotifications;

    await this.userSettingsRepository.save(settings);
    return this.getNotificationSettings(userId);
  }

  async getPrivacySettings(userId: string) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    return {
      privateAccount: settings.privateAccount,
      showActivityStatus: settings.showActivityStatus,
      allowTagging: settings.allowTagging,
      allowMentions: settings.allowMentions
    };
  }

  async updatePrivacySettings(userId: string, data: any) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    if (data.privateAccount !== undefined) settings.privateAccount = data.privateAccount;
    if (data.showActivityStatus !== undefined) settings.showActivityStatus = data.showActivityStatus;
    if (data.allowTagging !== undefined) settings.allowTagging = data.allowTagging;
    if (data.allowMentions !== undefined) settings.allowMentions = data.allowMentions;

    await this.userSettingsRepository.save(settings);
    return this.getPrivacySettings(userId);
  }

  async getAppearanceSettings(userId: string) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    return {
      theme: settings.theme
    };
  }

  async updateAppearanceSettings(userId: string, data: any) {
    let settings = await this.userSettingsRepository.findOne({ where: { userId } });

    if (!settings) {
      settings = await this.createUserSettings(userId);
    }

    if (data.theme) settings.theme = data.theme;

    await this.userSettingsRepository.save(settings);
    return this.getAppearanceSettings(userId);
  }

  private async createUserSettings(userId: string): Promise<UserSettings> {
    const newSettings = this.userSettingsRepository.create({
      userId: userId,
      notifyLikes: true,
      notifyComments: true,
      notifyReplies: true,
      notifyFollows: true,
      notifyMessages: true,
      emailNotifications: false,
      privateAccount: false,
      showActivityStatus: true,
      allowTagging: true,
      allowMentions: true,
      theme: 'light'
    });

    return await this.userSettingsRepository.save(newSettings);
  }
}

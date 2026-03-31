import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostDocument } from '@/schemas/post.schema';
import { Comment, CommentDocument } from '@/schemas/comment.schema';
import { Like, LikeDocument } from '@/schemas/like.schema';
import { Report, ReportDocument } from '@/schemas/report.schema';
import { SavedPost, SavedPostDocument } from '@/schemas/saved-post.schema';
import { NotificationType } from '@/schemas/notification.schema';
import { User } from '@/entities/user.entity';
import { UserProfile } from '@/entities/user-profile.entity';
import { College } from '@/entities/college.entity';
import { Moderator } from '@/entities/moderator.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RedisService } from '../../services/redis.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(SavedPost.name) private savedPostModel: Model<SavedPostDocument>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(College) private collegeRepository: Repository<College>,
    @InjectRepository(Moderator) private moderatorRepository: Repository<Moderator>,
    private redisService: RedisService,
    private notificationService: NotificationService,
  ) { }

  // National Panel Posts
  async createNationalPost(userId: string, createPostDto: CreatePostDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = new this.postModel({
      authorId: user.id,
      authorName: user.displayName || user.username,
      authorUsername: user.username,
      authorRole: user.role,
      panelType: 'NATIONAL',
      title: createPostDto.title || '',
      content: createPostDto.content,
      imageUrls: createPostDto.imageUrls || [],
      mentions: this.extractMentions(createPostDto.content),
      likes: 0,
      commentCount: 0,
      reportCount: 0,
      impressions: 0,
    });

    const savedPost = await post.save();

    // Update user profile post count
    await this.userProfileRepository.increment(
      { userId: user.id },
      'postCount',
      1,
    );

    // Invalidate national feed cache and user profile
    await this.redisService.invalidatePostFeeds('national');
    await this.redisService.invalidateUserProfile(user.id);

    return this.formatPost(savedPost, userId);
  }

  // College Panel Posts
  async createCollegePost(userId: string, createPostDto: CreatePostDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is a college user (has college access)
    if (!user.college || (user.role !== 'COLLEGE_USER' && user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('College panel access restricted to college users');
    }

    const post = new this.postModel({
      authorId: user.id,
      authorName: user.displayName || user.username,
      authorUsername: user.username,
      authorRole: user.role,
      collegeId: user.college.id,
      panelType: 'COLLEGE',
      title: createPostDto.title || '',
      content: createPostDto.content,
      imageUrls: createPostDto.imageUrls || [],
      mentions: this.extractMentions(createPostDto.content),
      likes: 0,
      commentCount: 0,
      reportCount: 0,
      impressions: 0,
    });

    const savedPost = await post.save();

    // Update user profile post count
    await this.userProfileRepository.increment(
      { userId: user.id },
      'postCount',
      1,
    );

    // Invalidate college feed cache and user profile
    await this.redisService.invalidatePostFeeds('college', user.college.id);
    await this.redisService.invalidateUserProfile(user.id);

    return this.formatPost(savedPost, userId);
  }

  async getCollegeFeed(collegeId: string, page: number = 1, limit: number = 20, userId?: string) {
    // Try to get from cache first
    const cachedFeed = await this.redisService.getPostFeed('college', collegeId, page);
    if (cachedFeed && userId) {
      // Re-format posts with current user's like status
      const formattedPosts = await Promise.all(
        cachedFeed.posts.map(async (post) => {
          const postDoc = await this.postModel.findById(post.id).exec();
          return postDoc ? this.formatPost(postDoc, userId) : post;
        })
      );
      return { ...cachedFeed, posts: formattedPosts };
    }

    // Verify user has access to this college panel
    let user: any = null;
    if (userId) {
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['college'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check access: user must be from the same college or be an admin
      if (user.role !== 'ADMIN' && (!user.college || user.college.id !== collegeId)) {
        throw new ForbiddenException('College panel access restricted to members');
      }
    } else {
      throw new ForbiddenException('Authentication required for college panel access');
    }

    // Get college information for branding
    const college = await this.collegeRepository.findOne({
      where: { id: collegeId },
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    const skip = (page - 1) * limit;

    // Build query - hide hidden posts from regular users, but show to moderators
    let query: any = {
      panelType: 'COLLEGE',
      collegeId: collegeId,
      isDeleted: false
    };

    // Check if user is a moderator for this college
    let isModerator = false;
    if (userId && user && user.role === 'MODERATOR') {
      const moderatorAssignment = await this.moderatorRepository.findOne({
        where: { userId, collegeId }
      });
      isModerator = !!moderatorAssignment;
    }

    // Hide hidden posts from non-moderators
    if (!isModerator && user && user.role !== 'ADMIN') {
      query.isHidden = { $ne: true };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    const formattedPosts = await Promise.all(
      posts.map((post) => this.formatPost(post, userId)),
    );

    const result = {
      college: {
        id: college.id,
        name: college.name,
        logoUrl: college.logoUrl,
      },
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 5 minutes
    await this.redisService.setPostFeed('college', collegeId, page, result, 300);

    return result;
  }

  async getUserCollegeFeed(page: number = 1, limit: number = 20, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user doesn't have a college, return empty feed
    if (!user.college) {
      return {
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Use the existing college feed method
    return this.getCollegeFeed(user.college.id, page, limit, userId);
  }

  async getNationalFeed(page: number = 1, limit: number = 20, userId?: string, filter: string = 'latest') {
    // Try to get from cache first
    const cachedFeed = await this.redisService.getPostFeed(`national_${filter}`, null, page);
    if (cachedFeed && userId) {
      // Re-format posts with current user's like status
      const formattedPosts = await Promise.all(
        cachedFeed.posts.map(async (post) => {
          const postDoc = await this.postModel.findById(post.id).exec();
          return postDoc ? this.formatPost(postDoc, userId) : post;
        })
      );
      return { ...cachedFeed, posts: formattedPosts };
    }

    const skip = (page - 1) * limit;

    // Define sort criteria based on filter
    let sortCriteria: any = { createdAt: -1 };
    if (filter === 'trending') {
      sortCriteria = { likes: -1, createdAt: -1 };
    } else if (filter === 'debate') {
      sortCriteria = { commentCount: -1, createdAt: -1 };
    }

    const posts = await this.postModel
      .find({ panelType: 'NATIONAL', isDeleted: false })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments({
      panelType: 'NATIONAL',
      isDeleted: false,
    });

    const formattedPosts = await Promise.all(
      posts.map((post) => this.formatPost(post, userId)),
    );

    const result = {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 5 minutes
    await this.redisService.setPostFeed(`national_${filter}`, null, page, result, 300);

    return result;
  }

  async getTrendingTopics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Try recent posts first (past 7 days), sorted by engagement
    let posts = await this.postModel
      .find({
        isDeleted: false,
        panelType: 'NATIONAL',
        createdAt: { $gte: sevenDaysAgo },
      })
      .sort({ likes: -1, commentCount: -1 })
      .limit(6)
      .select('_id title content likes commentCount createdAt')
      .exec();

    // Fall back to all-time top posts when there is little recent activity
    if (posts.length < 3) {
      posts = await this.postModel
        .find({ isDeleted: false, panelType: 'NATIONAL' })
        .sort({ likes: -1, commentCount: -1 })
        .limit(6)
        .select('_id title content likes commentCount createdAt')
        .exec();
    }

    return posts.map(post => ({
      id: (post as any)._id.toString(),
      name: (post.title || post.content).substring(0, 60).trim(),
      postCount: post.likes + post.commentCount,
    }));
  }

  async getNetworkStats(): Promise<{ totalPosts: number; totalToday: number }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalPosts, totalToday] = await Promise.all([
      this.postModel.countDocuments({ isDeleted: false }),
      this.postModel.countDocuments({
        isDeleted: false,
        createdAt: { $gte: todayStart },
      }),
    ]);

    return { totalPosts, totalToday };
  }

  async getRecentDiscussions() {
    const posts = await this.postModel
      .find({ isDeleted: false })
      .sort({ commentCount: -1, createdAt: -1 })
      .limit(3)
      .exec();

    return posts.map(post => {
      const now = new Date();
      const diffMs = now.getTime() - post.createdAt.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));
      let timeStr = `${diffHrs}h`;
      if (diffHrs === 0) timeStr = `${diffMins || 1}m`;
      if (diffHrs > 24) timeStr = `${Math.floor(diffHrs / 24)}d`;

      return {
        title: post.title || post.content.substring(0, 50) + '...',
        replies: post.commentCount,
        time: timeStr
      };
    });
  }

  async getDomains() {
    return [
      'Philosophy', 'Ethics', 'Logic', 'Debate', 'Science',
      'Psychology', 'Sociology', 'Politics', 'History', 'Literature'
    ];
  }

  async getPostById(postId: string, userId?: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    return this.formatPost(post, userId);
  }

  async getUserPosts(authorId: string, page: number = 1, limit: number = 20, userId?: string) {
    const skip = (page - 1) * limit;
    const query = { authorId, isDeleted: false };

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    const formattedPosts = await Promise.all(
      posts.map((post) => this.formatPost(post, userId)),
    );

    return {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    };
  }

  async getUserMediaPosts(authorId: string, page: number = 1, limit: number = 20, userId?: string) {
    const skip = (page - 1) * limit;
    const query = {
      authorId,
      isDeleted: false,
      imageUrls: { $exists: true, $ne: [] }
    };

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    const formattedPosts = await Promise.all(
      posts.map((post) => this.formatPost(post, userId)),
    );

    return {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    };
  }

  async getUserReplies(authorId: string, page: number = 1, limit: number = 20, userId?: string) {
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ authorId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.commentModel.countDocuments({ authorId, isDeleted: false });

    const formattedComments = await Promise.all(
      comments.map((comment) => this.formatComment(comment, userId)),
    );

    return {
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + comments.length < total,
      },
    };
  }

  async getTaggedPosts(userId: string, page: number = 1, limit: number = 20, currentUserId?: string) {
    const skip = (page - 1) * limit;

    // Fetch the user to get their username for mention lookup
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { posts: [], pagination: { page, limit, total: 0, totalPages: 0, hasMore: false } };
    }

    // Use the indexed mentions field for efficient lookup
    const query = {
      mentions: user.username.toLowerCase(),
      isDeleted: false
    };

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    const formattedPosts = await Promise.all(
      posts.map((post) => this.formatPost(post, currentUserId)),
    );

    return {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    };
  }

  // Comments
  async createComment(
    userId: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = new this.commentModel({
      postId: new Types.ObjectId(postId),
      authorId: user.id,
      authorName: user.displayName || user.username,
      authorUsername: user.username,
      content: createCommentDto.content,
      parentCommentId: createCommentDto.parentCommentId
        ? new Types.ObjectId(createCommentDto.parentCommentId)
        : undefined,
      likes: 0,
    });

    const savedComment = await comment.save();

    // Update post comment count
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    // Update user profile comment count
    await this.userProfileRepository.increment(
      { userId: user.id },
      'commentCount',
      1,
    );
    await this.redisService.invalidateUserProfile(user.id);

    // Trigger notification for the post author
    if (post.authorId !== userId) {
      await this.notificationService.createNotification({
        userId: post.authorId,
        type: NotificationType.COMMENT,
        actorId: user.id,
        actorName: user.displayName || user.username,
        actorUsername: user.username,
        postId: postId,
        message: 'commented on your post',
      });
    }


    return this.formatComment(savedComment, userId);
  }

  async getPostComments(postId: string, userId?: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const comments = await this.commentModel
      .find({
        postId: new Types.ObjectId(postId),
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(
      comments.map((comment) => this.formatComment(comment, userId)),
    );
  }

  // Likes
  async likePost(userId: string, postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.likeModel.findOne({
      targetId: new Types.ObjectId(postId),
      userId,
    });

    if (existingLike) {
      // Unlike
      await this.likeModel.deleteOne({ _id: existingLike._id });
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      });

      // Update author profile likesReceived
      await this.userProfileRepository.decrement(
        { userId: post.authorId },
        'likesReceived',
        1,
      );
      await this.redisService.invalidateUserProfile(post.authorId);

      // Invalidate feed caches
      await this.redisService.invalidatePostFeeds('national');
      if (post.collegeId) {
        await this.redisService.invalidatePostFeeds('college', post.collegeId);
      }

      return { liked: false };
    } else {
      // Like
      const like = new this.likeModel({
        targetId: new Types.ObjectId(postId),
        targetType: 'POST',
        userId,
      });
      await like.save();
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { likes: 1 },
        $push: { likedBy: userId },
      });

      // Update author profile likesReceived
      await this.userProfileRepository.increment(
        { userId: post.authorId },
        'likesReceived',
        1,
      );
      await this.redisService.invalidateUserProfile(post.authorId);

      // Trigger notification
      if (post.authorId !== userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          await this.notificationService.createNotification({
            userId: post.authorId,
            type: NotificationType.LIKE,
            actorId: userId,
            actorName: user.displayName || user.username,
            actorUsername: user.username,
            postId: postId,
            message: 'liked your post',
          });
        }
      }

      // Invalidate feed caches
      await this.redisService.invalidatePostFeeds('national');
      if (post.collegeId) {
        await this.redisService.invalidatePostFeeds('college', post.collegeId);
      }

      return { liked: true };
    }
  }

  async likeComment(userId: string, commentId: string) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid comment ID');
    }

    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Comment not found');
    }

    // Check if already liked
    const existingLike = await this.likeModel.findOne({
      targetId: new Types.ObjectId(commentId),
      userId,
    });

    if (existingLike) {
      // Unlike
      await this.likeModel.deleteOne({ _id: existingLike._id });
      await this.commentModel.findByIdAndUpdate(commentId, {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      });

      // Update author profile likesReceived
      await this.userProfileRepository.decrement(
        { userId: comment.authorId },
        'likesReceived',
        1,
      );
      await this.redisService.invalidateUserProfile(comment.authorId);

      return { liked: false };
    } else {
      // Like
      const like = new this.likeModel({
        targetId: new Types.ObjectId(commentId),
        targetType: 'COMMENT',
        userId,
      });
      await like.save();
      await this.commentModel.findByIdAndUpdate(commentId, {
        $inc: { likes: 1 },
        $push: { likedBy: userId },
      });

      // Update author profile likesReceived
      await this.userProfileRepository.increment(
        { userId: comment.authorId },
        'likesReceived',
        1,
      );
      await this.redisService.invalidateUserProfile(comment.authorId);

      // Trigger notification for comment author
      if (comment.authorId !== userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          await this.notificationService.createNotification({
            userId: comment.authorId,
            type: NotificationType.LIKE,
            actorId: userId,
            actorName: user.displayName || user.username,
            actorUsername: user.username,
            postId: comment.postId.toString(),
            message: 'liked your comment',
          });
        }
      }

      return { liked: true };
    }
  }

  // Reports
  async reportPost(userId: string, postId: string, reason: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    const report = new this.reportModel({
      targetId: new Types.ObjectId(postId),
      targetType: 'POST',
      reportedBy: userId,
      reason,
      status: 'PENDING',
    });

    await report.save();

    // Update post report count
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { reportCount: 1 },
    });

    return { message: 'Report submitted successfully' };
  }

  async reportComment(userId: string, commentId: string, reason: string) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid comment ID');
    }

    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Comment not found');
    }

    const report = new this.reportModel({
      targetId: new Types.ObjectId(commentId),
      targetType: 'COMMENT',
      reportedBy: userId,
      reason,
      status: 'PENDING',
    });

    await report.save();

    return { message: 'Report submitted successfully' };
  }

  // Moderation methods for college posts
  async flagCollegePost(moderatorUserId: string, postId: string, reason: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Verify post is from college panel
    if (post.panelType !== 'COLLEGE') {
      throw new ForbiddenException('Can only moderate college panel posts');
    }

    // Verify moderator permissions
    const moderator = await this.userRepository.findOne({
      where: { id: moderatorUserId },
      relations: ['college']
    });

    if (!moderator || moderator.role !== 'MODERATOR') {
      throw new ForbiddenException('Only moderators can flag posts');
    }

    // Check if moderator is assigned to the post's college
    const moderatorAssignment = await this.moderatorRepository.findOne({
      where: { userId: moderatorUserId, collegeId: post.collegeId }
    });

    if (!moderatorAssignment) {
      throw new ForbiddenException('Moderators can only flag posts from their assigned college');
    }

    // Flag the post
    await this.postModel.findByIdAndUpdate(postId, {
      isFlagged: true,
      flaggedBy: moderatorUserId,
      flaggedAt: new Date(),
      flagReason: reason,
    });

    return { message: 'Post flagged successfully' };
  }

  async hideCollegePost(moderatorUserId: string, postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Verify post is from college panel
    if (post.panelType !== 'COLLEGE') {
      throw new ForbiddenException('Can only moderate college panel posts');
    }

    // Verify moderator permissions
    const moderator = await this.userRepository.findOne({
      where: { id: moderatorUserId },
      relations: ['college']
    });

    if (!moderator || moderator.role !== 'MODERATOR') {
      throw new ForbiddenException('Only moderators can hide posts');
    }

    // Check if moderator is assigned to the post's college
    const moderatorAssignment = await this.moderatorRepository.findOne({
      where: { userId: moderatorUserId, collegeId: post.collegeId }
    });

    if (!moderatorAssignment) {
      throw new ForbiddenException('Moderators can only hide posts from their assigned college');
    }

    // Hide the post (soft delete)
    await this.postModel.findByIdAndUpdate(postId, {
      isHidden: true,
      hiddenBy: moderatorUserId,
      hiddenAt: new Date(),
    });

    return { message: 'Post hidden successfully' };
  }

  async unhideCollegePost(moderatorUserId: string, postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Verify post is from college panel
    if (post.panelType !== 'COLLEGE') {
      throw new ForbiddenException('Can only moderate college panel posts');
    }

    // Verify moderator permissions
    const moderator = await this.userRepository.findOne({
      where: { id: moderatorUserId },
      relations: ['college']
    });

    if (!moderator || moderator.role !== 'MODERATOR') {
      throw new ForbiddenException('Only moderators can unhide posts');
    }

    // Check if moderator is assigned to the post's college
    const moderatorAssignment = await this.moderatorRepository.findOne({
      where: { userId: moderatorUserId, collegeId: post.collegeId }
    });

    if (!moderatorAssignment) {
      throw new ForbiddenException('Moderators can only unhide posts from their assigned college');
    }

    // Unhide the post
    await this.postModel.findByIdAndUpdate(postId, {
      isHidden: false,
      hiddenBy: null,
      hiddenAt: null,
    });

    return { message: 'Post unhidden successfully' };
  }

  // Admin Post Management Methods

  async getCollegeModerationStats(collegeId: string) {
    const [total, flagged, hidden] = await Promise.all([
      this.postModel.countDocuments({ panelType: 'COLLEGE', collegeId, isDeleted: false }),
      this.postModel.countDocuments({ panelType: 'COLLEGE', collegeId, isFlagged: true, isDeleted: false }),
      this.postModel.countDocuments({ panelType: 'COLLEGE', collegeId, isHidden: true, isDeleted: false }),
    ]);

    return { total, flagged, hidden };
  }

  /**
   * Admin: Create post in any panel (national or college)
   */
  async adminCreatePost(
    adminUserId: string,
    createPostDto: CreatePostDto & { panelType: 'NATIONAL' | 'COLLEGE'; collegeId?: string }
  ) {
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId },
      relations: ['college'],
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    // Validate college for college posts
    let college = null;
    if (createPostDto.panelType === 'COLLEGE') {
      if (!createPostDto.collegeId) {
        throw new BadRequestException('College ID required for college posts');
      }

      college = await this.collegeRepository.findOne({
        where: { id: createPostDto.collegeId }
      });

      if (!college) {
        throw new NotFoundException('College not found');
      }
    }

    const post = new this.postModel({
      authorId: admin.id,
      authorName: admin.displayName || admin.username,
      authorUsername: admin.username,
      authorRole: admin.role,
      collegeId: createPostDto.panelType === 'COLLEGE' ? createPostDto.collegeId : undefined,
      panelType: createPostDto.panelType,
      title: createPostDto.title || '',
      content: createPostDto.content,
      imageUrls: createPostDto.imageUrls || [],
      mentions: this.extractMentions(createPostDto.content),
      likes: 0,
      commentCount: 0,
      reportCount: 0,
      impressions: 0,
    });

    const savedPost = await post.save();

    // Update admin profile post count
    await this.userProfileRepository.increment(
      { userId: admin.id },
      'postCount',
      1,
    );
    await this.redisService.invalidateUserProfile(admin.id);

    return this.formatPost(savedPost, adminUserId);
  }

  /**
   * Admin: Delete post from any panel
   */
  async adminDeletePost(adminUserId: string, postId: string) {
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Soft delete the post
    await this.postModel.findByIdAndUpdate(postId, {
      isDeleted: true,
      deletedBy: adminUserId,
      deletedAt: new Date(),
    });

    // Decrement author's post count
    await this.userProfileRepository.decrement(
      { userId: post.authorId },
      'postCount',
      1,
    );
    await this.redisService.invalidateUserProfile(post.authorId);

    // Invalidate feed caches
    await this.redisService.invalidatePostFeeds('national');
    if (post.collegeId) {
      await this.redisService.invalidatePostFeeds('college', post.collegeId);
    }

    return { message: 'Post deleted successfully' };
  }

  /**
   * Admin: Get all posts across panels with filtering
   */
  async adminGetAllPosts(
    adminUserId: string,
    options: {
      page?: number;
      limit?: number;
      panelType?: 'NATIONAL' | 'COLLEGE';
      collegeId?: string;
      includeDeleted?: boolean;
      includeHidden?: boolean;
      search?: string;
    } = {}
  ) {
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    const {
      page = 1,
      limit = 20,
      panelType,
      collegeId,
      includeDeleted = false,
      includeHidden = true,
      search
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    if (panelType) {
      query.panelType = panelType;
    }

    if (collegeId) {
      query.collegeId = collegeId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { authorUsername: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    const formattedPosts = await Promise.all(
      posts.map(post => this.formatPost(post, adminUserId))
    );

    return {
      posts: formattedPosts,
      total,
      page,
      limit,
      hasMore: skip + posts.length < total,
    };
  }

  /**
   * Admin: Flag/unflag post from any panel
   */
  async adminFlagPost(adminUserId: string, postId: string, reason?: string) {
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Toggle flag status
    const isFlagged = !post.isFlagged;

    await this.postModel.findByIdAndUpdate(postId, {
      isFlagged,
      flaggedBy: isFlagged ? adminUserId : null,
      flaggedAt: isFlagged ? new Date() : null,
      flagReason: isFlagged ? reason : null,
    });

    return {
      message: isFlagged ? 'Post flagged successfully' : 'Post unflagged successfully',
      isFlagged
    };
  }

  /**
   * Admin: Hide/unhide post from any panel
   */
  async adminHidePost(adminUserId: string, postId: string) {
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    const post = await this.postModel.findById(postId).exec();
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    // Toggle hidden status
    const isHidden = !post.isHidden;

    await this.postModel.findByIdAndUpdate(postId, {
      isHidden,
      hiddenBy: isHidden ? adminUserId : null,
      hiddenAt: isHidden ? new Date() : null,
    });

    return {
      message: isHidden ? 'Post hidden successfully' : 'Post unhidden successfully',
      isHidden
    };
  }

  // Helper methods
  private extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];

    // Remove @ and convert to lowercase for consistent storage, then filter unique
    return [...new Set(matches.map(m => m.substring(1).toLowerCase()))];
  }

  private async formatPost(post: PostDocument, userId?: string) {
    const [isLiked, isSaved] = await Promise.all([
      userId ? post.likedBy?.includes(userId) : false,
      userId ? this.isSaved(userId, post._id.toString()) : false,
    ]);

    return {
      id: post._id.toString(),
      authorId: post.authorId,
      authorName: post.authorName,
      authorUsername: post.authorUsername,
      authorRole: post.authorRole,
      collegeId: post.collegeId,
      panelType: post.panelType,
      title: post.title,
      content: post.content,
      imageUrls: post.imageUrls || [],
      likes: post.likes,
      commentCount: post.commentCount,
      reportCount: post.reportCount,
      impressions: post.impressions || 0,
      isLiked: !!isLiked,
      isSaved: !!isSaved,
      isFlagged: post.isFlagged || false,
      isHidden: post.isHidden || false,
      flagReason: post.flagReason,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private async formatComment(comment: CommentDocument, userId?: string) {
    const isLiked = userId
      ? comment.likedBy?.includes(userId) || false
      : false;

    return {
      id: comment._id.toString(),
      postId: comment.postId.toString(),
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorUsername: comment.authorUsername,
      content: comment.content,
      likes: comment.likes,
      parentCommentId: comment.parentCommentId?.toString(),
      isLiked,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  // Saved Posts
  async savePost(userId: string, postId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already saved
    const existingSave = await this.savedPostModel.findOne({
      userId,
      postId: new Types.ObjectId(postId),
    });

    if (existingSave) {
      throw new BadRequestException('Post already saved');
    }

    const savedPost = new this.savedPostModel({
      userId,
      postId: new Types.ObjectId(postId),
    });

    await savedPost.save();
  }

  async unsavePost(userId: string, postId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const savedPost = await this.savedPostModel.findOne({
      userId,
      postId: new Types.ObjectId(postId),
    });

    if (!savedPost) {
      throw new NotFoundException('Saved post not found');
    }

    await this.savedPostModel.deleteOne({ _id: savedPost._id });
  }

  async getSavedPosts(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const savedRecords = await this.savedPostModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.savedPostModel.countDocuments({ userId });

    const postIds = savedRecords.map((record) => record.postId);
    const posts = await this.postModel
      .find({ _id: { $in: postIds }, isDeleted: false })
      .exec();

    // Map back to original order and format
    const formattedPosts = await Promise.all(
      savedRecords.map(async (record) => {
        const post = posts.find((p) => p._id.toString() === record.postId.toString());
        return post ? this.formatPost(post, userId) : null;
      }),
    );

    return {
      posts: formattedPosts.filter((p) => p !== null),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(postId)) {
      return false;
    }

    const savedPost = await this.savedPostModel.findOne({
      userId,
      postId: new Types.ObjectId(postId),
    });

    return !!savedPost;
  }
}

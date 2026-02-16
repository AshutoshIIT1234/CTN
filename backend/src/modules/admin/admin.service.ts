import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { College } from '../../entities/college.entity';
import { Moderator } from '../../entities/moderator.entity';
import { Resource, ResourceType } from '../../entities/resource.entity';
import { ResourceAccess } from '../../entities/resource-access.entity';
import { PaymentSession } from '../../entities/payment-session.entity';
import { PostService } from '../post/post.service';
import { ResourceService } from '../resource/resource.service';

export interface AdminStats {
  totalUsers: number;
  totalColleges: number;
  totalModerators: number;
  totalResources: number;
  totalPayments: number;
  usersByRole: Record<UserRole, number>;
}

export interface CollegeManagement {
  id: string;
  name: string;
  emailDomain: string;
  logoUrl: string;
  userCount: number;
  moderatorCount: number;
  resourceCount: number;
  createdAt: Date;
}

export interface PaymentRecord {
  id: string;
  sessionId: string;
  userId: string;
  resourceId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  user: {
    id: string;
    username: string;
    email: string;
  };
  resource: {
    id: string;
    fileName: string;
    college: {
      name: string;
    };
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
    @InjectRepository(Moderator)
    private moderatorRepository: Repository<Moderator>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(ResourceAccess)
    private resourceAccessRepository: Repository<ResourceAccess>,
    @InjectRepository(PaymentSession)
    private paymentSessionRepository: Repository<PaymentSession>,
    private postService: PostService,
    private resourceService: ResourceService,
  ) {}

  /**
   * Verify admin access for all admin operations
   */
  private async verifyAdminAccess(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return user;
  }

  /**
   * Get platform statistics (admin only)
   */
  async getPlatformStats(adminUserId: string): Promise<AdminStats> {
    await this.verifyAdminAccess(adminUserId);

    const [
      totalUsers,
      totalColleges,
      totalModerators,
      totalResources,
      totalPayments,
      usersByRole
    ] = await Promise.all([
      this.userRepository.count(),
      this.collegeRepository.count(),
      this.moderatorRepository.count(),
      this.resourceRepository.count(),
      this.paymentSessionRepository.count(),
      this.getUserCountsByRole()
    ]);

    return {
      totalUsers,
      totalColleges,
      totalModerators,
      totalResources,
      totalPayments,
      usersByRole
    };
  }

  /**
   * Get user counts by role
   */
  private async getUserCountsByRole(): Promise<Record<UserRole, number>> {
    const counts = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const result: Record<UserRole, number> = {
      [UserRole.GUEST]: 0,
      [UserRole.GENERAL_USER]: 0,
      [UserRole.COLLEGE_USER]: 0,
      [UserRole.MODERATOR]: 0,
      [UserRole.ADMIN]: 0,
    };

    counts.forEach(({ role, count }) => {
      result[role as UserRole] = parseInt(count);
    });

    return result;
  }

  /**
   * Get all colleges with management information (admin only)
   */
  async getAllCollegesWithStats(adminUserId: string): Promise<CollegeManagement[]> {
    await this.verifyAdminAccess(adminUserId);

    const colleges = await this.collegeRepository.find({
      order: { name: 'ASC' }
    });

    const collegeStats = await Promise.all(
      colleges.map(async (college) => {
        const [userCount, moderatorCount, resourceCount] = await Promise.all([
          this.userRepository.count({ where: { collegeId: college.id } }),
          this.moderatorRepository.count({ where: { collegeId: college.id } }),
          this.resourceRepository.count({ where: { collegeId: college.id } })
        ]);

        return {
          id: college.id,
          name: college.name,
          emailDomain: college.emailDomain,
          logoUrl: college.logoUrl,
          userCount,
          moderatorCount,
          resourceCount,
          createdAt: college.createdAt,
        };
      })
    );

    return collegeStats;
  }

  /**
   * Create a new college (admin only)
   */
  async createCollege(
    adminUserId: string,
    collegeData: {
      name: string;
      emailDomain: string;
      logoUrl?: string;
    }
  ): Promise<College> {
    await this.verifyAdminAccess(adminUserId);

    // Check if domain already exists
    const existingCollege = await this.collegeRepository.findOne({
      where: { emailDomain: collegeData.emailDomain }
    });

    if (existingCollege) {
      throw new BadRequestException('Email domain already registered to another college');
    }

    // Validate email domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(collegeData.emailDomain)) {
      throw new BadRequestException('Invalid email domain format');
    }

    const college = this.collegeRepository.create({
      name: collegeData.name,
      emailDomain: collegeData.emailDomain,
      logoUrl: collegeData.logoUrl || '',
    });

    return await this.collegeRepository.save(college);
  }

  /**
   * Update college information (admin only)
   */
  async updateCollege(
    adminUserId: string,
    collegeId: string,
    updateData: {
      name?: string;
      emailDomain?: string;
      logoUrl?: string;
    }
  ): Promise<College> {
    await this.verifyAdminAccess(adminUserId);

    const college = await this.collegeRepository.findOne({ where: { id: collegeId } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    // If updating email domain, check for conflicts
    if (updateData.emailDomain && updateData.emailDomain !== college.emailDomain) {
      const existingCollege = await this.collegeRepository.findOne({
        where: { emailDomain: updateData.emailDomain }
      });

      if (existingCollege) {
        throw new BadRequestException('Email domain already registered to another college');
      }

      // Validate email domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(updateData.emailDomain)) {
        throw new BadRequestException('Invalid email domain format');
      }
    }

    // Update college fields
    if (updateData.name) college.name = updateData.name;
    if (updateData.emailDomain) college.emailDomain = updateData.emailDomain;
    if (updateData.logoUrl !== undefined) college.logoUrl = updateData.logoUrl;

    return await this.collegeRepository.save(college);
  }

  /**
   * Delete a college (admin only)
   */
  async deleteCollege(adminUserId: string, collegeId: string): Promise<void> {
    await this.verifyAdminAccess(adminUserId);

    const college = await this.collegeRepository.findOne({ where: { id: collegeId } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Check if college has users
    const userCount = await this.userRepository.count({ where: { collegeId } });
    if (userCount > 0) {
      throw new BadRequestException('Cannot delete college with existing users');
    }

    // Check if college has resources
    const resourceCount = await this.resourceRepository.count({ where: { collegeId } });
    if (resourceCount > 0) {
      throw new BadRequestException('Cannot delete college with existing resources');
    }

    await this.collegeRepository.remove(college);
  }

  /**
   * Get all payment records (admin only)
   */
  async getAllPaymentRecords(adminUserId: string): Promise<PaymentRecord[]> {
    await this.verifyAdminAccess(adminUserId);

    const payments = await this.paymentSessionRepository.find({
      relations: ['user', 'resource', 'resource.college'],
      order: { createdAt: 'DESC' }
    });

    return payments.map(payment => ({
      id: payment.id,
      sessionId: payment.sessionId,
      userId: payment.userId,
      resourceId: payment.resourceId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      user: {
        id: payment.user.id,
        username: payment.user.username,
        email: payment.user.email,
      },
      resource: {
        id: payment.resource.id,
        fileName: payment.resource.fileName,
        college: {
          name: payment.resource.college.name,
        },
      },
    }));
  }

  /**
   * Get all unlock records (admin only)
   */
  async getAllUnlockRecords(adminUserId: string): Promise<ResourceAccess[]> {
    await this.verifyAdminAccess(adminUserId);

    return await this.resourceAccessRepository.find({
      relations: ['resource', 'resource.college', 'user'],
      order: { unlockedAt: 'DESC' }
    });
  }

  /**
   * Assign user role (admin only)
   */
  async assignUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: UserRole
  ): Promise<User> {
    await this.verifyAdminAccess(adminUserId);

    const targetUser = await this.userRepository.findOne({ 
      where: { id: targetUserId },
      relations: ['college']
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Validate role assignment rules
    if (newRole === UserRole.COLLEGE_USER && !targetUser.collegeId) {
      throw new BadRequestException('Cannot assign college user role to user without college email');
    }

    if (newRole === UserRole.MODERATOR && !targetUser.collegeId) {
      throw new BadRequestException('Cannot assign moderator role to user without college email');
    }

    // Prevent admins from demoting themselves
    if (targetUserId === adminUserId && newRole !== UserRole.ADMIN) {
      throw new BadRequestException('Cannot change your own admin role');
    }

    targetUser.role = newRole;
    return await this.userRepository.save(targetUser);
  }

  /**
   * Get all users with filtering and pagination (admin only)
   */
  async getAllUsers(
    adminUserId: string,
    options: {
      page?: number;
      limit?: number;
      role?: UserRole;
      collegeId?: string;
      search?: string;
    } = {}
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    await this.verifyAdminAccess(adminUserId);

    const { page = 1, limit = 50, role, collegeId, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.college', 'college')
      .leftJoinAndSelect('user.profile', 'profile');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (collegeId) {
      queryBuilder.andWhere('user.collegeId = :collegeId', { collegeId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.displayName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve a college email domain (admin only)
   */
  async approveDomain(
    adminUserId: string,
    domainData: {
      domain: string;
      collegeId: string;
    }
  ): Promise<College> {
    await this.verifyAdminAccess(adminUserId);

    // Validate email domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domainData.domain)) {
      throw new BadRequestException('Invalid email domain format');
    }

    // Check if domain is already approved for another college
    const existingCollege = await this.collegeRepository.findOne({
      where: { emailDomain: domainData.domain }
    });

    if (existingCollege && existingCollege.id !== domainData.collegeId) {
      throw new BadRequestException('Domain already approved for another college');
    }

    // Find the college to approve domain for
    const college = await this.collegeRepository.findOne({ 
      where: { id: domainData.collegeId } 
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Update college with approved domain
    college.emailDomain = domainData.domain;
    return await this.collegeRepository.save(college);
  }

  /**
   * Revoke approval for a college email domain (admin only)
   */
  async revokeDomainApproval(
    adminUserId: string,
    collegeId: string
  ): Promise<College> {
    await this.verifyAdminAccess(adminUserId);

    const college = await this.collegeRepository.findOne({ 
      where: { id: collegeId } 
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Check if college has users - cannot revoke if users exist
    const userCount = await this.userRepository.count({ 
      where: { collegeId } 
    });

    if (userCount > 0) {
      throw new BadRequestException('Cannot revoke domain approval for college with existing users');
    }

    // Clear the email domain
    college.emailDomain = '';
    return await this.collegeRepository.save(college);
  }

  /**
   * Get all approved domains (admin only)
   */
  async getApprovedDomains(adminUserId: string): Promise<{
    domain: string;
    college: {
      id: string;
      name: string;
    };
    approvedAt: Date;
    userCount: number;
  }[]> {
    await this.verifyAdminAccess(adminUserId);

    const colleges = await this.collegeRepository.find({
      where: { emailDomain: Not('') },
      order: { emailDomain: 'ASC' }
    });

    const domainInfo = await Promise.all(
      colleges.map(async (college) => {
        const userCount = await this.userRepository.count({ 
          where: { collegeId: college.id } 
        });

        return {
          domain: college.emailDomain,
          college: {
            id: college.id,
            name: college.name,
          },
          approvedAt: college.createdAt,
          userCount,
        };
      })
    );

    return domainInfo;
  }

  /**
   * Check if a domain is approved for college registration
   */
  async isDomainApproved(domain: string): Promise<{
    approved: boolean;
    college?: {
      id: string;
      name: string;
    };
  }> {
    const college = await this.collegeRepository.findOne({
      where: { emailDomain: domain }
    });

    if (!college || !college.emailDomain) {
      return { approved: false };
    }

    return {
      approved: true,
      college: {
        id: college.id,
        name: college.name,
      },
    };
  }

  /**
   * Assign moderator role to a user (admin only)
   */
  async assignModeratorRole(
    adminUserId: string,
    targetUserId: string,
    collegeId: string
  ): Promise<{ user: User; moderator: Moderator }> {
    await this.verifyAdminAccess(adminUserId);

    // Prevent admins from assigning role to themselves
    if (targetUserId === adminUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    // Find target user
    const targetUser = await this.userRepository.findOne({ 
      where: { id: targetUserId },
      relations: ['college']
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Verify college exists
    const college = await this.collegeRepository.findOne({ 
      where: { id: collegeId } 
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Check if user is already a moderator
    const existingModerator = await this.moderatorRepository.findOne({
      where: { userId: targetUserId }
    });

    if (existingModerator) {
      throw new BadRequestException('User is already a moderator');
    }

    // Update user role and college
    targetUser.role = UserRole.MODERATOR;
    targetUser.collegeId = collegeId;
    const updatedUser = await this.userRepository.save(targetUser);

    // Create moderator record
    const moderator = this.moderatorRepository.create({
      userId: targetUserId,
      collegeId: collegeId,
      assignedBy: adminUserId,
    });
    const savedModerator = await this.moderatorRepository.save(moderator);

    return {
      user: updatedUser,
      moderator: savedModerator,
    };
  }

  /**
   * Revoke moderator role from a user (admin only)
   */
  async revokeModeratorRole(
    adminUserId: string,
    targetUserId: string
  ): Promise<User> {
    await this.verifyAdminAccess(adminUserId);

    // Prevent admins from revoking their own role
    if (targetUserId === adminUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    // Find target user
    const targetUser = await this.userRepository.findOne({ 
      where: { id: targetUserId },
      relations: ['college']
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Verify user is currently a moderator
    if (targetUser.role !== UserRole.MODERATOR) {
      throw new BadRequestException('User is not currently a moderator');
    }

    // Find and remove moderator record
    const moderator = await this.moderatorRepository.findOne({
      where: { userId: targetUserId }
    });

    if (!moderator) {
      throw new NotFoundException('Moderator record not found');
    }

    // Remove moderator record
    await this.moderatorRepository.remove(moderator);

    // Update user role (keep college association but change role to college user)
    targetUser.role = targetUser.collegeId ? UserRole.COLLEGE_USER : UserRole.GENERAL_USER;
    return await this.userRepository.save(targetUser);
  }

  /**
   * Get all moderators with their college information (admin only)
   */
  async getAllModerators(adminUserId: string): Promise<{
    id: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      email: string;
    };
    college: {
      id: string;
      name: string;
      emailDomain: string;
    };
    assignedAt: Date;
  }[]> {
    await this.verifyAdminAccess(adminUserId);

    const moderators = await this.moderatorRepository.find({
      relations: ['user', 'college'],
      order: { assignedAt: 'DESC' }
    });

    return moderators.map(moderator => ({
      id: moderator.id,
      user: {
        id: moderator.user.id,
        username: moderator.user.username,
        displayName: moderator.user.displayName,
        email: moderator.user.email,
      },
      college: {
        id: moderator.college.id,
        name: moderator.college.name,
        emailDomain: moderator.college.emailDomain,
      },
      assignedAt: moderator.assignedAt,
    }));
  }

  /**
   * Check if user has admin access
   */
  async hasAdminAccess(userId: string): Promise<boolean> {
    try {
      await this.verifyAdminAccess(userId);
      return true;
    } catch {
      return false;
    }
  }

  // Platform-wide Content Moderation Methods

  /**
   * Get all posts across all panels with filtering (admin only)
   */
  async getAllPostsForModeration(
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
    await this.verifyAdminAccess(adminUserId);
    return this.postService.adminGetAllPosts(adminUserId, options);
  }

  /**
   * Delete post from any panel (admin only)
   */
  async deletePost(adminUserId: string, postId: string) {
    await this.verifyAdminAccess(adminUserId);
    return this.postService.adminDeletePost(adminUserId, postId);
  }

  /**
   * Flag/unflag post from any panel (admin only)
   */
  async flagPost(adminUserId: string, postId: string, reason?: string) {
    await this.verifyAdminAccess(adminUserId);
    return this.postService.adminFlagPost(adminUserId, postId, reason);
  }

  /**
   * Hide/unhide post from any panel (admin only)
   */
  async hidePost(adminUserId: string, postId: string) {
    await this.verifyAdminAccess(adminUserId);
    return this.postService.adminHidePost(adminUserId, postId);
  }

  /**
   * Get all resources across all colleges with filtering (admin only)
   */
  async getAllResourcesForModeration(
    adminUserId: string,
    options: {
      page?: number;
      limit?: number;
      collegeId?: string;
      resourceType?: ResourceType;
      department?: string;
      batch?: string;
      search?: string;
    } = {}
  ) {
    await this.verifyAdminAccess(adminUserId);
    return this.resourceService.adminGetAllResources(adminUserId, options);
  }

  /**
   * Delete resource from any college (admin only)
   */
  async deleteResource(adminUserId: string, resourceId: string) {
    await this.verifyAdminAccess(adminUserId);
    return this.resourceService.adminDeleteResource(adminUserId, resourceId);
  }
}
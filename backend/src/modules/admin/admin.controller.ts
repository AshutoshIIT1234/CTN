import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ResourceType } from '../../entities/resource.entity';
import { AdminService, AdminStats, CollegeManagement, PaymentRecord } from './admin.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get platform statistics
   * GET /admin/stats
   */
  @Get('stats')
  async getPlatformStats(@Request() req: any): Promise<AdminStats> {
    return this.adminService.getPlatformStats(req.user.sub);
  }

  /**
   * Get all colleges with management information
   * GET /admin/colleges
   */
  @Get('colleges')
  async getAllColleges(@Request() req: any): Promise<CollegeManagement[]> {
    return this.adminService.getAllCollegesWithStats(req.user.sub);
  }

  /**
   * Create a new college
   * POST /admin/colleges
   */
  @Post('colleges')
  async createCollege(
    @Body() createCollegeDto: CreateCollegeDto,
    @Request() req: any,
  ) {
    const college = await this.adminService.createCollege(req.user.sub, createCollegeDto);
    return { college };
  }

  /**
   * Update college information
   * PUT /admin/colleges/:id
   */
  @Put('colleges/:id')
  async updateCollege(
    @Param('id') collegeId: string,
    @Body() updateCollegeDto: UpdateCollegeDto,
    @Request() req: any,
  ) {
    const college = await this.adminService.updateCollege(req.user.sub, collegeId, updateCollegeDto);
    return { college };
  }

  /**
   * Delete a college
   * DELETE /admin/colleges/:id
   */
  @Delete('colleges/:id')
  async deleteCollege(
    @Param('id') collegeId: string,
    @Request() req: any,
  ) {
    await this.adminService.deleteCollege(req.user.sub, collegeId);
    return { message: 'College deleted successfully' };
  }

  /**
   * Get all payment records
   * GET /admin/payments
   */
  @Get('payments')
  async getAllPaymentRecords(@Request() req: any): Promise<{ payments: PaymentRecord[] }> {
    const payments = await this.adminService.getAllPaymentRecords(req.user.sub);
    return { payments };
  }

  /**
   * Get all unlock records
   * GET /admin/unlocks
   */
  @Get('unlocks')
  async getAllUnlockRecords(@Request() req: any) {
    const unlocks = await this.adminService.getAllUnlockRecords(req.user.sub);
    return { unlocks };
  }

  /**
   * Get all users with filtering and pagination
   * GET /admin/users
   */
  @Get('users')
  async getAllUsers(
    @Query() query: GetUsersQueryDto,
    @Request() req: any,
  ) {
    return this.adminService.getAllUsers(req.user.sub, query);
  }

  /**
   * Assign role to user
   * PUT /admin/users/:id/role
   */
  @Put('users/:id/role')
  async assignUserRole(
    @Param('id') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: any,
  ) {
    const user = await this.adminService.assignUserRole(req.user.sub, userId, assignRoleDto.role);
    return { user };
  }

  /**
   * Check admin access
   * GET /admin/check-access
   */
  @Get('check-access')
  async checkAdminAccess(@Request() req: any) {
    const hasAccess = await this.adminService.hasAdminAccess(req.user.sub);
    return { hasAccess };
  }

  /**
   * Approve a college email domain
   * POST /admin/domains/approve
   */
  @Post('domains/approve')
  async approveDomain(
    @Request() req: any,
    @Body() domainData: { domain: string; collegeId: string }
  ) {
    return this.adminService.approveDomain(req.user.sub, domainData);
  }

  /**
   * Revoke domain approval for a college
   * DELETE /admin/domains/:collegeId/revoke
   */
  @Delete('domains/:collegeId/revoke')
  async revokeDomainApproval(
    @Request() req: any,
    @Param('collegeId') collegeId: string
  ) {
    return this.adminService.revokeDomainApproval(req.user.sub, collegeId);
  }

  /**
   * Get all approved domains
   * GET /admin/domains
   */
  @Get('domains')
  async getApprovedDomains(@Request() req: any) {
    return this.adminService.getApprovedDomains(req.user.sub);
  }

  /**
   * Check if a domain is approved (public endpoint)
   * GET /admin/domains/check/:domain
   */
  @Get('domains/check/:domain')
  @UseGuards()
  async checkDomainApproval(@Param('domain') domain: string) {
    return this.adminService.isDomainApproved(domain);
  }

  /**
   * Assign moderator role to a user
   * POST /admin/moderators
   */
  @Post('moderators')
  async assignModeratorRole(
    @Request() req: any,
    @Body() assignData: { userId: string; collegeId: string }
  ) {
    const result = await this.adminService.assignModeratorRole(
      req.user.sub,
      assignData.userId,
      assignData.collegeId
    );
    return {
      message: 'Moderator role assigned successfully',
      user: result.user,
      moderator: result.moderator,
    };
  }

  /**
   * Revoke moderator role from a user
   * DELETE /admin/moderators/:userId
   */
  @Delete('moderators/:userId')
  async revokeModeratorRole(
    @Request() req: any,
    @Param('userId') userId: string
  ) {
    const user = await this.adminService.revokeModeratorRole(req.user.sub, userId);
    return {
      message: 'Moderator role revoked successfully',
      user,
    };
  }

  /**
   * Get all moderators
   * GET /admin/moderators
   */
  @Get('moderators')
  async getAllModerators(@Request() req: any) {
    const moderators = await this.adminService.getAllModerators(req.user.sub);
    return { moderators };
  }

  /**
   * Get all posts for moderation
   * GET /admin/moderation/posts
   */
  @Get('moderation/posts')
  async getAllPostsForModeration(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('panelType') panelType?: 'NATIONAL' | 'COLLEGE',
    @Query('collegeId') collegeId?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('includeHidden') includeHidden?: string,
    @Query('search') search?: string,
  ) {
    const includeDeletedBool = includeDeleted === 'true';
    const includeHiddenBool = includeHidden === 'true';

    return this.adminService.getAllPostsForModeration(req.user.sub, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      panelType,
      collegeId,
      includeDeleted: includeDeletedBool,
      includeHidden: includeHiddenBool,
      search,
    });
  }

  /**
   * Delete a post
   * DELETE /admin/moderation/posts/:postId
   */
  @Delete('moderation/posts/:postId')
  async deletePost(@Request() req: any, @Param('postId') postId: string) {
    return this.adminService.deletePost(req.user.sub, postId);
  }

  /**
   * Flag/unflag a post
   * PUT /admin/moderation/posts/:postId/flag
   */
  @Put('moderation/posts/:postId/flag')
  async flagPost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.flagPost(req.user.sub, postId, reason);
  }

  /**
   * Hide/unhide a post
   * PUT /admin/moderation/posts/:postId/hide
   */
  @Put('moderation/posts/:postId/hide')
  async hidePost(@Request() req: any, @Param('postId') postId: string) {
    return this.adminService.hidePost(req.user.sub, postId);
  }

  /**
   * Get all resources for moderation
   * GET /admin/moderation/resources
   */
  @Get('moderation/resources')
  async getAllResourcesForModeration(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('collegeId') collegeId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('department') department?: string,
    @Query('batch') batch?: string,
    @Query('search') search?: string,
  ) {
    let resourceTypeEnum: ResourceType | undefined;
    if (resourceType && Object.values(ResourceType).includes(resourceType as ResourceType)) {
      resourceTypeEnum = resourceType as ResourceType;
    }

    return this.adminService.getAllResourcesForModeration(req.user.sub, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      collegeId,
      resourceType: resourceTypeEnum,
      department,
      batch,
      search,
    });
  }

  /**
   * Delete a resource
   * DELETE /admin/moderation/resources/:resourceId
   */
  @Delete('moderation/resources/:resourceId')
  async deleteResource(@Request() req: any, @Param('resourceId') resourceId: string) {
    return this.adminService.deleteResource(req.user.sub, resourceId);
  }
}

import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService, ProfileUpdateData } from './user.service';
import { UploadService } from '../upload/upload.service';
import { isUUID } from 'class-validator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) { }

  @Get(':userId/profile')
  async getUserProfile(
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const requestingUserId = req.user?.sub || req.user?.id;
    const profile = await this.userService.getUserProfile(userId, requestingUserId);
    return profile;
  }

  @Put(':userId/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateData: ProfileUpdateData,
    @Request() req: any
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    // Only allow users to update their own profile
    if (req.user.sub !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const profile = await this.userService.updateUserProfile(userId, updateData);
    return profile;
  }

  @Post(':userId/profile-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    // Only allow users to upload their own profile photo
    if (req.user.sub !== userId) {
      throw new ForbiddenException('You can only update your own profile photo');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to Cloudinary
    const profilePhotoUrl = await this.uploadService.uploadImage(file);

    // Update user profile
    await this.userService.updateUserProfile(userId, {
      profilePictureUrl: profilePhotoUrl,
    });

    return { url: profilePhotoUrl };
  }

  @Post(':userId/cover-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverPhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    // Only allow users to upload their own cover photo
    if (req.user.sub !== userId) {
      throw new ForbiddenException('You can only update your own cover photo');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to Cloudinary
    const coverPhotoUrl = await this.uploadService.uploadImage(file);

    // Update user profile
    await this.userService.uploadCoverPhoto(userId, coverPhotoUrl);

    return { url: coverPhotoUrl };
  }

  @Get(':userId/stats')
  async getProfileStats(@Param('userId') userId: string) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const stats = await this.userService.getProfileStats(userId);
    return stats;
  }

  @Get('suggested')
  async getSuggestedUsers() {
    const users = await this.userService.getSuggestedUsers();
    return { users };
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: string
  ) {
    if (!query || query.trim().length < 2) {
      return { users: [] };
    }

    const searchLimit = limit ? parseInt(limit, 10) : 50;
    if (searchLimit > 50) {
      throw new BadRequestException('Limit cannot exceed 50');
    }

    const users = await this.userService.searchUsers(query, searchLimit);
    return { users };
  }

  @Get('settings/notifications')
  @UseGuards(JwtAuthGuard)
  async getNotificationSettings(@Request() req: any) {
    return await this.userService.getNotificationSettings(req.user.sub);
  }

  @Put('settings/notifications')
  @UseGuards(JwtAuthGuard)
  async updateNotificationSettings(
    @Request() req: any,
    @Body() settings: any
  ) {
    return await this.userService.updateNotificationSettings(req.user.sub, settings);
  }

  @Get('settings/privacy')
  @UseGuards(JwtAuthGuard)
  async getPrivacySettings(@Request() req: any) {
    return await this.userService.getPrivacySettings(req.user.sub);
  }

  @Put('settings/privacy')
  @UseGuards(JwtAuthGuard)
  async updatePrivacySettings(
    @Request() req: any,
    @Body() settings: any
  ) {
    return await this.userService.updatePrivacySettings(req.user.sub, settings);
  }

  @Get('settings/appearance')
  @UseGuards(JwtAuthGuard)
  async getAppearanceSettings(@Request() req: any) {
    return await this.userService.getAppearanceSettings(req.user.sub);
  }

  @Put('settings/appearance')
  @UseGuards(JwtAuthGuard)
  async updateAppearanceSettings(
    @Request() req: any,
    @Body() settings: any
  ) {
    return await this.userService.updateAppearanceSettings(req.user.sub, settings);
  }
}

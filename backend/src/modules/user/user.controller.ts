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
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService, ProfileUpdateData } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    const profile = await this.userService.getUserProfile(userId, req.user.id);
    return profile;
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateData: ProfileUpdateData,
    @Request() req: any
  ) {
    const profile = await this.userService.updateUserProfile(req.user.id, updateData);
    return profile;
  }

  @Post('profile/picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async uploadProfilePicture(
    @UploadedFile() file: any,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const profilePictureUrl = await this.userService.uploadProfilePicture(
      req.user.id,
      file.buffer,
      file.originalname
    );

    return { profilePictureUrl };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
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

  @Get('stats/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('userId') userId: string) {
    const stats = await this.userService.getUserStats(userId);
    return stats;
  }
}
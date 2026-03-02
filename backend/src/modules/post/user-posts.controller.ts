import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { isUUID } from 'class-validator';

@Controller('users/:userId')
export class UserPostsController {
  constructor(private postService: PostService) { }

  @Get('posts')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const currentUserId = req.user?.sub;
    return await this.postService.getUserPosts(
      userId,
      parseInt(page),
      20,
      currentUserId,
    );
  }

  @Get('media')
  async getUserMediaPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const currentUserId = req.user?.sub;
    return await this.postService.getUserMediaPosts(
      userId,
      parseInt(page),
      20,
      currentUserId,
    );
  }

  @Get('replies')
  async getUserReplies(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const currentUserId = req.user?.sub;
    return await this.postService.getUserReplies(
      userId,
      parseInt(page),
      20,
      currentUserId,
    );
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  async getSavedPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    // Only allow users to see their own saved posts
    if (req.user.sub !== userId) {
      return { posts: [], page: 1, hasMore: false };
    }

    return await this.postService.getSavedPosts(userId, parseInt(page), 20);
  }

  @Get('tagged')
  async getTaggedPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const currentUserId = req.user?.sub;
    return await this.postService.getTaggedPosts(
      userId,
      parseInt(page),
      20,
      currentUserId,
    );
  }
}

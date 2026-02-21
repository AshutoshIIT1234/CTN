import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/:userId')
export class UserPostsController {
  constructor(private postService: PostService) {}

  @Get('posts')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Request() req,
  ) {
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
    // Only allow users to see their own saved posts
    if (req.user.sub !== userId) {
      return { posts: [], page: 1, hasMore: false };
    }

    return await this.postService.getSavedPosts(userId, parseInt(page), 20);
  }
}

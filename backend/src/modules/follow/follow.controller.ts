import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowService } from './follow.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':userId')
  async followUser(@Request() req, @Param('userId') userId: string) {
    await this.followService.followUser(req.user.userId, userId);
    
    const [followersCount, followingCount] = await Promise.all([
      this.followService.getFollowerCount(userId),
      this.followService.getFollowingCount(req.user.userId),
    ]);

    return {
      message: 'Successfully followed user',
      followersCount,
      followingCount,
    };
  }

  @Delete(':userId')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    await this.followService.unfollowUser(req.user.userId, userId);
    
    const [followersCount, followingCount] = await Promise.all([
      this.followService.getFollowerCount(userId),
      this.followService.getFollowingCount(req.user.userId),
    ]);

    return {
      message: 'Successfully unfollowed user',
      followersCount,
      followingCount,
    };
  }

  @Get('status/:userId')
  async getFollowStatus(@Request() req, @Param('userId') userId: string) {
    const isFollowing = await this.followService.getFollowStatus(
      req.user.userId,
      userId,
    );

    return { isFollowing };
  }
}

@Controller('users/:userId')
export class UserFollowController {
  constructor(private readonly followService: FollowService) {}

  @Get('followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
  ) {
    const followers = await this.followService.getFollowers(userId, page);
    const count = await this.followService.getFollowerCount(userId);

    return {
      followers: followers.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
      })),
      count,
      page,
    };
  }

  @Get('following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
  ) {
    const following = await this.followService.getFollowing(userId, page);
    const count = await this.followService.getFollowingCount(userId);

    return {
      following: following.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
      })),
      count,
      page,
    };
  }
}

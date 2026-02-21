import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowController, UserFollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { Follower } from '../../entities/follower.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follower, UserProfile, User]),
    NotificationModule,
  ],
  controllers: [FollowController, UserFollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}

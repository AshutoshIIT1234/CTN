import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserPostsController } from './user-posts.controller';
import { Post, PostSchema } from '@/schemas/post.schema';
import { Comment, CommentSchema } from '@/schemas/comment.schema';
import { Like, LikeSchema } from '@/schemas/like.schema';
import { Report, ReportSchema } from '@/schemas/report.schema';
import { SavedPost, SavedPostSchema } from '@/schemas/saved-post.schema';
import { User } from '@/entities/user.entity';
import { UserProfile } from '@/entities/user-profile.entity';
import { College } from '@/entities/college.entity';
import { Moderator } from '@/entities/moderator.entity';
import { RedisService } from '../../services/redis.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Report.name, schema: ReportSchema },
      { name: SavedPost.name, schema: SavedPostSchema },
    ]),
    TypeOrmModule.forFeature([User, UserProfile, College, Moderator]),
    NotificationModule,
  ],
  controllers: [PostController, UserPostsController],
  providers: [PostService, RedisService],
  exports: [PostService],
})
export class PostModule { }

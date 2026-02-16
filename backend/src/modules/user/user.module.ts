import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { College } from '../../entities/college.entity';
import { RedisService } from '../../services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, College])
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService]
})
export class UserModule {}
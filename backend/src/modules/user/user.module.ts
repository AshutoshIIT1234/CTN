import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { UserSettings } from '../../entities/user-settings.entity';
import { College } from '../../entities/college.entity';
import { RedisService } from '../../services/redis.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserSettings, College]),
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService]
})
export class UserModule {}
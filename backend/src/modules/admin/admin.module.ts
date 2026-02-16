import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { College } from '../../entities/college.entity';
import { Moderator } from '../../entities/moderator.entity';
import { Resource } from '../../entities/resource.entity';
import { ResourceAccess } from '../../entities/resource-access.entity';
import { PaymentSession } from '../../entities/payment-session.entity';
import { PostModule } from '../post/post.module';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      College,
      Moderator,
      Resource,
      ResourceAccess,
      PaymentSession,
    ]),
    PostModule,
    ResourceModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
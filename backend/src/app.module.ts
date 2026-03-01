import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { CollegeModule } from './modules/college/college.module';
import { PostModule } from './modules/post/post.module';
import { ResourceModule } from './modules/resource/resource.module';
import { ModeratorModule } from './modules/moderator/moderator.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { MessageModule } from './modules/message/message.module';
import { EmailModule } from './modules/email/email.module';
import { UploadModule } from './modules/upload/upload.module';
import { FollowModule } from './modules/follow/follow.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SocketModule } from './modules/socket/socket.module';

// Import all entities explicitly
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { College } from './entities/college.entity';
import { Moderator } from './entities/moderator.entity';
import { Resource } from './entities/resource.entity';
import { ResourceAccess } from './entities/resource-access.entity';
import { PaymentSession } from './entities/payment-session.entity';
import { Follower } from './entities/follower.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', 'backend/.env'],
    }),

    // PostgreSQL Connection (Neon DB)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [
          User,
          UserProfile,
          College,
          Moderator,
          Resource,
          ResourceAccess,
          PaymentSession,
          Follower,
        ],
        synchronize: process.env.NODE_ENV === 'development', // Only in development
        logging: process.env.NODE_ENV === 'development',
        ssl: {
          rejectUnauthorized: false, // Required for Neon DB
        },
      }),
      inject: [ConfigService],
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    CollegeModule,
    PostModule,
    ResourceModule,
    ModeratorModule,
    AdminModule,
    UserModule,
    MessageModule,
    EmailModule,
    UploadModule,
    FollowModule,
    NotificationModule,
    SocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

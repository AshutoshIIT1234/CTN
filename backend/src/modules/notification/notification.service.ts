import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../../schemas/notification.schema';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorUsername: string;
  postId?: string;
  message: string;
}

import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private socketGateway: SocketGateway,
  ) { }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: data.userId,
      type: data.type,
      actorId: data.actorId,
      actorName: data.actorName,
      actorUsername: data.actorUsername,
      postId: data.postId ? new Types.ObjectId(data.postId) : undefined,
      message: data.message,
      read: false,
    });

    const savedNotification = await notification.save();

    // Emit real-time notification
    this.socketGateway.sendNotification(data.userId, {
      id: savedNotification._id.toString(),
      ...data,
      read: false,
      createdAt: new Date(),
    });

    return savedNotification;
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    notifications: any[];
    page: number;
    hasMore: boolean;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId, read: false }),
    ]);

    const formattedNotifications = notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      actorId: notification.actorId,
      actorName: notification.actorName,
      actorUsername: notification.actorUsername,
      postId: notification.postId?.toString(),
      message: notification.message,
      read: notification.read,
      createdAt: (notification as any).createdAt,
    }));

    return {
      notifications: formattedNotifications,
      page,
      hasMore: notifications.length === limit,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!Types.ObjectId.isValid(notificationId)) {
      return;
    }

    await this.notificationModel.updateOne(
      { _id: new Types.ObjectId(notificationId) },
      { $set: { read: true } },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true } },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({
      userId,
      read: false,
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(notificationId)) {
      return;
    }

    await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      userId,
    });
  }
}

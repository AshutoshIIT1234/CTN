import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  MESSAGE = 'message',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  actorId: string;

  @Prop()
  actorName: string;

  @Prop()
  actorUsername: string;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId?: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false, index: true })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

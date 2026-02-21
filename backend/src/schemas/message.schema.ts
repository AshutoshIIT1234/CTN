import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId

  @Prop({ required: true })
  content: string

  @Prop({ default: false })
  isRead: boolean

  @Prop({ type: Date })
  readAt?: Date

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)

// Indexes for efficient queries
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 })
MessageSchema.index({ receiverId: 1, isRead: 1 })

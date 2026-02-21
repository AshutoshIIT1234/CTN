import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId

  @Prop()
  lastMessageContent?: string

  @Prop({ type: Date })
  lastMessageAt?: Date

  @Prop({ type: Map, of: Number, default: {} })
  unreadCount: Map<string, number>

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)

// Ensure participants array is always sorted for consistent queries
ConversationSchema.index({ participants: 1 }, { unique: true })

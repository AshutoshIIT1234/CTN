import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedPostDocument = SavedPost & Document;

@Schema({ timestamps: true })
export class SavedPost {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Post', index: true })
  postId: Types.ObjectId;
}

export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);

// Compound index for efficient queries
SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
SavedPostSchema.index({ userId: 1, createdAt: -1 });

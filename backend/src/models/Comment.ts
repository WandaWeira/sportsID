import mongoose, { Schema, Document } from 'mongoose';
import { Comment as IComment } from '@/types';

export interface CommentDocument extends Omit<IComment, 'id'>, Document {}

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 500 }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1 });

export const Comment = mongoose.model<CommentDocument>('Comment', CommentSchema);

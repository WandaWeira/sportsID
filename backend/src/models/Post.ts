import mongoose, { Schema, Document } from 'mongoose';
import { Post as IPost, MediaFile } from '@/types';

export interface PostDocument extends Omit<IPost, 'id'>, Document {}

const MediaFileSchema = new Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  thumbnail: String,
  filename: { type: String, required: true },
  size: { type: Number, required: true }
});

const PostSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  media: [MediaFileSchema],
  tags: [{ type: String, trim: true }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  shares: { type: Number, default: 0 }
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
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<PostDocument>('Post', PostSchema);

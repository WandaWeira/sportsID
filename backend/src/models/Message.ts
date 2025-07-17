import mongoose, { Schema, Document } from 'mongoose';
import { Message as IMessage } from '@/types';

export interface MessageDocument extends Omit<IMessage, 'id'>, Document {}

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  read: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date }
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
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

export const Message = mongoose.model<MessageDocument>('Message', MessageSchema);

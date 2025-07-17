import mongoose, { Schema, Document } from 'mongoose';
import { Notification as INotification } from '@/types';

export interface NotificationDocument extends Omit<INotification, 'id'>, Document {}

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'message', 'scout_report', 'club_invitation'], 
    required: true 
  },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 300 },
  read: { type: Boolean, default: false },
  relatedEntityId: { type: Schema.Types.ObjectId }
}, {
  timestamps: { createdAt: true, updatedAt: false },
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
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  clubId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  requestDate: Date;
  processedDate?: Date;
  processedBy?: mongoose.Types.ObjectId;
}

const JoinRequestSchema = new Schema({
  clubId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: { 
    type: String, 
    trim: true 
  },
  requestDate: { 
    type: Date, 
    default: Date.now 
  },
  processedDate: { 
    type: Date 
  },
  processedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
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

// Indexes for better performance
JoinRequestSchema.index({ clubId: 1, status: 1 });
JoinRequestSchema.index({ userId: 1 });
JoinRequestSchema.index({ clubId: 1, userId: 1 }, { unique: true });

export const JoinRequest = mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  clubId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  type: 'match' | 'training' | 'meeting' | 'tournament' | 'trial';
  description: string;
  location?: string;
  participants: mongoose.Types.ObjectId[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema({
  clubId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  type: {
    type: String,
    enum: ['match', 'training', 'meeting', 'tournament', 'trial'],
    required: true
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
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
EventSchema.index({ clubId: 1, date: 1 });
EventSchema.index({ clubId: 1, status: 1 });
EventSchema.index({ type: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);

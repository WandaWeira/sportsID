import mongoose, { Schema, Document } from 'mongoose';
import { ScoutReport as IScoutReport } from '@/types';

export interface ScoutReportDocument extends Omit<IScoutReport, 'id'>, Document {}

const ScoutReportSchema = new Schema({
  scoutId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String, required: true, maxlength: 2000 },
  recommendation: { 
    type: String, 
    enum: ['Highly Recommend', 'Recommend', 'Consider', 'Pass'], 
    required: true 
  },
  strengths: [{ type: String, maxlength: 200 }],
  weaknesses: [{ type: String, maxlength: 200 }],
  potentialFee: { type: Number, min: 0 }
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
ScoutReportSchema.index({ scoutId: 1, createdAt: -1 });
ScoutReportSchema.index({ playerId: 1 });
ScoutReportSchema.index({ recommendation: 1 });

export const ScoutReport = mongoose.model<ScoutReportDocument>('ScoutReport', ScoutReportSchema);

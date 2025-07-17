import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, PlayerData, ScoutData, CoachData, ClubData } from '@/types';

export interface UserDocument extends Omit<IUser, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PlayerDataSchema = new Schema({
  sport: { type: String, required: true },
  position: { type: String, required: true },
  age: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Free Agent', 'Signed', 'Looking to be Scouted'], 
    default: 'Free Agent' 
  },
  clubId: { type: Schema.Types.ObjectId, ref: 'User' },
  clubName: String,
  stats: {
    matches: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 }
  }
});

const ScoutDataSchema = new Schema({
  clubId: { type: Schema.Types.ObjectId, ref: 'User' },
  clubName: String,
  shortlistedPlayers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  reports: [{ type: Schema.Types.ObjectId, ref: 'ScoutReport' }]
});

const CoachAchievementSchema = new Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  description: String,
  level: { 
    type: String, 
    enum: ['Club', 'Regional', 'National', 'International'], 
    required: true 
  }
});

const CoachDataSchema = new Schema({
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  certifications: [String],
  clubId: { type: Schema.Types.ObjectId, ref: 'User' },
  clubName: String,
  playersCoached: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  achievements: [CoachAchievementSchema]
});

const AchievementSchema = new Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  description: String
});

const ClubDataSchema = new Schema({
  name: { type: String, required: true },
  logo: String,
  location: { type: String, required: true },
  foundedYear: { type: Number, required: true },
  description: String,
  verified: { type: Boolean, default: false },
  website: String,
  tier: { 
    type: String, 
    enum: ['Professional', 'Semi-Professional', 'Amateur', 'Youth'], 
    required: true 
  },
  league: String,
  coaches: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  scouts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  achievements: [AchievementSchema],
  facilities: [String]
});

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['player', 'scout', 'coach', 'club'], 
    required: true 
  },
  profileImage: String,
  isVerified: { type: Boolean, default: false },
  playerData: PlayerDataSchema,
  scoutData: ScoutDataSchema,
  coachData: CoachDataSchema,
  clubData: ClubDataSchema
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'playerData.sport': 1, 'playerData.position': 1 });
UserSchema.index({ 'clubData.location': 1 });

export const User = mongoose.model<UserDocument>('User', UserSchema);

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'player' | 'scout' | 'coach' | 'club';
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Role-specific data
  playerData?: PlayerData;
  scoutData?: ScoutData;
  coachData?: CoachData;
  clubData?: ClubData;
}

export interface PlayerData {
  sport: string;
  position: string;
  age: number;
  status: 'Free Agent' | 'Signed' | 'Looking to be Scouted';
  clubId?: string;
  clubName?: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  goals?: number;
  assists?: number;
  // Add more sport-specific stats
}

export interface ScoutData {
  clubId?: string;
  clubName?: string;
  shortlistedPlayers: string[];
  reports: string[]; // IDs of scout reports
}

export interface CoachData {
  specialization: string; // e.g., 'Goalkeeper', 'Fitness', 'Tactics', 'Youth Development'
  experience: number; // years of coaching experience
  certifications: string[];
  clubId?: string;
  clubName?: string;
  playersCoached: string[]; // array of player IDs
  achievements: CoachAchievement[];
}

export interface CoachAchievement {
  id: string;
  title: string;
  year: number;
  description: string;
  level: 'Club' | 'Regional' | 'National' | 'International';
}

export interface ClubData {
  name: string;
  logo?: string;
  location: string;
  foundedYear: number;
  description: string;
  verified: boolean;
  website?: string;
  tier: string; // e.g., 'Professional', 'Semi-Professional', 'Amateur', 'Youth'
  league?: string;
  coaches: string[]; // array of coach user IDs
  players: string[]; // array of player user IDs
  scouts: string[]; // array of scout user IDs
  achievements: Achievement[];
  facilities: string[]; // e.g., ['Stadium', 'Training Ground', 'Youth Academy']
}

export interface Achievement {
  id: string;
  title: string;
  year: number;
  description: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  media?: MediaFile[];
  tags: string[];
  likes: string[]; // array of user IDs who liked
  comments: string[]; // array of comment IDs
  shares: number; // number of times shared
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  edited?: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoutReport {
  id: string;
  scoutId: string;
  playerId: string;
  rating: number; // 1-10
  notes: string;
  recommendation: 'Highly Recommend' | 'Recommend' | 'Consider' | 'Pass';
  strengths: string[];
  weaknesses: string[];
  potentialFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message' | 'scout_report' | 'club_invitation';
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string; // ID of related post, message, etc.
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'player' | 'scout' | 'coach' | 'club';
}

export interface CreatePostRequest {
  content: string;
  tags?: string[];
  media?: MediaFile[];
}

export interface UpdateProfileRequest {
  name?: string;
  profileImage?: string;
  playerData?: Partial<PlayerData>;
  scoutData?: Partial<ScoutData>;
  coachData?: Partial<CoachData>;
  clubData?: Partial<ClubData>;
}

// Custom Express types
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

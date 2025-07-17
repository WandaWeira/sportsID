import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Define types for our API
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'scout' | 'coach' | 'club';
  profileImage?: string;
  isVerified: boolean;
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
  reports: ScoutReport[];
}

export interface ScoutReport {
  id: string;
  playerId: string;
  playerName: string;
  rating: number;
  notes: string;
  date: string;
  recommendation: 'Highly Recommend' | 'Recommend' | 'Consider' | 'Pass';
}

export interface ClubData {
  id?: string;
  name: string;
  location: string;
  foundedYear: number;
  description: string;
  verified: boolean;
  website?: string;
  tier: string;
  league?: string;
  coaches: string[];
  players: string[];
  scouts: string[];
  achievements: ClubAchievement[];
  facilities: string[];
}

export interface ClubAchievement {
  id: string;
  title: string;
  year: number;
  description: string;
  level: 'Club' | 'Regional' | 'National' | 'International';
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  media?: MediaFile[];
  tags: string[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  shares: number;
  createdAt: string;
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
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  edited?: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface Conversation {
  partner: {
    id: string;
    name: string;
    profileImage?: string;
    role: 'player' | 'scout' | 'coach' | 'club';
  };
  lastMessage: Message;
  unreadCount: number;
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

// Training Session Types
export interface TrainingSession {
  id: string;
  coachId: string;
  title: string;
  description: string;
  type: 'Tactical' | 'Technical' | 'Physical' | 'Mental' | 'Match Preparation';
  date: string;
  duration: number; // in minutes
  location: string;
  maxParticipants: number;
  participants: string[]; // player IDs
  objectives: string[];
  exercises: TrainingExercise[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingExercise {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  objectives: string[];
  equipment: string[];
  notes?: string;
}

export interface CreateTrainingSessionRequest {
  coachId: string;
  title: string;
  description: string;
  type: TrainingSession['type'];
  date: string;
  duration: number;
  location: string;
  maxParticipants: number;
  objectives: string[];
  exercises: Omit<TrainingExercise, 'id'>[];
}

export interface UpdateTrainingSessionRequest extends Partial<CreateTrainingSessionRequest> {
  id: string;
  status?: TrainingSession['status'];
  notes?: string;
}

// Player Assessment Types
export interface PlayerAssessment {
  id: string;
  coachId: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  sessionId?: string; // optional link to training session
  date: string;
  type: 'Training' | 'Match' | 'Fitness Test' | 'Individual Assessment';
  skills: SkillAssessment[];
  physicalMetrics: PhysicalMetrics;
  mentalAttributes: MentalAttributes;
  overallRating: number; // 1-10
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  notes: string;
  goals: PlayerGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillAssessment {
  skill: string;
  rating: number; // 1-10
  notes?: string;
}

export interface PhysicalMetrics {
  speed?: number;
  agility?: number;
  strength?: number;
  endurance?: number;
  flexibility?: number;
  coordination?: number;
}

export interface MentalAttributes {
  concentration?: number;
  confidence?: number;
  motivation?: number;
  coachability?: number;
  leadership?: number;
  teamwork?: number;
}

export interface PlayerGoal {
  id: string;
  description: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
  progress: number; // 0-100
}

export interface CreatePlayerAssessmentRequest {
  coachId: string;
  playerId: string;
  sessionId?: string;
  type: PlayerAssessment['type'];
  skills: Omit<SkillAssessment, 'id'>[];
  physicalMetrics: PhysicalMetrics;
  mentalAttributes: MentalAttributes;
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  notes: string;
  goals: Omit<PlayerGoal, 'id'>[];
}

export interface UpdatePlayerAssessmentRequest extends Partial<CreatePlayerAssessmentRequest> {
  id: string;
}

// Coach Statistics
export interface CoachStats {
  totalSessions: number;
  totalPlayers: number;
  averageRating: number;
  improvementRate: number;
  upcomingSessions: number;
  completedAssessments: number;
}

// Pagination and Search Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface SearchUsersParams {
  query?: string;
  role?: string;
  sport?: string;
  position?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
  verified?: boolean;
}

export interface SearchPostsParams {
  query?: string;
  author?: string;
  authorRole?: string;
  hasMedia?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'likes' | 'comments';
}

export interface SearchClubsParams {
  query?: string;
  location?: string;
  tier?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'name' | 'founded';
}

export interface SavedSearch {
  id: string;
  userId: string;
  type: 'users' | 'posts' | 'clubs';
  query: string;
  filters: Record<string, any>;
  name: string;
  createdAt: string;
}

export interface SaveSearchRequest {
  type: 'users' | 'posts' | 'clubs';
  query: string;
  filters: Record<string, any>;
  name: string;
}

export interface PopularContentResponse {
  trendingUsers: User[];
  popularPosts: Post[];
  topClubs: ClubData[];
  trendingTags: string[];
}

export interface ReportContentRequest {
  contentType: 'user' | 'post' | 'comment';
  contentId: string;
  reason: string;
  description?: string;
}

// Additional interfaces for club management
export interface ClubMember {
  id: string;
  name: string;
  role: 'player' | 'coach' | 'scout';
  position?: string;
  joinDate: string;
  profileImage?: string;
  isVerified: boolean;
  status?: 'active' | 'inactive' | 'pending';
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: 'match' | 'training' | 'meeting' | 'tournament' | 'trial';
  description: string;
  location?: string;
  participants?: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  totalPlayers: number;
  totalCoaches: number;
  totalScouts: number;
  upcomingEvents: number;
  matchesPlayed: number;
  trophiesWon: number;
  membershipRequests: number;
}

export interface CreateClubEventRequest {
  title: string;
  date: string;
  type: 'match' | 'training' | 'meeting' | 'tournament' | 'trial';
  description: string;
  location?: string;
  participants?: string[];
}

export interface UpdateClubDataRequest {
  name?: string;
  location?: string;
  description?: string;
  website?: string;
  tier?: string;
  league?: string;
  facilities?: string[];
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: 'player' | 'coach' | 'scout';
  profileImage?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
}

// Base API URL - would be from environment variables in production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Post', 'Message', 'Club', 'Player', 'Scout', 'Search', 'Coach', 'TrainingSession', 'PlayerAssessment'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { success: boolean; data: { user: User; token: string } }) => response.data,
    }),
    register: builder.mutation<{ user: User; token: string }, Partial<User> & { password: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: { success: boolean; data: { user: User; token: string } }) => response.data,
    }),
    verifyToken: builder.mutation<{ user: User }, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-token',
        method: 'POST',
        body: data,
      }),
    }),
    
    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<User> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      invalidatesTags: ['User'],
    }),
    deleteProfile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    searchUsers: builder.query<User[], { query: string; role?: string; location?: string }>({
      query: (params) => ({
        url: '/users',
        params: {
          ...params,
          limit: 50 // Reasonable limit for search results
        },
      }),
      transformResponse: (response: { success: boolean; data: User[] }) => response.data,
    }),
    searchUsersAdvanced: builder.query<PaginatedResponse<User>, SearchUsersParams>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
    searchPosts: builder.query<PaginatedResponse<Post>, SearchPostsParams>({
      query: (params) => ({
        url: '/posts/search',
        params,
      }),
      transformResponse: (response: { success: boolean; data: Post[]; pagination: PaginationInfo }) => ({
        data: response.data,
        pagination: response.pagination
      }),
      providesTags: ['Post'],
    }),
    searchClubs: builder.query<PaginatedResponse<ClubData>, SearchClubsParams>({
      query: (params) => ({
        url: '/clubs/search',
        params,
      }),
      providesTags: ['Club'],
    }),
    getPopularContent: builder.query<PopularContentResponse, void>({
      query: () => '/content/popular',
      providesTags: ['Post', 'User', 'Club'],
    }),
    getTrendingTags: builder.query<string[], void>({
      query: () => '/content/trending-tags',
      providesTags: ['Post'],
    }),
    saveSearch: builder.mutation<SavedSearch, SaveSearchRequest>({
      query: (searchData) => ({
        url: '/searches',
        method: 'POST',
        body: searchData,
      }),
      invalidatesTags: ['Search'],
    }),
    getSavedSearches: builder.query<SavedSearch[], void>({
      query: () => '/searches',
      providesTags: ['Search'],
    }),
    deleteSavedSearch: builder.mutation<void, string>({
      query: (searchId) => ({
        url: `/searches/${searchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Search'],
    }),
    followUser: builder.mutation<{ following: boolean; followersCount: number }, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    unfollowUser: builder.mutation<{ following: boolean; followersCount: number }, string>({
      query: (userId) => ({
        url: `/users/${userId}/unfollow`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getFollowers: builder.query<User[], string>({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: ['User'],
    }),
    getFollowing: builder.query<User[], string>({
      query: (userId) => `/users/${userId}/following`,
      providesTags: ['User'],
    }),
    getSuggestedUsers: builder.query<User[], { role?: string; location?: string; limit?: number }>({
      query: (params) => ({
        url: '/users/suggested',
        params,
      }),
      providesTags: ['User'],
    }),
    reportContent: builder.mutation<void, ReportContentRequest>({
      query: (reportData) => ({
        url: '/reports',
        method: 'POST',
        body: reportData,
      }),
    }),
    blockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/block`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    unblockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/unblock`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getBlockedUsers: builder.query<User[], void>({
      query: () => '/users/blocked',
      providesTags: ['User'],
    }),
    
    // Posts endpoints
    getPosts: builder.query<Post[], { page?: number; limit?: number; role?: string }>({
      query: (params) => ({
        url: '/posts',
        params,
      }),
      transformResponse: (response: { success: boolean; data: Post[] }) => response.data,
      providesTags: ['Post'],
    }),
    getPostsByUser: builder.query<Post[], { userId: string; page?: number; limit?: number }>({
      query: ({ userId, ...params }) => ({
        url: '/posts',
        params: { ...params, authorId: userId },
      }),
      transformResponse: (response: { success: boolean; data: Post[] }) => response.data,
      providesTags: ['Post'],
    }),
    getUserMedia: builder.query<(MediaFile & { postId: string; postContent: string; createdAt: string })[], { userId: string }>({
      query: ({ userId }) => ({
        url: '/posts',
        params: { authorId: userId },
      }),
      transformResponse: (response: { success: boolean; data: Post[] }) => {
        // Extract all media files from posts
        const mediaFiles: (MediaFile & { postId: string; postContent: string; createdAt: string })[] = [];
        response.data.forEach(post => {
          if (post.media && post.media.length > 0) {
            post.media.forEach(media => {
              mediaFiles.push({
                ...media,
                postId: post.id,
                postContent: post.content,
                createdAt: post.createdAt
              });
            });
          }
        });
        return mediaFiles;
      },
      providesTags: ['Post'],
    }),
    createPost: builder.mutation<Post, Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: ['Post'],
    }),
    likePost: builder.mutation<{ liked: boolean; likesCount: number }, string>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),
    sharePost: builder.mutation<{ sharesCount: number }, string>({
      query: (postId) => ({
        url: `/posts/${postId}/share`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),
    commentOnPost: builder.mutation<Comment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (response: { success: boolean; data: Comment }) => response.data,
      invalidatesTags: ['Post'],
    }),
    
    // Messages endpoints
    getConversations: builder.query<Conversation[], void>({
      query: () => '/messages',
      transformResponse: (response: { success: boolean; data: Conversation[] }) => response.data,
      providesTags: ['Message'],
    }),
    getMessages: builder.query<Message[], string>({
      query: (conversationId) => `/messages/${conversationId}`,
      transformResponse: (response: { success: boolean; data: Message[] }) => response.data,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation<Message, { receiverId: string; content: string }>({
      query: (message) => ({
        url: '/messages',
        method: 'POST',
        body: message,
      }),
      transformResponse: (response: { success: boolean; data: Message }) => response.data,
      invalidatesTags: ['Message'],
    }),
    updateMessage: builder.mutation<Message, { messageId: string; content: string }>({
      query: ({ messageId, content }) => ({
        url: `/messages/${messageId}`,
        method: 'PUT',
        body: { content },
      }),
      transformResponse: (response: { success: boolean; data: Message }) => response.data,
      invalidatesTags: ['Message'],
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
    markMessageAsRead: builder.mutation<Message, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response: { success: boolean; data: Message }) => response.data,
      invalidatesTags: ['Message'],
    }),
    markConversationAsRead: builder.mutation<{ modifiedCount: number }, string>({
      query: (partnerId) => ({
        url: `/messages/conversations/${partnerId}/mark-read`,
        method: 'PATCH',
      }),
      transformResponse: (response: { success: boolean; data: { modifiedCount: number } }) => response.data,
      invalidatesTags: ['Message'],
    }),
    deleteConversation: builder.mutation<{ deletedCount: number }, string>({
      query: (partnerId) => ({
        url: `/messages/conversations/${partnerId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; data: { deletedCount: number } }) => response.data,
      invalidatesTags: ['Message'],
    }),
    
    // Club endpoints
    getClubs: builder.query<ClubData[], { verified?: boolean; location?: string }>({
      query: (params) => ({
        url: '/clubs',
        params,
      }),
      providesTags: ['Club'],
    }),
    getClubById: builder.query<ClubData, string>({
      query: (id) => `/clubs/${id}`,
      providesTags: ['Club'],
    }),
    createClub: builder.mutation<ClubData, Omit<ClubData, 'id' | 'achievements'>>({
      query: (newClub) => ({
        url: '/clubs',
        method: 'POST',
        body: newClub,
      }),
      invalidatesTags: ['Club'],
    }),
    updateClub: builder.mutation<ClubData, { id: string; data: UpdateClubDataRequest }>({
      query: ({ id, data }) => ({
        url: `/clubs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Club'],
    }),
    deleteClub: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clubs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Club'],
    }),
    getClubMembers: builder.query<ClubMember[], string>({
      query: (clubId) => `/clubs/${clubId}/members`,
      providesTags: ['Club'],
    }),
    addClubMember: builder.mutation<void, { clubId: string; userId: string; role: 'player' | 'coach' | 'scout' }>({
      query: ({ clubId, userId, role }) => ({
        url: `/clubs/${clubId}/members`,
        method: 'POST',
        body: { userId, role },
      }),
      invalidatesTags: ['Club'],
    }),
    removeClubMember: builder.mutation<void, { clubId: string; userId: string }>({
      query: ({ clubId, userId }) => ({
        url: `/clubs/${clubId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Club'],
    }),
    getClubEvents: builder.query<ClubEvent[], string>({
      query: (clubId) => `/clubs/${clubId}/events`,
      providesTags: ['Club'],
    }),
    createClubEvent: builder.mutation<ClubEvent, { clubId: string; eventData: CreateClubEventRequest }>({
      query: ({ clubId, eventData }) => ({
        url: `/clubs/${clubId}/events`,
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Club'],
    }),
    updateClubEvent: builder.mutation<ClubEvent, { clubId: string; eventId: string; data: Partial<CreateClubEventRequest> }>({
      query: ({ clubId, eventId, data }) => ({
        url: `/clubs/${clubId}/events/${eventId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Club'],
    }),
    deleteClubEvent: builder.mutation<void, { clubId: string; eventId: string }>({
      query: ({ clubId, eventId }) => ({
        url: `/clubs/${clubId}/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Club'],
    }),
    getJoinRequests: builder.query<JoinRequest[], string>({
      query: (clubId) => `/clubs/${clubId}/join-requests`,
      providesTags: ['Club'],
    }),
    respondToJoinRequest: builder.mutation<void, { clubId: string; requestId: string; status: 'approved' | 'rejected' }>({
      query: ({ clubId, requestId, status }) => ({
        url: `/clubs/${clubId}/join-requests/${requestId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Club'],
    }),
    getClubStats: builder.query<ClubStats, string>({
      query: (clubId) => `/clubs/${clubId}/stats`,
      providesTags: ['Club'],
    }),
    addClubAchievement: builder.mutation<ClubAchievement, { clubId: string; achievement: Omit<ClubAchievement, 'id'> }>({
      query: ({ clubId, achievement }) => ({
        url: `/clubs/${clubId}/achievements`,
        method: 'POST',
        body: achievement,
      }),
      invalidatesTags: ['Club'],
    }),
    deleteClubAchievement: builder.mutation<void, { clubId: string; achievementId: string }>({
      query: ({ clubId, achievementId }) => ({
        url: `/clubs/${clubId}/achievements/${achievementId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Club'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyTokenMutation,
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useSearchUsersQuery,
  useSearchUsersAdvancedQuery,
  useSearchPostsQuery,
  useSearchClubsQuery,
  useGetPopularContentQuery,
  useGetTrendingTagsQuery,
  useSaveSearchMutation,
  useGetSavedSearchesQuery,
  useDeleteSavedSearchMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetSuggestedUsersQuery,
  useReportContentMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
  useGetPostsQuery,
  useGetPostsByUserQuery,
  useGetUserMediaQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useSharePostMutation,
  useCommentOnPostMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useMarkMessageAsReadMutation,
  useMarkConversationAsReadMutation,
  useDeleteConversationMutation,
  useGetClubsQuery,
  useGetClubByIdQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useGetClubMembersQuery,
  useAddClubMemberMutation,
  useRemoveClubMemberMutation,
  useGetClubEventsQuery,
  useCreateClubEventMutation,
  useUpdateClubEventMutation,
  useDeleteClubEventMutation,
  useGetJoinRequestsQuery,
  useRespondToJoinRequestMutation,
  useGetClubStatsQuery,
  useAddClubAchievementMutation,
  useDeleteClubAchievementMutation,
  useGetShortlistedPlayersQuery,
  useAddToShortlistMutation,
  useCreateScoutReportMutation,
  useGetPlayersByPositionQuery,
  // Coach endpoints
  useGetCoachStatsQuery,
  useGetTrainingSessionsQuery,
  useGetTrainingSessionByIdQuery,
  useCreateTrainingSessionMutation,
  useUpdateTrainingSessionMutation,
  useDeleteTrainingSessionMutation,
  useAddPlayerToSessionMutation,
  useRemovePlayerFromSessionMutation,
  useGetPlayerAssessmentsQuery,
  useGetPlayerAssessmentByIdQuery,
  useCreatePlayerAssessmentMutation,
  useUpdatePlayerAssessmentMutation,
  useDeletePlayerAssessmentMutation,
  useGetPlayerProgressQuery,
  useGetMyPlayersQuery,
  useUpdateCoachProfileMutation,
  useAddCoachAchievementMutation,
  useUpdateCoachAchievementMutation,
  useDeleteCoachAchievementMutation,
  // Coach player management
  useSearchAvailablePlayersQuery,
  useAddPlayerToTeamMutation,
  useRemovePlayerFromTeamMutation,
  useSendPlayerInvitationMutation,
} = api;

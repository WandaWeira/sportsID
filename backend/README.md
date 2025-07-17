# Sporty Backend API

Backend API for Sporty - a LinkedIn-style social network for the sports ecosystem.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Support for players, scouts, coaches, and clubs
- **Social Features**: Posts, comments, likes, and messaging
- **Scouting System**: Scout reports and player shortlisting
- **Club Management**: Club membership and team management
- **Real-time Messaging**: Socket.io integration for instant messaging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users` - Search users
- `DELETE /api/users/:id` - Delete user account

### Posts
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post
- `DELETE /api/posts/:id` - Delete post

### Messages
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send new message
- `GET /api/messages` - Get user conversations
- `PATCH /api/messages/:id/read` - Mark message as read

### Scouts
- `GET /api/scouts/:scoutId/shortlist` - Get shortlisted players
- `POST /api/scouts/:scoutId/shortlist` - Add player to shortlist
- `DELETE /api/scouts/:scoutId/shortlist/:playerId` - Remove from shortlist
- `POST /api/scouts/reports` - Create scout report
- `GET /api/scouts/reports` - Get scout reports

### Players
- `GET /api/players/search` - Search players by criteria
- `GET /api/players/:id/stats` - Get player statistics
- `PATCH /api/players/:id/stats` - Update player stats
- `GET /api/players/trending` - Get trending players
- `PATCH /api/players/:id/status` - Update player status

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs/:id/join-request` - Request to join club
- `DELETE /api/clubs/:id/members/:memberId` - Remove club member
- `GET /api/clubs/:id/members` - Get club members

### Coaches
- `GET /api/coaches` - Get all coaches
- `GET /api/coaches/:id/players` - Get players coached
- `POST /api/coaches/:id/players/:playerId` - Add player to coaching list
- `DELETE /api/coaches/:id/players/:playerId` - Remove from coaching list
- `POST /api/coaches/:id/achievements` - Add coach achievement
- `GET /api/coaches/specializations` - Get coach specializations

## User Roles

### Player
- Create profile with sport, position, age, and status
- Manage statistics (matches, goals, assists)
- Update status (Free Agent, Signed, Looking to be Scouted)
- Join clubs and connect with scouts/coaches

### Scout
- Maintain shortlist of players
- Create detailed scout reports
- Rate and recommend players
- Connect with clubs and players

### Coach
- Manage list of coached players
- Track certifications and achievements
- Specialize in different areas (tactics, fitness, youth development)
- Connect with clubs and players

### Club
- Manage team roster (players, coaches, scouts)
- Club profile with achievements and facilities
- Approve/remove members
- Post club updates and announcements

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   # Make sure MongoDB is running on localhost:27017
   # Or update MONGODB_URI in .env
   ```

4. **Seed Database** (Optional):
   ```bash
   npm run seed
   ```

5. **Development**:
   ```bash
   npm run dev
   ```

6. **Production**:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sporty
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Database Schema

### User Model
- Basic user information (name, email, role)
- Role-specific data (playerData, scoutData, coachData, clubData)
- Authentication and verification status

### Post Model
- User-generated content with media support
- Likes and comments system
- Tagging and social features

### Message Model
- Direct messaging between users
- Read status tracking
- Real-time updates via Socket.io

### Scout Report Model
- Detailed player evaluations
- Rating system and recommendations
- Strengths/weaknesses analysis

## Sample Data

The seed script creates sample users for testing:

- **Player**: john.smith@email.com / password123
- **Scout**: david.rodriguez@email.com / password123  
- **Coach**: carlos.martinez@email.com / password123
- **Club**: admin@cityunited.com / password123

## API Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string (only on errors),
  "pagination": { (for paginated responses)
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

## Error Handling

- Validation errors return 400 with detailed field errors
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Server errors return 500 with error details (in development)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Rate limiting
- Input validation and sanitization
- Helmet security headers

## Socket.io Events

### Real-time Messaging
- `join_conversation` - Join a conversation room
- `send_message` - Send message to conversation
- `receive_message` - Receive new message

## Development

### Code Structure
```
src/
├── models/         # Mongoose models
├── routes/         # Express route handlers
├── middleware/     # Custom middleware
├── types/          # TypeScript type definitions
├── scripts/        # Database seeding and utilities
└── server.ts       # Main application entry
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Integration with Frontend

This backend is designed to work with the Sporty React frontend. The API endpoints match the RTK Query integration in the frontend application.

- Base URL: `http://localhost:3001/api`
- Authentication: Bearer token in Authorization header
- CORS configured for frontend domain

## Contributing

1. Follow TypeScript best practices
2. Use proper error handling with try-catch blocks
3. Validate all inputs with express-validator
4. Add proper JSDoc comments for new functions
5. Update this README for new features

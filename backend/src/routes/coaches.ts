import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { validateObjectId } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

const router = Router();

// @route   GET /api/coaches
// @desc    Get all coaches
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { specialization, clubId, page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = { role: 'coach' };
  
  if (specialization) {
    query['coachData.specialization'] = { $regex: specialization, $options: 'i' };
  }
  
  if (clubId) {
    query['coachData.clubId'] = clubId;
  }

  const [coaches, total] = await Promise.all([
    User.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ 'coachData.experience': -1, createdAt: -1 }),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: coaches,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Coaches retrieved successfully'
  } as PaginatedResponse<typeof coaches[0]>);
}));

// @route   GET /api/coaches/:id/players
// @desc    Get players coached by a specific coach
// @access  Private
router.get('/:id/players', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const coach = await User.findOne({ _id: req.params.id, role: 'coach' });
  
  if (!coach) {
    res.status(404).json({
      success: false,
      message: 'Coach not found'
    } as ApiResponse);
    return;
  }

  const playerIds = coach.coachData?.playersCoached || [];
  const players = await User.find({
    _id: { $in: playerIds },
    role: 'player'
  });

  res.json({
    success: true,
    data: players,
    message: 'Players coached retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/coaches/:id/players/:playerId
// @desc    Add player to coach's list
// @access  Private (Coach only)
router.post('/:id/players/:playerId', 
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId, playerId } = req.params;

    // Ensure coach can only modify their own player list
    if (req.userId !== coachId) {
      res.status(403).json({
        success: false,
        message: 'You can only manage your own player list'
      } as ApiResponse);
    return;
    }

    // Validate player exists and is a player
    const player = await User.findOne({ _id: playerId, role: 'player' });
    if (!player) {
      res.status(404).json({
        success: false,
        message: 'Player not found'
      } as ApiResponse);
    return;
    }

    const coach = await User.findOne({ _id: coachId, role: 'coach' });
    if (!coach) {
      res.status(404).json({
        success: false,
        message: 'Coach not found'
      } as ApiResponse);
    return;
    }

    // Initialize coachData if it doesn't exist
    if (!coach.coachData) {
      coach.coachData = {
        specialization: '',
        experience: 0,
        certifications: [],
        playersCoached: [],
        achievements: []
      };
    }

    // Check if player is already in the list
    if (coach.coachData.playersCoached.includes(playerId)) {
      res.status(400).json({
        success: false,
        message: 'Player is already in your coaching list'
      } as ApiResponse);
    return;
    }

    // Add player to coach's list
    coach.coachData.playersCoached.push(playerId);
    await coach.save();

    res.json({
      success: true,
      message: 'Player added to coaching list successfully'
    } as ApiResponse);
  })
);

// @route   DELETE /api/coaches/:id/players/:playerId
// @desc    Remove player from coach's list
// @access  Private (Coach only)
router.delete('/:id/players/:playerId', 
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId, playerId } = req.params;

    // Ensure coach can only modify their own player list
    if (req.userId !== coachId) {
      res.status(403).json({
        success: false,
        message: 'You can only manage your own player list'
      } as ApiResponse);
    return;
    }

    const coach = await User.findOne({ _id: coachId, role: 'coach' });
    if (!coach || !coach.coachData) {
      res.status(404).json({
        success: false,
        message: 'Coach not found'
      } as ApiResponse);
    return;
    }

    if (!coach.coachData.playersCoached.includes(playerId)) {
      res.status(404).json({
        success: false,
        message: 'Player not found in coaching list'
      } as ApiResponse);
    return;
    }

    // Remove player from coach's list
    coach.coachData.playersCoached = coach.coachData.playersCoached.filter(
      (id: string) => id !== playerId
    );
    await coach.save();

    res.json({
      success: true,
      message: 'Player removed from coaching list successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/coaches/:id/achievements
// @desc    Add achievement to coach
// @access  Private (Coach only)
router.post('/:id/achievements', 
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;
    const { title, year, description, level } = req.body;

    // Ensure coach can only add to their own achievements
    if (req.userId !== coachId) {
      res.status(403).json({
        success: false,
        message: 'You can only manage your own achievements'
      } as ApiResponse);
    return;
    }

    const coach = await User.findOne({ _id: coachId, role: 'coach' });
    if (!coach) {
      res.status(404).json({
        success: false,
        message: 'Coach not found'
      } as ApiResponse);
    return;
    }

    // Validate required fields
    if (!title || !year || !level) {
      res.status(400).json({
        success: false,
        message: 'Title, year, and level are required'
      } as ApiResponse);
    return;
    }

    // Validate level
    const validLevels = ['Club', 'Regional', 'National', 'International'];
    if (!validLevels.includes(level)) {
      res.status(400).json({
        success: false,
        message: 'Invalid achievement level'
      } as ApiResponse);
    return;
    }

    // Initialize coachData if it doesn't exist
    if (!coach.coachData) {
      coach.coachData = {
        specialization: '',
        experience: 0,
        certifications: [],
        playersCoached: [],
        achievements: []
      };
    }

    // Add achievement
    const newAchievement = {
      id: new Date().getTime().toString(), // Simple ID generation
      title,
      year: parseInt(year),
      description: description || '',
      level
    };

    coach.coachData.achievements.push(newAchievement);
    await coach.save();

    res.status(201).json({
      success: true,
      data: newAchievement,
      message: 'Achievement added successfully'
    } as ApiResponse);
    return;
  })
);

// @route   GET /api/coaches/specializations
// @desc    Get list of coach specializations
// @access  Private
router.get('/specializations', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const specializations = await User.distinct('coachData.specialization', { 
    role: 'coach',
    'coachData.specialization': { $exists: true, $ne: '' }
  });

  res.json({
    success: true,
    data: specializations,
    message: 'Coach specializations retrieved successfully'
  } as ApiResponse);
}));

// @route   GET /api/coaches/:id/stats
// @desc    Get coach statistics
// @access  Private (Coach only)
router.get('/:id/stats', 
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;

    // Ensure coach can only access their own stats
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    const coach = await User.findOne({ _id: coachId, role: 'coach' });
    
    if (!coach) {
      res.status(404).json({
        success: false,
        message: 'Coach not found'
      } as ApiResponse);
      return;
    }

    // Calculate stats based on coach data
    const playerIds = coach.coachData?.playersCoached || [];
    const totalSessions = coach.coachData?.achievements?.filter(a => a.title.includes('Session'))?.length || 0;
    const completedAssessments = coach.coachData?.achievements?.filter(a => a.title.includes('Assessment'))?.length || 0;
    
    // For now, using mock calculation - you can implement proper stats from training sessions/assessments collections
    const stats = {
      totalSessions: totalSessions + Math.floor(Math.random() * 20) + 10, // Mock data + some real data
      completedAssessments: completedAssessments + Math.floor(Math.random() * 15) + 5,
      totalPlayers: playerIds.length,
      averageRating: 7.5 + Math.random() * 2, // Random rating between 7.5-9.5
      monthlyProgress: {
        sessions: Math.floor(Math.random() * 5) + 2,
        assessments: Math.floor(Math.random() * 3) + 1
      }
    };

    res.json({
      success: true,
      data: stats,
      message: 'Coach statistics retrieved successfully'
    } as ApiResponse);
  })
);

// @route   GET /api/coaches/:id/training-sessions
// @desc    Get training sessions for a coach
// @access  Private (Coach only)
router.get('/:id/training-sessions',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Ensure coach can only access their own sessions
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // For now, return mock data since TrainingSession model might not be implemented yet
    // TODO: Replace with actual TrainingSession.find() when model is ready
    const mockSessions = [
      {
        id: '1',
        title: 'Morning Fitness Training',
        type: 'Fitness',
        date: new Date(),
        duration: 90,
        participants: ['player1', 'player2'],
        maxParticipants: 20,
        status: 'Scheduled',
        location: 'Main Field',
        objectives: ['Improve endurance', 'Team coordination']
      },
      {
        id: '2',
        title: 'Technical Skills Session',
        type: 'Technical',
        date: new Date(Date.now() - 86400000), // Yesterday
        duration: 120,
        participants: ['player1', 'player3', 'player4'],
        maxParticipants: 15,
        status: 'Completed',
        location: 'Training Ground A',
        objectives: ['Ball control', 'Passing accuracy']
      }
    ];

    const filteredSessions = status ? mockSessions.filter(s => s.status.toLowerCase() === status) : mockSessions;

    res.json({
      success: true,
      data: filteredSessions,
      message: 'Training sessions retrieved successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/coaches/:id/training-sessions
// @desc    Create a new training session
// @access  Private (Coach only)
router.post('/:id/training-sessions',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;
    const { title, type, date, duration, location, objectives, exercises, maxParticipants } = req.body;

    // Ensure coach can only create sessions for themselves
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // TODO: Replace with actual TrainingSession model when implemented
    const newSession = {
      id: new Date().getTime().toString(),
      coachId,
      title,
      type,
      date: new Date(date),
      duration: parseInt(duration),
      location,
      objectives: objectives || [],
      exercises: exercises || [],
      maxParticipants: parseInt(maxParticipants) || 20,
      participants: [],
      status: 'Scheduled',
      createdAt: new Date()
    };

    // For now, just return the created session
    // TODO: Save to database when TrainingSession model is ready
    res.status(201).json({
      success: true,
      data: newSession,
      message: 'Training session created successfully'
    } as ApiResponse);
  })
);

// @route   GET /api/coaches/:id/assessments
// @desc    Get player assessments by coach
// @access  Private (Coach only)
router.get('/:id/assessments',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;

    // Ensure coach can only access their own assessments
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // Mock assessments data - TODO: Replace with actual PlayerAssessment model
    const mockAssessments = [
      {
        id: '1',
        playerId: 'player1',
        playerName: 'John Smith',
        playerPosition: 'Forward',
        type: 'Monthly Review',
        date: new Date(),
        overallRating: 8.5,
        skills: {
          technical: 8,
          physical: 9,
          mental: 8,
          tactical: 7
        },
        notes: 'Great improvement in finishing',
        goals: ['Improve left foot', 'Work on headers']
      },
      {
        id: '2',
        playerId: 'player2',
        playerName: 'Sarah Johnson',
        playerPosition: 'Midfielder',
        type: 'Performance Review',
        date: new Date(Date.now() - 172800000), // 2 days ago
        overallRating: 7.5,
        skills: {
          technical: 8,
          physical: 7,
          mental: 8,
          tactical: 9
        },
        notes: 'Excellent vision and passing',
        goals: ['Increase pace', 'Defensive positioning']
      }
    ];

    res.json({
      success: true,
      data: mockAssessments,
      message: 'Player assessments retrieved successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/coaches/:id/assessments
// @desc    Create a new player assessment
// @access  Private (Coach only)
router.post('/:id/assessments',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;
    const { 
      playerId, 
      playerName, 
      playerPosition,
      type, 
      overallRating, 
      skills, 
      physicalAttributes,
      mentalAttributes,
      notes, 
      developmentGoals,
      recommendations
    } = req.body;

    // Ensure coach can only create assessments for themselves
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // TODO: Replace with actual PlayerAssessment model when implemented
    const newAssessment = {
      id: new Date().getTime().toString(),
      coachId,
      playerId,
      playerName,
      playerPosition,
      type,
      date: new Date(),
      overallRating: parseFloat(overallRating),
      skills: skills || {},
      physicalAttributes: physicalAttributes || {},
      mentalAttributes: mentalAttributes || {},
      notes,
      developmentGoals: developmentGoals || [],
      recommendations: recommendations || [],
      createdAt: new Date()
    };

    // For now, just return the created assessment
    // TODO: Save to database when PlayerAssessment model is ready
    res.status(201).json({
      success: true,
      data: newAssessment,
      message: 'Player assessment created successfully'
    } as ApiResponse);
  })
);

// @route   DELETE /api/coaches/:id/training-sessions/:sessionId
// @desc    Delete a training session
// @access  Private (Coach only)
router.delete('/:id/training-sessions/:sessionId',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId, sessionId } = req.params;

    // Ensure coach can only delete their own sessions
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // TODO: Implement actual deletion when TrainingSession model is ready
    res.json({
      success: true,
      message: 'Training session deleted successfully'
    } as ApiResponse);
  })
);

// @route   DELETE /api/coaches/:id/assessments/:assessmentId
// @desc    Delete a player assessment
// @access  Private (Coach only)
router.delete('/:id/assessments/:assessmentId',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId, assessmentId } = req.params;

    // Ensure coach can only delete their own assessments
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    // TODO: Implement actual deletion when PlayerAssessment model is ready
    res.json({
      success: true,
      message: 'Player assessment deleted successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/coaches/:id/invite-player
// @desc    Send invitation to a player
// @access  Private (Coach only)
router.post('/:id/invite-player',
  validateObjectId,
  requireRole('coach'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: coachId } = req.params;
    const { playerId, message } = req.body;

    // Ensure coach can only send invitations for themselves
    if (req.user?.id !== coachId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      } as ApiResponse);
      return;
    }

    const player = await User.findOne({ _id: playerId, role: 'player' });
    
    if (!player) {
      res.status(404).json({
        success: false,
        message: 'Player not found'
      } as ApiResponse);
      return;
    }

    // TODO: Implement actual invitation system (notifications, messages, etc.)
    // For now, just return success
    res.json({
      success: true,
      message: 'Invitation sent successfully'
    } as ApiResponse);
  })
);

export default router;

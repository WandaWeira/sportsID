import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { JoinRequest } from '@/models/JoinRequest';
import { validateObjectId } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

const router = Router();

// @route   GET /api/clubs
// @desc    Get all clubs
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { verified, location, tier, page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = { role: 'club' };
  
  if (verified !== undefined) {
    query['clubData.verified'] = verified === 'true';
  }
  
  if (location) {
    query['clubData.location'] = { $regex: location, $options: 'i' };
  }
  
  if (tier) {
    query['clubData.tier'] = tier;
  }

  const [clubs, total] = await Promise.all([
    User.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ 'clubData.verified': -1, createdAt: -1 }),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: clubs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Clubs retrieved successfully'
  } as PaginatedResponse<typeof clubs[0]>);
}));

// @route   GET /api/clubs/:id
// @desc    Get club by ID
// @access  Private
router.get('/:id', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const club = await User.findOne({ _id: req.params.id, role: 'club' })
    .populate('clubData.coaches', 'name profileImage coachData.specialization')
    .populate('clubData.players', 'name profileImage playerData.position playerData.sport')
    .populate('clubData.scouts', 'name profileImage');
  
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: club,
    message: 'Club retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/clubs/:id/join-request
// @desc    Request to join a club
// @access  Private
router.post('/:id/join-request', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const userId = req.userId!;

  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  // Check if user is already a member
  const isAlreadyMember = 
    club.clubData?.players.includes(userId) ||
    club.clubData?.coaches.includes(userId) ||
    club.clubData?.scouts.includes(userId);

  if (isAlreadyMember) {
    res.status(400).json({
      success: false,
      message: 'You are already a member of this club'
    } as ApiResponse);
    return;
  }

  // For now, auto-approve join requests
  // In a real app, this would create a notification for club admins
  if (!club.clubData) {
    res.status(400).json({
      success: false,
      message: 'Club data is incomplete'
    } as ApiResponse);
    return;
  }

  // Add user to appropriate club list based on their role
  switch (user.role) {
    case 'player':
      club.clubData.players.push(userId);
      // Update player's club info
      if (user.playerData) {
        user.playerData.clubId = clubId;
        user.playerData.clubName = club.clubData.name;
        user.playerData.status = 'Signed';
      }
      break;
    case 'coach':
      club.clubData.coaches.push(userId);
      // Update coach's club info
      if (user.coachData) {
        user.coachData.clubId = clubId;
        user.coachData.clubName = club.clubData.name;
      }
      break;
    case 'scout':
      club.clubData.scouts.push(userId);
      // Update scout's club info
      if (user.scoutData) {
        user.scoutData.clubId = clubId;
        user.scoutData.clubName = club.clubData.name;
      }
      break;
    default:
      res.status(400).json({
        success: false,
        message: 'Only players, coaches, and scouts can join clubs'
      } as ApiResponse);
    return;
  }

  await Promise.all([club.save(), user.save()]);

  res.json({
    success: true,
    message: 'Successfully joined the club'
  } as ApiResponse);
}));

// @route   DELETE /api/clubs/:id/members/:memberId
// @desc    Remove member from club
// @access  Private (Club admin only)
router.delete('/:id/members/:memberId', 
  validateObjectId,
  requireRole('club'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id: clubId, memberId } = req.params;

    // Ensure only club admin can remove members
    if (req.userId !== clubId) {
      res.status(403).json({
        success: false,
        message: 'Only club administrators can remove members'
      } as ApiResponse);
    return;
    }

    const club = await User.findOne({ _id: clubId, role: 'club' });
    if (!club || !club.clubData) {
      res.status(404).json({
        success: false,
        message: 'Club not found'
      } as ApiResponse);
    return;
    }

    const member = await User.findById(memberId);
    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Member not found'
      } as ApiResponse);
    return;
    }

    // Remove member from appropriate club list
    let removed = false;
    if (club.clubData.players.includes(memberId)) {
      club.clubData.players = club.clubData.players.filter((id: string) => id !== memberId);
      // Update player's status
      if (member.playerData) {
        member.playerData.clubId = undefined;
        member.playerData.clubName = undefined;
        member.playerData.status = 'Free Agent';
      }
      removed = true;
    } else if (club.clubData.coaches.includes(memberId)) {
      club.clubData.coaches = club.clubData.coaches.filter((id: string) => id !== memberId);
      // Update coach's club info
      if (member.coachData) {
        member.coachData.clubId = undefined;
        member.coachData.clubName = undefined;
      }
      removed = true;
    } else if (club.clubData.scouts.includes(memberId)) {
      club.clubData.scouts = club.clubData.scouts.filter((id: string) => id !== memberId);
      // Update scout's club info
      if (member.scoutData) {
        member.scoutData.clubId = undefined;
        member.scoutData.clubName = undefined;
      }
      removed = true;
    }

    if (!removed) {
      res.status(404).json({
        success: false,
        message: 'Member not found in club'
      } as ApiResponse);
    return;
    }

    await Promise.all([club.save(), member.save()]);

    res.json({
      success: true,
      message: 'Member removed from club successfully'
    } as ApiResponse);
  })
);

// @route   GET /api/clubs/:id/members
// @desc    Get club members
// @access  Private
router.get('/:id/members', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { role } = req.query; // Filter by role: 'player', 'coach', 'scout'

  const club = await User.findOne({ _id: req.params.id, role: 'club' });
  if (!club || !club.clubData) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  let memberIds: string[] = [];
  
  if (role === 'player') {
    memberIds = club.clubData.players;
  } else if (role === 'coach') {
    memberIds = club.clubData.coaches;
  } else if (role === 'scout') {
    memberIds = club.clubData.scouts;
  } else {
    // Get all members
    memberIds = [
      ...club.clubData.players,
      ...club.clubData.coaches,
      ...club.clubData.scouts
    ];
  }

  const members = await User.find({ _id: { $in: memberIds } });

  res.json({
    success: true,
    data: members,
    message: 'Club members retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/clubs/:id/events
// @desc    Create club event
// @access  Private (Club only)
router.post('/:id/events', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const { title, date, type, description, location, participants } = req.body;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns this club
  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only create events for your own club'
    } as ApiResponse);
    return;
  }

  const event = new Event({
    clubId,
    title,
    date: new Date(date),
    type,
    description,
    location,
    participants: participants || [],
    createdBy: (req as any).user.id
  });

  await event.save();

  res.status(201).json({
    success: true,
    data: event,
    message: 'Event created successfully'
  } as ApiResponse);
}));

// @route   GET /api/clubs/:id/events
// @desc    Get club events
// @access  Private
router.get('/:id/events', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { status, type, upcoming } = req.query;
  const clubId = req.params.id;

  // Verify club exists
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  const query: any = { clubId };
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  }

  const events = await Event.find(query)
    .populate('createdBy', 'name')
    .populate('participants', 'name profileImage')
    .sort({ date: 1 });

  res.json({
    success: true,
    data: events,
    message: 'Club events retrieved successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/clubs/:id/events/:eventId
// @desc    Update club event
// @access  Private (Club only)
router.patch('/:id/events/:eventId', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const clubId = req.params.id;
  const eventId = req.params.eventId;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only update events for your own club'
    } as ApiResponse);
    return;
  }

  const event = await Event.findOne({ _id: eventId, clubId });
  if (!event) {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    } as ApiResponse);
    return;
  }

  // Update allowed fields
  const allowedUpdates = ['title', 'date', 'type', 'description', 'location', 'participants', 'status'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400).json({
      success: false,
      message: 'Invalid updates'
    } as ApiResponse);
    return;
  }

  updates.forEach(update => {
    if (update === 'date') {
      (event as any)[update] = new Date(req.body[update]);
    } else {
      (event as any)[update] = req.body[update];
    }
  });

  await event.save();

  res.json({
    success: true,
    data: event,
    message: 'Event updated successfully'
  } as ApiResponse);
}));

// @route   DELETE /api/clubs/:id/events/:eventId
// @desc    Delete club event
// @access  Private (Club only)
router.delete('/:id/events/:eventId', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const clubId = req.params.id;
  const eventId = req.params.eventId;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only delete events for your own club'
    } as ApiResponse);
    return;
  }

  const event = await Event.findOneAndDelete({ _id: eventId, clubId });
  if (!event) {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    message: 'Event deleted successfully'
  } as ApiResponse);
}));

// @route   POST /api/clubs
// @desc    Create a new club
// @access  Private (Club role only)
router.post('/', requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { name, location, foundedYear, description, website, tier, league } = req.body;

  if (!name || !location || !foundedYear || !description || !tier) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, location, foundedYear, description, tier'
    } as ApiResponse);
    return;
  }

  // Check if user already has club data
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  if (existingUser.role !== 'club') {
    res.status(403).json({
      success: false,
      message: 'Only club accounts can create club profiles'
    } as ApiResponse);
    return;
  }

  // Update user with club data
  existingUser.clubData = {
    name,
    location,
    foundedYear,
    description,
    verified: false,
    website,
    tier,
    league,
    coaches: [],
    players: [],
    scouts: [],
    achievements: [],
    facilities: []
  };

  await existingUser.save();

  res.status(201).json({
    success: true,
    data: existingUser,
    message: 'Club profile created successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/clubs/:id
// @desc    Update club information
// @access  Private (Club admin only)
router.patch('/:id', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const userId = req.userId!;
  const updateData = req.body;

  // Verify user owns this club
  if (clubId !== userId) {
    res.status(403).json({
      success: false,
      message: 'You can only update your own club'
    } as ApiResponse);
    return;
  }

  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  // Update club data
  if (club.clubData) {
    Object.assign(club.clubData, updateData);
  } else {
    club.clubData = updateData;
  }

  await club.save();

  res.json({
    success: true,
    data: club,
    message: 'Club updated successfully'
  } as ApiResponse);
}));

// @route   DELETE /api/clubs/:id
// @desc    Delete club
// @access  Private (Club admin only)
router.delete('/:id', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const userId = req.userId!;

  // Verify user owns this club
  if (clubId !== userId) {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own club'
    } as ApiResponse);
    return;
  }

  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  // Remove club references from all members
  if (club.clubData) {
    const memberIds = [
      ...club.clubData.players,
      ...club.clubData.coaches,
      ...club.clubData.scouts
    ];

    await User.updateMany(
      { _id: { $in: memberIds } },
      {
        $unset: {
          'playerData.clubId': '',
          'playerData.clubName': '',
          'coachData.clubId': '',
          'coachData.clubName': '',
          'scoutData.clubId': '',
          'scoutData.clubName': ''
        },
        $set: {
          'playerData.status': 'Free Agent'
        }
      }
    );
  }

  await User.findByIdAndDelete(clubId);

  res.json({
    success: true,
    message: 'Club deleted successfully'
  } as ApiResponse);
}));



// @route   GET /api/clubs/:id/join-requests
// @desc    Get club join requests
// @access  Private (Club only)
router.get('/:id/join-requests', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const { status } = req.query;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only view requests for your own club'
    } as ApiResponse);
    return;
  }

  const query: any = { clubId };
  if (status) {
    query.status = status;
  }

  const joinRequests = await JoinRequest.find(query)
    .populate('userId', 'name profileImage role playerData.position coachData.specialization')
    .sort({ requestDate: -1 });

  // Transform the data to match frontend expectations
  const transformedRequests = joinRequests.map(request => {
    const user = request.userId as any; // Cast to access populated fields
    return {
      id: request._id,
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      profileImage: user.profileImage,
      requestDate: request.requestDate,
      status: request.status,
      message: request.message
    };
  });

  res.json({
    success: true,
    data: transformedRequests,
    message: 'Join requests retrieved successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/clubs/:id/join-requests/:requestId
// @desc    Respond to join request
// @access  Private (Club only)
router.patch('/:id/join-requests/:requestId', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const clubId = req.params.id;
  const requestId = req.params.requestId;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid status. Must be "approved" or "rejected"'
    } as ApiResponse);
    return;
  }

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only respond to requests for your own club'
    } as ApiResponse);
    return;
  }

  const joinRequest = await JoinRequest.findOne({ _id: requestId, clubId })
    .populate('userId');
  
  if (!joinRequest) {
    res.status(404).json({
      success: false,
      message: 'Join request not found'
    } as ApiResponse);
    return;
  }

  if (joinRequest.status !== 'pending') {
    res.status(400).json({
      success: false,
      message: 'This request has already been processed'
    } as ApiResponse);
    return;
  }

  // Update request status
  joinRequest.status = status;
  joinRequest.processedDate = new Date();
  joinRequest.processedBy = (req as any).user.id;
  await joinRequest.save();

  // If approved, add member to club
  if (status === 'approved') {
    const member = await User.findById(joinRequest.userId);
    if (!member) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    const userRole = member.role;

    if (!club.clubData) {
      res.status(400).json({
        success: false,
        message: 'Club data not found'
      } as ApiResponse);
      return;
    }

    if (userRole === 'player' && member.playerData) {
      club.clubData.players.push(member.id);
      member.playerData.clubId = club.id;
      member.playerData.clubName = club.clubData.name;
    } else if (userRole === 'coach' && member.coachData) {
      club.clubData.coaches.push(member.id);
      member.coachData.clubId = club.id;
      member.coachData.clubName = club.clubData.name;
    } else if (userRole === 'scout' && member.scoutData) {
      club.clubData.scouts.push(member.id);
      member.scoutData.clubId = club.id;
      member.scoutData.clubName = club.clubData.name;
    }

    await Promise.all([club.save(), member.save()]);
  }

  res.json({
    success: true,
    message: `Join request ${status} successfully`
  } as ApiResponse);
}));

// @route   GET /api/clubs/:id/stats
// @desc    Get club statistics
// @access  Private
router.get('/:id/stats', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;

  // Verify club exists
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club || !club.clubData) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  // Get stats
  const totalPlayers = club.clubData.players.length;
  const totalCoaches = club.clubData.coaches.length;
  const totalScouts = club.clubData.scouts.length;
  const totalMembers = totalPlayers + totalCoaches + totalScouts;

  // Get active members (could be enhanced with last activity tracking)
  const activeMembers = totalMembers; // Placeholder - would need activity tracking

  // Get upcoming events
  const upcomingEvents = await Event.countDocuments({
    clubId,
    date: { $gte: new Date() },
    status: 'scheduled'
  });

  // Get total events played/completed
  const matchesPlayed = await Event.countDocuments({
    clubId,
    type: 'match',
    status: 'completed'
  });

  // Get pending join requests
  const membershipRequests = await JoinRequest.countDocuments({
    clubId,
    status: 'pending'
  });

  // Get trophies (achievements)
  const trophiesWon = club.clubData.achievements ? club.clubData.achievements.length : 0;

  const stats = {
    totalMembers,
    activeMembers,
    totalPlayers,
    totalCoaches,
    totalScouts,
    upcomingEvents,
    matchesPlayed,
    trophiesWon,
    membershipRequests
  };

  res.json({
    success: true,
    data: stats,
    message: 'Club statistics retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/clubs/:id/achievements
// @desc    Add club achievement
// @access  Private (Club only)
router.post('/:id/achievements', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const clubId = req.params.id;
  const { title, year, description, level } = req.body;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club || !club.clubData) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only add achievements to your own club'
    } as ApiResponse);
    return;
  }

  const newAchievement = {
    id: new Date().getTime().toString(), // Simple ID generation
    title,
    year,
    description,
    level
  };

  club.clubData.achievements.push(newAchievement);
  await club.save();

  res.status(201).json({
    success: true,
    data: newAchievement,
    message: 'Achievement added successfully'
  } as ApiResponse);
}));

// @route   DELETE /api/clubs/:id/achievements/:achievementId
// @desc    Delete club achievement
// @access  Private (Club only)
router.delete('/:id/achievements/:achievementId', validateObjectId, requireRole(['club']), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const clubId = req.params.id;
  const achievementId = req.params.achievementId;

  // Verify club exists and user owns it
  const club = await User.findOne({ _id: clubId, role: 'club' });
  if (!club || !club.clubData) {
    res.status(404).json({
      success: false,
      message: 'Club not found'
    } as ApiResponse);
    return;
  }

  if (club.id !== (req as any).user.id) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: You can only delete achievements from your own club'
    } as ApiResponse);
    return;
  }

  const achievementIndex = club.clubData.achievements.findIndex(
    (achievement: any) => achievement.id === achievementId
  );

  if (achievementIndex === -1) {
    res.status(404).json({
      success: false,
      message: 'Achievement not found'
    } as ApiResponse);
    return;
  }

  club.clubData.achievements.splice(achievementIndex, 1);
  await club.save();

  res.json({
    success: true,
    message: 'Achievement deleted successfully'
  } as ApiResponse);
}));

export default router;

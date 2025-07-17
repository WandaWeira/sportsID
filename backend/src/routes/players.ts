import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { validateObjectId, validateSearch } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

const router = Router();

// @route   GET /api/players/search
// @desc    Search players by position and sport
// @access  Private
router.get('/search', validateSearch, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { position, sport, status, page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = { role: 'player' };
  
  if (position) {
    query['playerData.position'] = { $regex: position, $options: 'i' };
  }
  
  if (sport) {
    query['playerData.sport'] = { $regex: sport, $options: 'i' };
  }
  
  if (status) {
    query['playerData.status'] = status;
  }

  const [players, total] = await Promise.all([
    User.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: players,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Players retrieved successfully'
  } as PaginatedResponse<typeof players[0]>);
}));

// @route   GET /api/players/:id/stats
// @desc    Get player statistics
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

  const player = await User.findOne({ _id: req.params.id, role: 'player' });
  
  if (!player) {
    res.status(404).json({
      success: false,
      message: 'Player not found'
    } as ApiResponse);
    return;
  }

  const stats = player.playerData?.stats || {
    matches: 0,
    goals: 0,
    assists: 0
  };

  res.json({
    success: true,
    data: {
      playerId: player._id,
      playerName: player.name,
      stats
    },
    message: 'Player stats retrieved successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/players/:id/stats
// @desc    Update player statistics
// @access  Private (Player only can update their own stats, or club officials)
router.patch('/:id/stats', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { id } = req.params;
  const { matches, goals, assists } = req.body;

  const player = await User.findOne({ _id: id, role: 'player' });
  
  if (!player) {
    res.status(404).json({
      success: false,
      message: 'Player not found'
    } as ApiResponse);
    return;
  }

  // Only allow player to update their own stats for now
  // In the future, add club officials permissions
  if (req.userId !== id) {
    res.status(403).json({
      success: false,
      message: 'You can only update your own statistics'
    } as ApiResponse);
    return;
  }

  // Initialize playerData if it doesn't exist
  if (!player.playerData) {
    res.status(400).json({
      success: false,
      message: 'Player profile is not complete'
    } as ApiResponse);
    return;
  }

  // Update stats
  if (!player.playerData.stats) {
    player.playerData.stats = { matches: 0, goals: 0, assists: 0 };
  }

  if (matches !== undefined) player.playerData.stats.matches = matches;
  if (goals !== undefined) player.playerData.stats.goals = goals;
  if (assists !== undefined) player.playerData.stats.assists = assists;

  await player.save();

  res.json({
    success: true,
    data: {
      playerId: player._id,
      playerName: player.name,
      stats: player.playerData.stats
    },
    message: 'Player stats updated successfully'
  } as ApiResponse);
}));

// @route   GET /api/players/trending
// @desc    Get trending players
// @access  Private
router.get('/trending', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit as string);

  // For now, get players with highest goals + assists
  // In a real app, this would be more sophisticated with trending algorithms
  const trendingPlayers = await User.find({ 
    role: 'player',
    'playerData.stats': { $exists: true }
  })
  .sort({
    'playerData.stats.goals': -1,
    'playerData.stats.assists': -1
  })
  .limit(limitNum);

  res.json({
    success: true,
    data: trendingPlayers,
    message: 'Trending players retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/players/:id/status
// @desc    Update player status (Free Agent, Signed, Looking to be Scouted)
// @access  Private (Player only)
router.patch('/:id/status', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { id } = req.params;
  const { status, clubId, clubName } = req.body;

  const player = await User.findOne({ _id: id, role: 'player' });
  
  if (!player) {
    res.status(404).json({
      success: false,
      message: 'Player not found'
    } as ApiResponse);
    return;
  }

  // Only allow player to update their own status
  if (req.userId !== id) {
    res.status(403).json({
      success: false,
      message: 'You can only update your own status'
    } as ApiResponse);
    return;
  }

  if (!player.playerData) {
    res.status(400).json({
      success: false,
      message: 'Player profile is not complete'
    } as ApiResponse);
    return;
  }

  // Validate status
  const validStatuses = ['Free Agent', 'Signed', 'Looking to be Scouted'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid status'
    } as ApiResponse);
    return;
  }

  // Update status
  player.playerData.status = status;
  
  if (status === 'Signed' && clubId && clubName) {
    player.playerData.clubId = clubId;
    player.playerData.clubName = clubName;
  } else if (status !== 'Signed') {
    player.playerData.clubId = undefined;
    player.playerData.clubName = undefined;
  }

  await player.save();

  res.json({
    success: true,
    data: {
      playerId: player._id,
      playerName: player.name,
      status: player.playerData.status,
      clubId: player.playerData.clubId,
      clubName: player.playerData.clubName
    },
    message: 'Player status updated successfully'
  } as ApiResponse);
}));

export default router;

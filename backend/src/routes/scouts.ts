import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { ScoutReport } from '@/models/ScoutReport';
import { validateScoutReport, validateObjectId } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

const router = Router();

// @route   GET /api/scouts/:scoutId/shortlist
// @desc    Get scout's shortlisted players
// @access  Private (Scout only)
router.get('/:scoutId/shortlist', 
  validateObjectId, 
  requireRole('scout'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((err: any) => err.msg).join(', ')
      } as ApiResponse);
    return;
    }

    const { scoutId } = req.params;
    
    // Ensure scout can only access their own shortlist
    if (req.userId !== scoutId) {
      res.status(403).json({
        success: false,
        message: 'You can only access your own shortlist'
      } as ApiResponse);
    return;
    }

    const scout = await User.findById(scoutId).populate('scoutData.shortlistedPlayers');
    
    if (!scout || scout.role !== 'scout') {
      res.status(404).json({
        success: false,
        message: 'Scout not found'
      } as ApiResponse);
    return;
    }

    const shortlistedPlayers = await User.find({
      _id: { $in: scout.scoutData?.shortlistedPlayers || [] },
      role: 'player'
    });

    res.json({
      success: true,
      data: shortlistedPlayers,
      message: 'Shortlisted players retrieved successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/scouts/:scoutId/shortlist
// @desc    Add player to scout's shortlist
// @access  Private (Scout only)
router.post('/:scoutId/shortlist', 
  validateObjectId,
  requireRole('scout'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((err: any) => err.msg).join(', ')
      } as ApiResponse);
    return;
    }

    const { scoutId } = req.params;
    const { playerId } = req.body;

    // Ensure scout can only modify their own shortlist
    if (req.userId !== scoutId) {
      res.status(403).json({
        success: false,
        message: 'You can only modify your own shortlist'
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

    const scout = await User.findById(scoutId);
    if (!scout || scout.role !== 'scout') {
      res.status(404).json({
        success: false,
        message: 'Scout not found'
      } as ApiResponse);
    return;
    }

    // Initialize scoutData if it doesn't exist
    if (!scout.scoutData) {
      scout.scoutData = {
        shortlistedPlayers: [],
        reports: []
      };
    }

    // Check if player is already shortlisted
    if (scout.scoutData.shortlistedPlayers.includes(playerId)) {
      res.status(400).json({
        success: false,
        message: 'Player is already in shortlist'
      } as ApiResponse);
    return;
    }

    // Add player to shortlist
    scout.scoutData.shortlistedPlayers.push(playerId);
    await scout.save();

    res.json({
      success: true,
      message: 'Player added to shortlist successfully'
    } as ApiResponse);
  })
);

// @route   DELETE /api/scouts/:scoutId/shortlist/:playerId
// @desc    Remove player from scout's shortlist
// @access  Private (Scout only)
router.delete('/:scoutId/shortlist/:playerId', 
  validateObjectId,
  requireRole('scout'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { scoutId, playerId } = req.params;

    // Ensure scout can only modify their own shortlist
    if (req.userId !== scoutId) {
      res.status(403).json({
        success: false,
        message: 'You can only modify your own shortlist'
      } as ApiResponse);
    return;
    }

    const scout = await User.findById(scoutId);
    if (!scout || scout.role !== 'scout') {
      res.status(404).json({
        success: false,
        message: 'Scout not found'
      } as ApiResponse);
    return;
    }

    if (!scout.scoutData || !scout.scoutData.shortlistedPlayers.includes(playerId)) {
      res.status(404).json({
        success: false,
        message: 'Player not found in shortlist'
      } as ApiResponse);
    return;
    }

    // Remove player from shortlist
    scout.scoutData.shortlistedPlayers = scout.scoutData.shortlistedPlayers.filter(
      id => id !== playerId
    );
    await scout.save();

    res.json({
      success: true,
      message: 'Player removed from shortlist successfully'
    } as ApiResponse);
  })
);

// @route   POST /api/scout-reports
// @desc    Create a scout report
// @access  Private (Scout only)
router.post('/reports', 
  requireRole('scout'),
  validateScoutReport,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((err: any) => err.msg).join(', ')
      } as ApiResponse);
    return;
    }

    const { playerId, rating, notes, recommendation, strengths, weaknesses, potentialFee } = req.body;

    // Validate player exists and is a player
    const player = await User.findOne({ _id: playerId, role: 'player' });
    if (!player) {
      res.status(404).json({
        success: false,
        message: 'Player not found'
      } as ApiResponse);
    return;
    }

    // Create scout report
    const scoutReport = new ScoutReport({
      scoutId: req.userId,
      playerId,
      rating,
      notes,
      recommendation,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      potentialFee
    });

    await scoutReport.save();

    // Add report to scout's reports list
    const scout = await User.findById(req.userId);
    if (scout?.scoutData) {
      scout.scoutData.reports.push((scoutReport._id as any).toString());
      await scout.save();
    }

    // Populate player and scout info
    await scoutReport.populate('playerId', 'name playerData.position playerData.sport');
    await scoutReport.populate('scoutId', 'name scoutData.clubName');

    res.status(201).json({
      success: true,
      data: scoutReport,
      message: 'Scout report created successfully'
    } as ApiResponse);
    return;
  })
);

// @route   GET /api/scout-reports
// @desc    Get scout reports (by scout or for player)
// @access  Private
router.get('/reports', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { scoutId, playerId, page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  
  if (scoutId) {
    query.scoutId = scoutId;
  }
  
  if (playerId) {
    query.playerId = playerId;
  }

  // If no specific query, only show reports by current user or about current user
  if (!scoutId && !playerId) {
    query.$or = [
      { scoutId: req.userId },
      { playerId: req.userId }
    ];
  }

  const [reports, total] = await Promise.all([
    ScoutReport.find(query)
      .populate('playerId', 'name playerData.position playerData.sport')
      .populate('scoutId', 'name scoutData.clubName')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    ScoutReport.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Scout reports retrieved successfully'
  } as PaginatedResponse<typeof reports[0]>);
}));

export default router;

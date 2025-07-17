import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { validateUpdateProfile, validateObjectId, validateSearch } from '@/middleware/validation';
import { requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse, UpdateProfileRequest } from '@/types';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: user,
    message: 'User profile retrieved successfully'
  } as ApiResponse);
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
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
    return;
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/users/:id
// @desc    Update user profile
// @access  Private
router.patch('/:id', validateObjectId, validateUpdateProfile, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  
  // Users can only update their own profile (or admin in the future)
  if (req.userId !== id) {
    res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    } as ApiResponse);
    return;
  }

  const updateData = req.body as UpdateProfileRequest;
  
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  } as ApiResponse);
}));

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/', validateSearch, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { query, role, location, page = 1, limit = 20 } = req.query;
  
  const searchQuery: any = {};
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (role) {
    searchQuery.role = role;
  }
  
  if (location) {
    searchQuery.$or = [
      { 'clubData.location': { $regex: location, $options: 'i' } },
      { 'playerData.clubName': { $regex: location, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    User.countDocuments(searchQuery)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Users retrieved successfully'
  } as PaginatedResponse<typeof users[0]>);
}));

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  
  // Users can only delete their own account (or admin in the future)
  if (req.userId !== id) {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own account'
    } as ApiResponse);
    return;
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  res.json({
    success: true,
    message: 'Account deleted successfully'
  } as ApiResponse);
}));

export default router;

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { validateLogin, validateRegister } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, LoginRequest, RegisterRequest } from '@/types';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map(err => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { name, email, password, role } = req.body as RegisterRequest;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    } as ApiResponse);
    return;
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role
  });

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: (user._id as any).toString() },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  res.status(201).json({
    success: true,
    data: {
      user,
      token
    },
    message: 'User registered successfully'
  } as ApiResponse);
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map(err => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { email, password } = req.body as LoginRequest;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    } as ApiResponse);
    return;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    } as ApiResponse);
    return;
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: (user._id as any).toString() },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  // Remove password from response
  const userResponse = user.toJSON();

  res.json({
    success: true,
    data: {
      user: userResponse,
      token
    },
    message: 'Login successful'
  } as ApiResponse);
}));

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Token is required'
    } as ApiResponse);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: { user },
      message: 'Token is valid'
    } as ApiResponse);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    } as ApiResponse);
  }
}));

export default router;

import { body, param, query } from 'express-validator';

// Auth validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['player', 'scout', 'coach', 'club'])
    .withMessage('Invalid role')
];

// Post validation
export const validateCreatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

// Comment validation
export const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

// Message validation
export const validateSendMessage = [
  body('receiverId')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Scout report validation
export const validateScoutReport = [
  body('playerId')
    .isMongoId()
    .withMessage('Invalid player ID'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('notes')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Notes must be between 10 and 2000 characters'),
  body('recommendation')
    .isIn(['Highly Recommend', 'Recommend', 'Consider', 'Pass'])
    .withMessage('Invalid recommendation'),
  body('strengths')
    .optional()
    .isArray()
    .withMessage('Strengths must be an array'),
  body('weaknesses')
    .optional()
    .isArray()
    .withMessage('Weaknesses must be an array'),
  body('potentialFee')
    .optional()
    .isNumeric()
    .withMessage('Potential fee must be a number')
];

// User update validation
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL')
];

// ID parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

export const validateConversationId = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID format')
];

export const validatePartnerId = [
  param('partnerId')
    .isMongoId()
    .withMessage('Invalid partner ID format')
];

// Search validation
export const validateSearch = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('role')
    .optional()
    .isIn(['player', 'scout', 'coach', 'club'])
    .withMessage('Invalid role filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

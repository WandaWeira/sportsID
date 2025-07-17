import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Message } from '@/models/Message';
import { User } from '@/models/User';
import { validateSendMessage, validateObjectId, validateConversationId, validatePartnerId } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

const router = Router();

// @route   GET /api/messages
// @desc    Get user's conversations
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get unique conversation partners
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: userObjectId },
          { receiverId: userObjectId }
        ]
      }
    },
    {
      $addFields: {
        partnerId: {
          $cond: {
            if: { $eq: ['$senderId', userObjectId] },
            then: '$receiverId',
            else: '$senderId'
          }
        }
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$partnerId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$receiverId', userObjectId] },
                  { $eq: ['$read', false] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner'
      }
    },
    {
      $unwind: '$partner'
    },
    {
      $project: {
        partner: {
          id: '$partner._id',
          name: '$partner.name',
          profileImage: '$partner.profileImage',
          role: '$partner.role'
        },
        lastMessage: '$lastMessage',
        unreadCount: '$unreadCount'
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);

  res.json({
    success: true,
    data: conversations,
    message: 'Conversations retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', validateSendMessage, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { receiverId, content } = req.body;
  const senderId = req.userId!;

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404).json({
      success: false,
      message: 'Receiver not found'
    } as ApiResponse);
    return;
  }

  // Create message
  const message = new Message({
    senderId,
    receiverId,
    content,
    read: false
  });

  await message.save();
  
  // Populate sender and receiver info
  await message.populate('senderId', 'name profileImage');
  await message.populate('receiverId', 'name profileImage');

  res.status(201).json({
    success: true,
    data: message,
    message: 'Message sent successfully'
  } as ApiResponse);
  return;
}));

// @route   PATCH /api/messages/conversations/:partnerId/mark-read
// @desc    Mark all messages in a conversation as read
// @access  Private
router.patch('/conversations/:partnerId/mark-read', validatePartnerId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { partnerId } = req.params;
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

  // Mark all unread messages from this partner as read
  const result = await Message.updateMany(
    {
      senderId: partnerObjectId,
      receiverId: userObjectId,
      read: false
    },
    { read: true }
  );

  res.json({
    success: true,
    data: { modifiedCount: result.modifiedCount },
    message: 'Conversation marked as read'
  } as ApiResponse);
}));

// @route   DELETE /api/messages/conversations/:partnerId
// @desc    Delete entire conversation with a partner
// @access  Private
router.delete('/conversations/:partnerId', validatePartnerId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { partnerId } = req.params;
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

  // Delete all messages between these two users
  const result = await Message.deleteMany({
    $or: [
      { senderId: userObjectId, receiverId: partnerObjectId },
      { senderId: partnerObjectId, receiverId: userObjectId }
    ]
  });

  res.json({
    success: true,
    data: { deletedCount: result.deletedCount },
    message: 'Conversation deleted successfully'
  } as ApiResponse);
}));

// @route   GET /api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get('/:conversationId', validateConversationId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { conversationId } = req.params;
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const conversationObjectId = new mongoose.Types.ObjectId(conversationId);

  // Find messages where user is either sender or receiver with the conversation partner
  const messages = await Message.find({
    $or: [
      { senderId: userObjectId, receiverId: conversationObjectId },
      { senderId: conversationObjectId, receiverId: userObjectId }
    ]
  })
  .populate('senderId', 'name profileImage')
  .populate('receiverId', 'name profileImage')
  .sort({ createdAt: 1 });

  // Mark messages as read
  await Message.updateMany(
    {
      senderId: conversationObjectId,
      receiverId: userObjectId,
      read: false
    },
    { read: true }
  );

  res.json({
    success: true,
    data: messages,
    message: 'Messages retrieved successfully'
  } as ApiResponse);
}));

// @route   PUT /api/messages/:id
// @desc    Update a message
// @access  Private
router.put('/:id', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const messageId = req.params.id;
  const userId = req.userId!;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Content is required'
    } as ApiResponse);
    return;
  }

  const message = await Message.findOne({
    _id: messageId,
    senderId: userId
  });

  if (!message) {
    res.status(404).json({
      success: false,
      message: 'Message not found or you are not the sender'
    } as ApiResponse);
    return;
  }

  // Check if message is less than 5 minutes old (edit window)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (message.createdAt < fiveMinutesAgo) {
    res.status(400).json({
      success: false,
      message: 'Message can only be edited within 5 minutes of sending'
    } as ApiResponse);
    return;
  }

  message.content = content;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate('senderId', 'name profileImage');
  await message.populate('receiverId', 'name profileImage');

  res.json({
    success: true,
    data: message,
    message: 'Message updated successfully'
  } as ApiResponse);
}));

// @route   DELETE /api/messages/:id
// @desc    Delete a message
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

  const messageId = req.params.id;
  const userId = req.userId!;

  const message = await Message.findOne({
    _id: messageId,
    senderId: userId
  });

  if (!message) {
    res.status(404).json({
      success: false,
      message: 'Message not found or you are not the sender'
    } as ApiResponse);
    return;
  }

  await Message.findByIdAndDelete(messageId);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  } as ApiResponse);
}));

// @route   PATCH /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.patch('/:id/read', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const messageId = req.params.id;
  const userId = req.userId!;

  const message = await Message.findOne({
    _id: messageId,
    receiverId: userId
  });

  if (!message) {
    res.status(404).json({
      success: false,
      message: 'Message not found or you are not the receiver'
    } as ApiResponse);
    return;
  }

  message.read = true;
  await message.save();

  res.json({
    success: true,
    data: message,
    message: 'Message marked as read'
  } as ApiResponse);
}));

export default router;

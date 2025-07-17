import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import { User } from '@/models/User';
import { validateCreatePost, validateCreateComment, validateObjectId } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse, CreatePostRequest } from '@/types';

const router = Router();

// @route   GET /api/posts
// @desc    Get posts feed
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, role, authorId } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  
  // Filter by specific author if specified
  if (authorId) {
    query.authorId = authorId;
  }
  // Filter by role if specified (and no specific author)
  else if (role) {
    const users = await User.find({ role }).select('_id');
    const userIds = users.map((user: any) => user._id);
    query.authorId = { $in: userIds };
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('authorId', 'name role profileImage isVerified')
      .populate({
        path: 'comments',
        populate: {
          path: 'authorId',
          select: 'name profileImage'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Post.countDocuments(query)
  ]);

  // Transform posts to match frontend interface
  const transformedPosts = posts.map((post: any) => {
    const postObj = post.toObject();
    const author = postObj.authorId as any;
    
    return {
      ...postObj,
      id: postObj._id?.toString() || postObj.id,
      authorName: author?.name || 'Unknown User',
      authorRole: author?.role || 'user',
      authorId: author?._id || postObj.authorId,
      likes: postObj.likes.length,
      isLiked: postObj.likes.includes(req.userId),
      shares: postObj.shares || 0,
      comments: postObj.comments.map((comment: any) => ({
        ...comment,
        id: comment._id?.toString() || comment.id,
        authorName: comment.authorId?.name || 'Unknown User',
        authorId: comment.authorId?._id || comment.authorId
      }))
    };
  });

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: transformedPosts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: totalPages
    },
    message: 'Posts retrieved successfully'
  } as PaginatedResponse<typeof transformedPosts[0]>);
}));

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', validateCreatePost, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const { content, tags, media } = req.body as CreatePostRequest;

  const post = new Post({
    authorId: req.userId,
    content,
    tags: tags || [],
    media: media || [],
    likes: [],
    comments: [],
    shares: 0
  });

  await post.save();
  
  // Populate author info
  await post.populate('authorId', 'name role profileImage isVerified');

  // Transform to match frontend interface
  const postObj = post.toObject();
  const author = postObj.authorId as any;
  
  const transformedPost = {
    ...postObj,
    id: postObj._id?.toString() || postObj.id,
    authorName: author?.name || 'Unknown User',
    authorRole: author?.role || 'user',
    authorId: author?._id || postObj.authorId,
    likes: postObj.likes.length,
    isLiked: req.userId ? postObj.likes.includes(req.userId) : false,
    shares: postObj.shares || 0,
    comments: []
  };

  res.status(201).json({
    success: true,
    data: transformedPost,
    message: 'Post created successfully'
  } as ApiResponse);
    return;
}));

// @route   GET /api/posts/:id
// @desc    Get a single post
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

  const post = await Post.findById(req.params.id)
    .populate('authorId', 'name role profileImage isVerified')
    .populate({
      path: 'comments',
      populate: {
        path: 'authorId',
        select: 'name profileImage'
      },
      options: { sort: { createdAt: -1 } }
    });

  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found'
    } as ApiResponse);
    return;
  }

  // Transform post to match frontend interface
  const postObj = post.toObject();
  const author = postObj.authorId as any;
  
  const transformedPost = {
    ...postObj,
    id: postObj._id?.toString() || postObj.id,
    authorName: author?.name || 'Unknown User',
    authorRole: author?.role || 'user',
    authorId: author?._id || postObj.authorId,
    likes: postObj.likes.length,
    isLiked: req.userId ? postObj.likes.includes(req.userId) : false,
    shares: postObj.shares || 0,
    comments: postObj.comments.map((comment: any) => ({
      ...comment,
      id: comment._id?.toString() || comment.id,
      authorName: comment.authorId?.name || 'Unknown User',
      authorId: comment.authorId?._id || comment.authorId
    }))
  };

  res.json({
    success: true,
    data: transformedPost,
    message: 'Post retrieved successfully'
  } as ApiResponse);
}));

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found'
    } as ApiResponse);
    return;
  }

  const userId = req.userId!;
  const isLiked = post.likes.includes(userId as any);

  if (isLiked) {
    // Unlike the post
    post.likes = post.likes.filter((id: any) => id.toString() !== userId);
  } else {
    // Like the post
    post.likes.push(userId as any);
  }

  await post.save();

  res.json({
    success: true,
    data: { 
      liked: !isLiked,
      likesCount: post.likes.length 
    },
    message: isLiked ? 'Post unliked' : 'Post liked'
  } as ApiResponse);
}));

// @route   POST /api/posts/:id/share
// @desc    Share a post (increment share count)
// @access  Private
router.post('/:id/share', validateObjectId, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found'
    } as ApiResponse);
    return;
  }

  // Increment share count
  post.shares = (post.shares || 0) + 1;
  await post.save();

  res.json({
    success: true,
    data: { 
      sharesCount: post.shares 
    },
    message: 'Post shared successfully'
  } as ApiResponse);
}));

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comments', validateObjectId, validateCreateComment, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((err: any) => err.msg).join(', ')
    } as ApiResponse);
    return;
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found'
    } as ApiResponse);
    return;
  }

  const comment = new Comment({
    postId: req.params.id,
    authorId: req.userId,
    content: req.body.content
  });

  await comment.save();
  
  // Add comment to post
  post.comments.push(comment._id as any);
  await post.save();

  // Populate author info
  await comment.populate('authorId', 'name profileImage');

  // Transform comment to match frontend interface
  const commentObj = comment.toObject();
  const author = commentObj.authorId as any;
  
  const transformedComment = {
    ...commentObj,
    id: commentObj._id?.toString() || commentObj.id,
    authorName: author?.name || 'Unknown User',
    authorId: author?._id || commentObj.authorId
  };

  res.status(201).json({
    success: true,
    data: transformedComment,
    message: 'Comment added successfully'
  } as ApiResponse);
    return;
}));

// @route   DELETE /api/posts/:id
// @desc    Delete a post
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

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404).json({
      success: false,
      message: 'Post not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns the post
  if (post.authorId.toString() !== req.userId) {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own posts'
    } as ApiResponse);
    return;
  }

  // Delete associated comments
  await Comment.deleteMany({ postId: req.params.id });
  
  // Delete the post
  await Post.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Post deleted successfully'
  } as ApiResponse);
}));

export default router;

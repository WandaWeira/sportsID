import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  CheckCircle,
  Bookmark,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  useLikePostMutation,
  useSharePostMutation,
  useCommentOnPostMutation,
} from "../../store/api/apiSlice";
import type { Post } from "../../store/api/apiSlice";

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState("");
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [likePost] = useLikePostMutation();
  const [sharePost] = useSharePostMutation();
  const [commentOnPost] = useCommentOnPostMutation();

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = async () => {
    try {
      await likePost(post.id).unwrap();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await commentOnPost({ postId: post.id, content: commentText }).unwrap();
      setCommentText("");
    } catch (error) {
      console.error("Failed to comment:", error);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post.id).unwrap();
      setShowShareMenu(false);
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      setShowShareMenu(false);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "player":
        return "text-blue-600 bg-blue-100";
      case "scout":
        return "text-green-600 bg-green-100";
      case "manager":
        return "text-purple-600 bg-purple-100";
      case "club":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Post header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.authorId}`} className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.authorName?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link
                to={`/profile/${post.authorId}`}
                className="font-semibold text-gray-900 hover:underline"
              >
                {post.authorName || "Unknown User"}
              </Link>
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                  post.authorRole
                )}`}
              >
                {post.authorRole}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                #{tag?.replace("#", "") || "tag"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media content */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-2">
            {post.media.map((media) => (
              <div
                key={media.id}
                className="relative rounded-lg overflow-hidden"
              >
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-auto max-h-96 object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              post.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
            />
            <span className="text-sm">{post.likes || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments?.length || 0}</span>
          </button>

          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share className="w-5 h-5" />
              <span className="text-sm">{post.shares || 0}</span>
            </button>

            {/* Share menu */}
            {showShareMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Share Post</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy Link</span>
                </button>
                <button
                  onClick={() => {
                    window.open(
                      `${window.location.origin}/post/${post.id}`,
                      "_blank"
                    );
                    setShowShareMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Open in New Tab</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="text-gray-500 hover:text-yellow-500 transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Add comment form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-sm font-medium">U</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                />
              </div>
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-3">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">
                    {comment.authorName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="font-medium text-sm text-gray-900">
                      {comment.authorName || "Unknown User"}
                    </p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

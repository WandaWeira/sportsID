import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CreatePost } from "../../components/posts/CreatePost";
import { PostCard } from "../../components/posts/PostCard";
import { FeedTabs } from "../../components/posts/FeedTabs";
import { useGetPostsQuery } from "../../store/api/apiSlice";
import type { RootState } from "../../store";

type FeedTab = "all" | "following" | "trending" | "my-role";

export const HomePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [page, setPage] = useState(1);

  const {
    data: posts,
    isLoading,
    error,
  } = useGetPostsQuery({
    page,
    limit: 10,
    role: activeTab === "my-role" ? user?.role : undefined,
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome section for new users */}
      <div className="bg-gradient-to-r from-sport-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="opacity-90">
          {user.role === "player" &&
            "Share your latest training highlights and connect with scouts."}
          {user.role === "scout" &&
            "Discover new talent and share your latest findings."}
          {user.role === "coach" &&
            "Develop your players and share training insights with the community."}
          {user.role === "club" &&
            "Showcase your club's achievements and connect with players."}
        </p>
      </div>

      {/* Create post */}
      <CreatePost />

      {/* Feed tabs */}
      <FeedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user.role}
      />

      {/* Posts feed */}
      <div className="space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              Failed to load posts. Please try again.
            </p>
          </div>
        )}

        {posts && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to share something with the community!
            </p>
          </div>
        )}

        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Load more button */}
        {posts && posts.length > 0 && (
          <div className="text-center py-4">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              Load more posts
            </button>
          </div>
        )}
      </div>

      {/* Role-specific suggestions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          {user.role === "player" && "Suggested for Players"}
          {user.role === "scout" && "Scouting Opportunities"}
          {user.role === "coach" && "Coaching Tools"}
          {user.role === "club" && "Club Growth"}
        </h3>

        <div className="space-y-3">
          {user.role === "player" && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Complete your player profile</span>
                <button className="text-sport-600 text-sm font-medium">
                  Complete
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Upload training videos</span>
                <button className="text-sport-600 text-sm font-medium">
                  Upload
                </button>
              </div>
            </>
          )}

          {user.role === "scout" && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Review shortlisted players</span>
                <button className="text-sport-600 text-sm font-medium">
                  Review
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Create scout report</span>
                <button className="text-sport-600 text-sm font-medium">
                  Create
                </button>
              </div>
            </>
          )}

          {user.role === "coach" && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Create training plan</span>
                <button className="text-sport-600 text-sm font-medium">
                  Create
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Schedule player assessments</span>
                <button className="text-sport-600 text-sm font-medium">
                  Schedule
                </button>
              </div>
            </>
          )}

          {user.role === "club" && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Post trial events</span>
                <button className="text-sport-600 text-sm font-medium">
                  Post
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Update club information</span>
                <button className="text-sport-600 text-sm font-medium">
                  Update
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

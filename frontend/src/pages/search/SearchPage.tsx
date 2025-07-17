import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  Shield,
  Users,
  Trophy,
  Star,
  MoreVertical,
  UserPlus,
  UserMinus,
  Flag,
  Ban,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MapPin,
  MessageCircle,
} from "lucide-react";
import {
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useReportContentMutation,
  useBlockUserMutation,
} from "../../store/api/apiSlice";
import type { RootState } from "../../store";
import type { User } from "../../store/api/apiSlice";

type SearchTab = "users" | "posts" | "clubs";

interface AdvancedFilters {
  role?: string;
  location?: string;
  verified?: boolean;
  sortBy?: string;
}

interface SearchState {
  query: string;
  tab: SearchTab;
  filters: AdvancedFilters;
  showFilters: boolean;
}

// Enhanced User Card Component
const UserCard: React.FC<{
  user: User;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onBlock?: (userId: string) => void;
}> = ({ user, onFollow, onUnfollow, onReport, onBlock }) => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "player":
        return "bg-blue-100 text-blue-800";
      case "scout":
        return "bg-green-100 text-green-800";
      case "coach":
        return "bg-purple-100 text-purple-800";
      case "club":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "player":
        return <Users className="w-4 h-4" />;
      case "scout":
        return <Shield className="w-4 h-4" />;
      case "coach":
        return <Trophy className="w-4 h-4" />;
      case "club":
        return <Star className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const handleFollow = () => {
    if (isFollowing) {
      onUnfollow?.(user.id);
    } else {
      onFollow?.(user.id);
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {user.isVerified && (
              <Shield className="w-4 h-4 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Link to={`/profile/${user.id}`} className="hover:underline">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h3>
              </Link>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleIcon(user.role)}
                <span className="capitalize">{user.role}</span>
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-2">{user.email}</p>

            {/* Role-specific info */}
            {user.playerData && (
              <div className="text-sm text-gray-500">
                <span>
                  {user.playerData.sport} • {user.playerData.position}
                </span>
                {user.playerData.clubName && (
                  <span> • {user.playerData.clubName}</span>
                )}
              </div>
            )}

            {user.scoutData && user.scoutData.clubName && (
              <div className="text-sm text-gray-500">
                Scout at {user.scoutData.clubName}
              </div>
            )}

            {user.coachData && (
              <div className="text-sm text-gray-500">
                {user.coachData.specialization} Coach
                {user.coachData.clubName && (
                  <span> • {user.coachData.clubName}</span>
                )}
              </div>
            )}

            {user.clubData && (
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span>{user.clubData.location}</span>
                <span>•</span>
                <span>{user.clubData.tier}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser?.id !== user.id && (
            <>
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-sport-600 text-white hover:bg-sport-700"
                }`}
              >
                {isFollowing ? (
                  <UserMinus className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{isFollowing ? "Unfollow" : "Follow"}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => {
                        onReport?.(user.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report User</span>
                    </button>
                    <button
                      onClick={() => {
                        onBlock?.(user.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Block User</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const SearchPage: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    tab: "users",
    filters: {},
    showFilters: false,
  });
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchState.query]);

  // API queries
  const { data: users, isLoading: isLoadingUsers } = useSearchUsersQuery(
    {
      query: debouncedQuery,
      role: searchState.filters.role,
      location: searchState.filters.location,
    },
    { skip: debouncedQuery.length < 2 || searchState.tab !== "users" }
  );

  // Mutations
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [reportContent] = useReportContentMutation();
  const [blockUser] = useBlockUserMutation();

  // Handlers
  const updateSearchState = (updates: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  };

  const updateFilters = (filterUpdates: Partial<AdvancedFilters>) => {
    setSearchState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filterUpdates },
    }));
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await followUser(userId).unwrap();
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await unfollowUser(userId).unwrap();
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  const handleReportUser = async (userId: string) => {
    try {
      await reportContent({
        contentType: "user",
        contentId: userId,
        reason: "inappropriate_behavior",
        description: "Reported from search",
      }).unwrap();
      alert("User reported successfully");
    } catch (error) {
      console.error("Failed to report user:", error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await blockUser(userId).unwrap();
      alert("User blocked successfully");
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const isLoading = searchState.tab === "users" ? isLoadingUsers : false;
  const hasResults = searchState.tab === "users" ? users?.length || 0 : 0;
  const trendingTags = [
    "#training",
    "#scouting",
    "#football",
    "#recruitment",
    "#youth",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for people, posts, clubs..."
              value={searchState.query}
              onChange={(e) => updateSearchState({ query: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport-500 focus:border-sport-500"
            />
          </div>

          <button
            onClick={() =>
              updateSearchState({ showFilters: !searchState.showFilters })
            }
            className={`px-4 py-3 border rounded-lg flex items-center space-x-2 ${
              searchState.showFilters
                ? "bg-sport-50 border-sport-300 text-sport-700"
                : "border-gray-300 text-gray-700"
            } hover:bg-gray-50`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {searchState.showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(["users", "posts", "clubs"] as SearchTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => updateSearchState({ tab })}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                searchState.tab === tab
                  ? "bg-white text-sport-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="capitalize">{tab}</span>
              {searchState.tab === tab && hasResults > 0 && (
                <span className="ml-2 text-xs bg-sport-100 text-sport-600 px-2 py-1 rounded-full">
                  {hasResults}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {searchState.showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {searchState.tab === "users" && (
                <>
                  <select
                    value={searchState.filters.role || ""}
                    onChange={(e) =>
                      updateFilters({ role: e.target.value || undefined })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500"
                  >
                    <option value="">All Roles</option>
                    <option value="player">Players</option>
                    <option value="scout">Scouts</option>
                    <option value="coach">Coaches</option>
                    <option value="club">Clubs</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Location"
                    value={searchState.filters.location || ""}
                    onChange={(e) =>
                      updateFilters({ location: e.target.value || undefined })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500"
                  />

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchState.filters.verified || false}
                      onChange={(e) =>
                        updateFilters({
                          verified: e.target.checked || undefined,
                        })
                      }
                      className="rounded text-sport-600 focus:ring-sport-500"
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                </>
              )}

              <select
                value={searchState.filters.sortBy || "relevance"}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="date">Most Recent</option>
                {searchState.tab === "users" && (
                  <option value="popularity">Most Popular</option>
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </h3>
            <div className="space-y-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => updateSearchState({ query: tag })}
                  className="block w-full text-left p-2 text-sport-600 hover:bg-sport-50 rounded text-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && debouncedQuery.length >= 2 && (
            <>
              {searchState.tab === "users" && (
                <div className="space-y-4">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onFollow={handleFollowUser}
                        onUnfollow={handleUnfollowUser}
                        onReport={handleReportUser}
                        onBlock={handleBlockUser}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No people found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  )}
                </div>
              )}

              {searchState.tab === "posts" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Post Search Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Post search functionality will be available soon
                  </p>
                </div>
              )}

              {searchState.tab === "clubs" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Club Search Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Club search functionality will be available soon
                  </p>
                </div>
              )}
            </>
          )}

          {/* Empty State / Discovery */}
          {!isLoading && debouncedQuery.length < 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Discover Sports Content
              </h3>
              <p className="text-gray-500 mb-6">
                Search for players, scouts, coaches, clubs, and posts to connect
                with the sports community
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["football", "basketball", "scouting", "training"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => updateSearchState({ query: term })}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Calendar,
  Shield,
  Trophy,
  Users,
  Edit,
  Camera,
  Star,
  MessageCircle,
  UserPlus,
  Save,
  X,
  Plus,
  Trash2,
  Play,
  Download,
  Eye,
} from "lucide-react";
import {
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useGetPostsByUserQuery,
  useGetUserMediaQuery,
} from "../../store/api/apiSlice";
import type { RootState } from "../../store";
import type { User } from "../../store/api/apiSlice";
import { PostCard } from "../../components/posts/PostCard";
import { CreatePost } from "../../components/posts/CreatePost";

// Extended MediaFile interface for the media grid
interface MediaGridItemData {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  postId: string;
  postContent: string;
  createdAt: string;
}

// MediaGridItem component for the media gallery
const MediaGridItem: React.FC<{ media: MediaGridItemData }> = ({ media }) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        {media.type === "image" ? (
          <img
            src={media.url}
            alt={media.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full">
            {media.thumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <video
                src={media.url}
                className="w-full h-full object-cover"
                preload="metadata"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-3 text-white transition-opacity">
            <div className="flex justify-between items-start">
              <span className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {media.type.toUpperCase()}
              </span>
              <button className="p-1 bg-black bg-opacity-50 rounded hover:bg-opacity-70">
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs truncate">{media.filename}</p>
              <p className="text-xs opacity-75">{formatFileSize(media.size)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-w-full max-h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-black">
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={media.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1 mr-4">
                    {media.filename}
                  </h3>
                  <a
                    href={media.url}
                    download={media.filename}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatFileSize(media.size)}</span>
                  <span>{formatDate(media.createdAt)}</span>
                </div>
                {media.postContent && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {media.postContent}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "media">(
    "posts"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [deleteProfile, { isLoading: isDeleting }] = useDeleteProfileMutation();

  // If no id provided, show current user's profile
  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  const {
    data: user,
    isLoading,
    error,
  } = userId ? useGetUserByIdQuery(userId) : useGetCurrentUserQuery();

  // Fetch user's posts
  const {
    data: userPosts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useGetPostsByUserQuery({ userId: userId || "" }, { skip: !userId });

  // Fetch user's media
  const {
    data: userMedia,
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useGetUserMediaQuery({ userId: userId || "" }, { skip: !userId });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-600">
            The user profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const handleEditStart = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      playerData: user.playerData ? { ...user.playerData } : undefined,
      scoutData: user.scoutData ? { ...user.scoutData } : undefined,
      coachData: user.coachData ? { ...user.coachData } : undefined,
      clubData: user.clubData ? { ...user.clubData } : undefined,
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!user.id) return;

    try {
      await updateProfile({
        id: user.id,
        ...editForm,
      }).unwrap();
      setIsEditing(false);
      setEditForm({});
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user.id) return;

    try {
      await deleteProfile(user.id).unwrap();
      // Redirect to home or login page after successful deletion
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const updateEditForm = (field: string, value: any, parent?: string) => {
    setEditForm((prev) => {
      if (parent) {
        return {
          ...prev,
          [parent]: {
            ...((prev as any)[parent] || {}),
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-sport-500 to-primary-600 relative">
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 p-1 bg-sport-500 rounded-full text-white hover:bg-sport-600">
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="ml-auto flex space-x-3">
              {isOwnProfile ? (
                <>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleEditSave}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isUpdating ? "Saving..." : "Save"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditStart}
                      className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700 flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => updateEditForm("name", e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-sport-500 focus:outline-none bg-transparent"
                  placeholder="Enter name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
              )}
              {user.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getRoleColor(
                  user.role
                )}`}
              >
                {getRoleIcon(user.role)}
                <span className="capitalize">{user.role}</span>
              </span>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => updateEditForm("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                  placeholder="Email address"
                />
              </div>
            )}

            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="font-medium text-gray-900">
                  {userPosts?.length || 0}
                </span>
                <span>Posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location not specified</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Member since 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Information */}
      {(user.playerData || (isOwnProfile && user.role === "player")) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Player Information
            </h2>
            {isOwnProfile && isEditing && !user.playerData && (
              <button
                onClick={() =>
                  updateEditForm("playerData", {
                    sport: "",
                    position: "",
                    age: 0,
                    status: "Free Agent" as const,
                  })
                }
                className="text-sport-600 hover:text-sport-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Player Info</span>
              </button>
            )}
          </div>

          {(user.playerData || editForm.playerData) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Sport
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.playerData?.sport || ""}
                    onChange={(e) =>
                      updateEditForm("sport", e.target.value, "playerData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    placeholder="e.g., Football, Basketball"
                  />
                ) : (
                  <p className="text-gray-900">{user.playerData?.sport}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Position
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.playerData?.position || ""}
                    onChange={(e) =>
                      updateEditForm("position", e.target.value, "playerData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    placeholder="e.g., Forward, Midfielder"
                  />
                ) : (
                  <p className="text-gray-900">{user.playerData?.position}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Age
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.playerData?.age || ""}
                    onChange={(e) =>
                      updateEditForm(
                        "age",
                        parseInt(e.target.value) || 0,
                        "playerData"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    placeholder="Age"
                    min="16"
                    max="50"
                  />
                ) : (
                  <p className="text-gray-900">{user.playerData?.age}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editForm.playerData?.status || "Free Agent"}
                    onChange={(e) =>
                      updateEditForm("status", e.target.value, "playerData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                  >
                    <option value="Free Agent">Free Agent</option>
                    <option value="Signed">Signed</option>
                    <option value="Looking to be Scouted">
                      Looking to be Scouted
                    </option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.playerData?.status === "Free Agent"
                        ? "bg-green-100 text-green-800"
                        : user.playerData?.status === "Signed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.playerData?.status}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Club
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.playerData?.clubName || ""}
                    onChange={(e) =>
                      updateEditForm("clubName", e.target.value, "playerData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    placeholder="Current club"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.playerData?.clubName || "None"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scout Information */}
      {(user.scoutData || (isOwnProfile && user.role === "scout")) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Scout Information
            </h2>
            {isOwnProfile && isEditing && !user.scoutData && (
              <button
                onClick={() =>
                  updateEditForm("scoutData", {
                    clubName: "",
                    shortlistedPlayers: [],
                    reports: [],
                  })
                }
                className="text-sport-600 hover:text-sport-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scout Info</span>
              </button>
            )}
          </div>

          {(user.scoutData || editForm.scoutData) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Organization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.scoutData?.clubName || ""}
                    onChange={(e) =>
                      updateEditForm("clubName", e.target.value, "scoutData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    placeholder="Organization name"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.scoutData?.clubName || "Independent"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Shortlisted Players
                </label>
                <p className="text-gray-900">
                  {user.scoutData?.shortlistedPlayers?.length || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Reports Created
                </label>
                <p className="text-gray-900">
                  {user.scoutData?.reports?.length || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coach Information */}
      {(user.coachData || (isOwnProfile && user.role === "coach")) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Coach Information
            </h2>
            {isOwnProfile && isEditing && !user.coachData && (
              <button
                onClick={() =>
                  updateEditForm("coachData", {
                    specialization: "",
                    experience: 0,
                    certifications: [],
                    playersCoached: [],
                    achievements: [],
                  })
                }
                className="text-sport-600 hover:text-sport-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coach Info</span>
              </button>
            )}
          </div>

          {(user.coachData || editForm.coachData) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Specialization
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.coachData?.specialization || ""}
                      onChange={(e) =>
                        updateEditForm(
                          "specialization",
                          e.target.value,
                          "coachData"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    >
                      <option value="">Select specialization</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Tactics">Tactics</option>
                      <option value="Youth Development">
                        Youth Development
                      </option>
                      <option value="Technical Skills">Technical Skills</option>
                      <option value="Mental Coaching">Mental Coaching</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {user.coachData?.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Experience (years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.coachData?.experience || ""}
                      onChange={(e) =>
                        updateEditForm(
                          "experience",
                          parseInt(e.target.value) || 0,
                          "coachData"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="Years of experience"
                      min="0"
                      max="50"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.coachData?.experience} years
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Club
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.coachData?.clubName || ""}
                      onChange={(e) =>
                        updateEditForm("clubName", e.target.value, "coachData")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="Current club"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.coachData?.clubName || "Independent"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Players Coached
                  </label>
                  <p className="text-gray-900">
                    {user.coachData?.playersCoached?.length || 0}
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Certifications
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(editForm.coachData?.certifications || []).map(
                      (cert, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={cert}
                            onChange={(e) => {
                              const newCerts = [
                                ...(editForm.coachData?.certifications || []),
                              ];
                              newCerts[index] = e.target.value;
                              updateEditForm(
                                "certifications",
                                newCerts,
                                "coachData"
                              );
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                            placeholder="Certification name"
                          />
                          <button
                            onClick={() => {
                              const newCerts = [
                                ...(editForm.coachData?.certifications || []),
                              ];
                              newCerts.splice(index, 1);
                              updateEditForm(
                                "certifications",
                                newCerts,
                                "coachData"
                              );
                            }}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                    <button
                      onClick={() => {
                        const newCerts = [
                          ...(editForm.coachData?.certifications || []),
                          "",
                        ];
                        updateEditForm("certifications", newCerts, "coachData");
                      }}
                      className="flex items-center space-x-1 text-sport-600 hover:text-sport-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Certification</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.coachData?.certifications &&
                    user.coachData.certifications.length > 0 ? (
                      user.coachData.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No certifications added
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Club Information */}
      {(user.clubData || (isOwnProfile && user.role === "club")) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Club Information
            </h2>
            {isOwnProfile && isEditing && !user.clubData && (
              <button
                onClick={() =>
                  updateEditForm("clubData", {
                    name: "",
                    location: "",
                    foundedYear: new Date().getFullYear(),
                    description: "",
                    verified: false,
                    tier: "",
                    coaches: [],
                    players: [],
                    scouts: [],
                    achievements: [],
                    facilities: [],
                  })
                }
                className="text-sport-600 hover:text-sport-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Club Info</span>
              </button>
            )}
          </div>

          {(user.clubData || editForm.clubData) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Club Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.clubData?.name || ""}
                      onChange={(e) =>
                        updateEditForm("name", e.target.value, "clubData")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="Club name"
                    />
                  ) : (
                    <p className="text-gray-900">{user.clubData?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.clubData?.location || ""}
                      onChange={(e) =>
                        updateEditForm("location", e.target.value, "clubData")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{user.clubData?.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Founded Year
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.clubData?.foundedYear || ""}
                      onChange={(e) =>
                        updateEditForm(
                          "foundedYear",
                          parseInt(e.target.value) || new Date().getFullYear(),
                          "clubData"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="Year founded"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.clubData?.foundedYear}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tier
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.clubData?.tier || ""}
                      onChange={(e) =>
                        updateEditForm("tier", e.target.value, "clubData")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    >
                      <option value="">Select tier</option>
                      <option value="Professional">Professional</option>
                      <option value="Semi-Professional">
                        Semi-Professional
                      </option>
                      <option value="Amateur">Amateur</option>
                      <option value="Youth">Youth</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{user.clubData?.tier}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    League
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.clubData?.league || ""}
                      onChange={(e) =>
                        updateEditForm("league", e.target.value, "clubData")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                      placeholder="League name"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.clubData?.league || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.clubData?.description || ""}
                    onChange={(e) =>
                      updateEditForm("description", e.target.value, "clubData")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                    rows={3}
                    placeholder="Club description..."
                  />
                ) : (
                  <p className="text-gray-900">{user.clubData?.description}</p>
                )}
              </div>

              {/* Facilities */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Facilities
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(editForm.clubData?.facilities || []).map(
                      (facility, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={facility}
                            onChange={(e) => {
                              const newFacilities = [
                                ...(editForm.clubData?.facilities || []),
                              ];
                              newFacilities[index] = e.target.value;
                              updateEditForm(
                                "facilities",
                                newFacilities,
                                "clubData"
                              );
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-sport-500 focus:border-sport-500"
                            placeholder="Facility name"
                          />
                          <button
                            onClick={() => {
                              const newFacilities = [
                                ...(editForm.clubData?.facilities || []),
                              ];
                              newFacilities.splice(index, 1);
                              updateEditForm(
                                "facilities",
                                newFacilities,
                                "clubData"
                              );
                            }}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                    <button
                      onClick={() => {
                        const newFacilities = [
                          ...(editForm.clubData?.facilities || []),
                          "",
                        ];
                        updateEditForm("facilities", newFacilities, "clubData");
                      }}
                      className="flex items-center space-x-1 text-sport-600 hover:text-sport-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Facility</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.clubData?.facilities &&
                    user.clubData.facilities.length > 0 ? (
                      user.clubData.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-sport-100 text-sport-700 rounded-full text-sm"
                        >
                          {facility}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No facilities listed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs for Posts/About/Media */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {["posts", "about", "media"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-sport-500 text-sport-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-6">
              {/* Create post section for own profile */}
              {isOwnProfile && !isEditing && (
                <div className="border-b border-gray-200 pb-6">
                  <CreatePost />
                </div>
              )}

              <div className="space-y-4">
                {isLoadingPosts && (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-lg p-6 animate-pulse"
                      >
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

                {postsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">
                      Failed to load posts. Please try again.
                    </p>
                  </div>
                )}

                {userPosts && userPosts.length === 0 && !isLoadingPosts && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isOwnProfile ? "You haven't" : `${user?.name} hasn't`}{" "}
                      posted anything yet
                    </h3>
                    <p className="text-gray-500">
                      {isOwnProfile
                        ? "Share your first post to get started!"
                        : "Check back later for new posts."}
                    </p>
                  </div>
                )}

                {userPosts?.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
          {activeTab === "about" && (
            <>
              {/* Account Settings (only for own profile) */}
              {isOwnProfile && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Account Settings
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-red-800 mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Generic about section for viewing other profiles */}
              {!isOwnProfile && (
                <div className="text-center py-8">
                  <p className="text-gray-500">About section coming soon</p>
                </div>
              )}
            </>
          )}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Media Statistics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userMedia?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Media</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userMedia?.filter((media) => media.type === "image")
                        .length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userMedia?.filter((media) => media.type === "video")
                        .length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Videos</div>
                  </div>
                </div>
              </div>

              {/* Media Grid */}
              {isLoadingMedia && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              )}

              {mediaError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">
                    Failed to load media. Please try again.
                  </p>
                </div>
              )}

              {userMedia && userMedia.length === 0 && !isLoadingMedia && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No media yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile
                      ? "Start sharing photos and videos in your posts!"
                      : `${user?.name} hasn't shared any media yet.`}
                  </p>
                </div>
              )}

              {userMedia && userMedia.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userMedia.map((media) => (
                    <MediaGridItem
                      key={`${media.postId}-${media.id}`}
                      media={media}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently delete all your data including
              posts, comments, and profile information.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Delete Account"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

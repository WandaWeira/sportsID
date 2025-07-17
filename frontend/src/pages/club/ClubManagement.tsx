import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Settings,
  Users,
  Award,
  MapPin,
  Globe,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Building,
  Shield,
  Trophy,
} from "lucide-react";
import type { RootState } from "../../store";
import {
  useGetClubByIdQuery,
  useUpdateClubMutation,
  useGetClubMembersQuery,
  useRemoveClubMemberMutation,
  useAddClubAchievementMutation,
  useDeleteClubAchievementMutation,
} from "../../store/api/apiSlice";
import type {
  UpdateClubDataRequest,
  ClubAchievement,
} from "../../store/api/apiSlice";

const ClubManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeSection, setActiveSection] = useState<
    "info" | "members" | "achievements" | "settings"
  >("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateClubDataRequest>({});
  const [newAchievement, setNewAchievement] = useState<
    Partial<ClubAchievement>
  >({});
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // API Queries - only call if user ID exists and user is a club
  const { data: clubData, isLoading: clubLoading } = useGetClubByIdQuery(
    user?.id || "",
    { skip: !user?.id || user?.role !== "club" }
  );
  const { data: members, isLoading: membersLoading } = useGetClubMembersQuery(
    user?.id || "",
    { skip: !user?.id || user?.role !== "club" }
  );

  // API Mutations
  const [updateClub] = useUpdateClubMutation();
  const [removeMember] = useRemoveClubMemberMutation();
  const [addAchievement] = useAddClubAchievementMutation();
  const [deleteAchievement] = useDeleteClubAchievementMutation();

  React.useEffect(() => {
    if (clubData) {
      setEditForm({
        name: clubData.name,
        location: clubData.location,
        description: clubData.description,
        website: clubData.website,
        tier: clubData.tier,
        league: clubData.league,
        facilities: clubData.facilities,
      });
    }
  }, [clubData]);

  const handleSaveChanges = async () => {
    try {
      await updateClub({
        id: user?.id || "",
        data: editForm,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update club:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember({
          clubId: user?.id || "",
          userId: memberId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to remove member:", error);
      }
    }
  };

  const handleAddAchievement = async () => {
    if (
      !newAchievement.title ||
      !newAchievement.year ||
      !newAchievement.level
    ) {
      return;
    }

    try {
      await addAchievement({
        clubId: user?.id || "",
        achievement: {
          title: newAchievement.title,
          year: newAchievement.year,
          description: newAchievement.description || "",
          level: newAchievement.level as
            | "Club"
            | "Regional"
            | "National"
            | "International",
        },
      }).unwrap();
      setShowAchievementModal(false);
      setNewAchievement({});
    } catch (error) {
      console.error("Failed to add achievement:", error);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      try {
        await deleteAchievement({
          clubId: user?.id || "",
          achievementId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete achievement:", error);
      }
    }
  };

  const InfoSection: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Club Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-3 py-1.5 text-sm text-sport-600 hover:text-sport-700"
        >
          {isEditing ? (
            <X className="h-4 w-4 mr-1" />
          ) : (
            <Edit className="h-4 w-4 mr-1" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            ) : (
              <p className="text-gray-900">{clubData?.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isEditing ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={editForm.location || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
            ) : (
              <p className="text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {clubData?.location}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founded Year
            </label>
            <p className="text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              {clubData?.foundedYear}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tier
            </label>
            {isEditing ? (
              <select
                value={editForm.tier || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, tier: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
              >
                <option value="">Select Tier</option>
                <option value="Professional">Professional</option>
                <option value="Semi-Professional">Semi-Professional</option>
                <option value="Amateur">Amateur</option>
                <option value="Youth">Youth</option>
              </select>
            ) : (
              <p className="text-gray-900">{clubData?.tier}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              League
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.league || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, league: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            ) : (
              <p className="text-gray-900">
                {clubData?.league || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            {isEditing ? (
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={editForm.website || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
            ) : (
              <p className="text-gray-900">
                {clubData?.website ? (
                  <a
                    href={clubData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sport-600 hover:text-sport-700 flex items-center"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    {clubData.website}
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
            />
          ) : (
            <p className="text-gray-900">
              {clubData?.description || "No description provided."}
            </p>
          )}
        </div>

        {/* Facilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facilities
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                placeholder="Add facility (press Enter to add)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value.trim();
                    if (value && !editForm.facilities?.includes(value)) {
                      setEditForm({
                        ...editForm,
                        facilities: [...(editForm.facilities || []), value],
                      });
                      e.currentTarget.value = "";
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {editForm.facilities?.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sport-100 text-sport-800"
                  >
                    {facility}
                    <button
                      onClick={() => {
                        const newFacilities = editForm.facilities?.filter(
                          (_, i) => i !== index
                        );
                        setEditForm({ ...editForm, facilities: newFacilities });
                      }}
                      className="ml-1 text-sport-600 hover:text-sport-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {clubData?.facilities && clubData.facilities.length > 0 ? (
                clubData.facilities.map((facility: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Building className="h-3 w-3 mr-1" />
                    {facility}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No facilities listed</p>
              )}
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Status
          </label>
          <div className="flex items-center">
            <Shield
              className={`h-5 w-5 mr-2 ${
                clubData?.verified ? "text-green-500" : "text-gray-400"
              }`}
            />
            <span
              className={`font-medium ${
                clubData?.verified ? "text-green-800" : "text-gray-600"
              }`}
            >
              {clubData?.verified ? "Verified Club" : "Pending Verification"}
            </span>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveChanges}
              className="flex items-center px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MembersSection: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Member Management
        </h2>
      </div>
      <div className="p-6">
        {members && members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={member.profileImage || "/default-avatar.png"}
                    alt={member.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="capitalize">{member.role}</span>
                      {member.position && (
                        <>
                          <span>•</span>
                          <span>{member.position}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {member.isVerified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.status === "active"
                        ? "bg-green-100 text-green-800"
                        : member.status === "inactive"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {member.status || "active"}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No members yet.</p>
        )}
      </div>
    </div>
  );

  const AchievementsSection: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Club Achievements
        </h2>
        <button
          onClick={() => setShowAchievementModal(true)}
          className="flex items-center px-3 py-1.5 bg-sport-600 text-white rounded-md hover:bg-sport-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Achievement
        </button>
      </div>
      <div className="p-6">
        {clubData?.achievements && clubData.achievements.length > 0 ? (
          <div className="space-y-4">
            {clubData.achievements.map((achievement: any) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {achievement.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{achievement.year}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          achievement.level === "International"
                            ? "bg-purple-100 text-purple-800"
                            : achievement.level === "National"
                            ? "bg-blue-100 text-blue-800"
                            : achievement.level === "Regional"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {achievement.level}
                      </span>
                    </div>
                    {achievement.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAchievement(achievement.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No achievements recorded yet.
          </p>
        )}
      </div>
    </div>
  );

  // Check if user is authenticated and is a club
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">
            Please log in to access club management.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "club") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">
            Access denied. Only club accounts can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (clubLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Club Management</h1>
        <p className="text-gray-600">
          Manage your club's information, members, and achievements
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "info", label: "Club Information", icon: Settings },
            { id: "members", label: "Members", icon: Users },
            { id: "achievements", label: "Achievements", icon: Award },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? "border-sport-500 text-sport-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeSection === "info" && <InfoSection />}
      {activeSection === "members" && <MembersSection />}
      {activeSection === "achievements" && <AchievementsSection />}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAchievement.title || ""}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={newAchievement.year || ""}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={newAchievement.level || ""}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      level: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                >
                  <option value="">Select Level</option>
                  <option value="Club">Club</option>
                  <option value="Regional">Regional</option>
                  <option value="National">National</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAchievement.description || ""}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAchievement}
                disabled={
                  !newAchievement.title ||
                  !newAchievement.year ||
                  !newAchievement.level
                }
                className="px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;

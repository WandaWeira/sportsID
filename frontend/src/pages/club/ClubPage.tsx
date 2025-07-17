import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Users,
  MapPin,
  Calendar,
  Trophy,
  Star,
  Plus,
  Settings,
  Eye,
  MessageCircle,
  Share2,
  Building,
  Award,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";

interface ClubMember {
  id: string;
  name: string;
  role: "player" | "coach" | "scout" | "manager";
  position?: string;
  joinDate: string;
  avatar?: string;
  isVerified: boolean;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: "match" | "training" | "meeting" | "tournament";
  description: string;
  location?: string;
}

interface ClubAchievement {
  id: string;
  title: string;
  year: string;
  description: string;
  level: "Local" | "Regional" | "National" | "International";
}

export const ClubPage: React.FC = () => {
  const { clubId } = useParams();
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "events" | "achievements"
  >("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock club data - in real app, this would come from API
  const clubData = {
    id: clubId || "1",
    name: "Manchester United Academy",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png",
    description:
      "One of the world's most prestigious football academies, developing the next generation of football talent since 1892.",
    location: "Manchester, United Kingdom",
    founded: "1892",
    website: "https://manutd.com",
    memberCount: 156,
    followersCount: 12500,
    isVerified: true,
    coverImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=400&fit=crop",
    stats: {
      trophies: 68,
      activePlayers: 89,
      coachingStaff: 24,
      graduatedPlayers: 245,
    },
  };

  const members: ClubMember[] = [
    {
      id: "1",
      name: "John Smith",
      role: "player",
      position: "Midfielder",
      joinDate: "2023-08-15",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      isVerified: true,
    },
    {
      id: "2",
      name: "Sarah Wilson",
      role: "coach",
      position: "Head Coach",
      joinDate: "2020-06-01",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      isVerified: true,
    },
    {
      id: "3",
      name: "Mike Johnson",
      role: "scout",
      joinDate: "2021-03-10",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      isVerified: false,
    },
    {
      id: "4",
      name: "David Brown",
      role: "manager",
      position: "Academy Director",
      joinDate: "2019-01-15",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      isVerified: true,
    },
  ];

  const events: ClubEvent[] = [
    {
      id: "1",
      title: "Youth League Final",
      date: "2024-01-25",
      type: "match",
      description: "Championship final against Liverpool Academy",
      location: "Old Trafford, Manchester",
    },
    {
      id: "2",
      title: "Weekly Training Session",
      date: "2024-01-20",
      type: "training",
      description: "Tactical preparation for upcoming matches",
      location: "Carrington Training Ground",
    },
    {
      id: "3",
      title: "Coaches Meeting",
      date: "2024-01-22",
      type: "meeting",
      description: "Monthly coaching staff coordination meeting",
    },
  ];

  const achievements: ClubAchievement[] = [
    {
      id: "1",
      title: "Premier League Youth Championship",
      year: "2023",
      description: "Won the U18 Premier League Championship",
      level: "National",
    },
    {
      id: "2",
      title: "UEFA Youth League Semi-Final",
      year: "2023",
      description: "Reached semi-finals in European competition",
      level: "International",
    },
    {
      id: "3",
      title: "FA Youth Cup Winners",
      year: "2022",
      description: "Claimed the prestigious FA Youth Cup",
      level: "National",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "player":
        return "bg-sport-100 text-sport-700";
      case "coach":
        return "bg-green-100 text-green-700";
      case "scout":
        return "bg-blue-100 text-blue-700";
      case "manager":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "match":
        return "bg-red-100 text-red-700";
      case "training":
        return "bg-green-100 text-green-700";
      case "meeting":
        return "bg-blue-100 text-blue-700";
      case "tournament":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "International":
        return "bg-gold-100 text-gold-700";
      case "National":
        return "bg-silver-100 text-silver-700";
      case "Regional":
        return "bg-bronze-100 text-bronze-700";
      case "Local":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cover Image & Club Info */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${clubData.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end gap-4">
              <img
                src={clubData.logo}
                alt={clubData.name}
                className="w-16 h-16 rounded-lg bg-white p-2 shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-white">
                    {clubData.name}
                  </h1>
                  {clubData.isVerified && (
                    <div className="bg-blue-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {clubData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Founded {clubData.founded}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {clubData.memberCount} members
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 max-w-3xl">{clubData.description}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-sport-600 text-white hover:bg-sport-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {clubData.stats.trophies}
              </p>
              <p className="text-sm text-gray-600">Trophies</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-sport-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {clubData.stats.activePlayers}
              </p>
              <p className="text-sm text-gray-600">Active Players</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Building className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {clubData.stats.coachingStaff}
              </p>
              <p className="text-sm text-gray-600">Coaching Staff</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {clubData.stats.graduatedPlayers}
              </p>
              <p className="text-sm text-gray-600">Graduated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: Eye },
              { id: "members", label: "Members", icon: Users },
              { id: "events", label: "Events", icon: Calendar },
              { id: "achievements", label: "Achievements", icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-sport-500 text-sport-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: "New player joined",
                        user: "Alex Thompson",
                        time: "2 hours ago",
                      },
                      {
                        action: "Match result updated",
                        user: "System",
                        time: "1 day ago",
                      },
                      {
                        action: "Training session scheduled",
                        user: "Coach Wilson",
                        time: "2 days ago",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-sport-100 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-sport-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600">
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Win Rate (This Season)
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        78%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Average Age
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        17.2 years
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Next Match
                      </span>
                      <span className="text-sm font-bold text-sport-600">
                        Jan 25, 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Club Members
                </h3>
                <button className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${member.name}&background=0ea5e9&color=fff`
                        }
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-medium text-gray-900">
                            {member.name}
                          </h4>
                          {member.isVerified && (
                            <Star className="w-4 h-4 text-blue-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {member.position || member.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        Joined {new Date(member.joinDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
                <button className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {event.title}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {event.date}
                        </p>
                        <button className="text-sport-600 hover:text-sport-700 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Club Achievements
                </h3>
                <button className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-medium text-gray-900">
                            {achievement.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {achievement.year}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getLevelColor(
                            achievement.level
                          )}`}
                        >
                          {achievement.level}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

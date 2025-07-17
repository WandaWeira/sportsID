import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Plus,
  Target,
  Edit,
  Trash2,
  Eye,
  Search,
} from "lucide-react";
import type { RootState } from "../../store";
import {
  useGetCoachStatsQuery,
  useGetTrainingSessionsQuery,
  useGetPlayerAssessmentsQuery,
  useGetMyPlayersQuery,
  useDeleteTrainingSessionMutation,
  useDeletePlayerAssessmentMutation,
  useRemovePlayerFromTeamMutation,
} from "../../store/api/apiSlice";
// Modal Components
import {
  TrainingSessionModal,
  PlayerAssessmentModal,
  TrainingSessionDetails,
  PlayerAssessmentDetails,
  AddPlayerModal,
} from "../../components/coach";

export const CoachDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<
    "overview" | "sessions" | "assessments" | "players"
  >("overview");
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(
    null
  );
  const [sessionsFilter, setSessionsFilter] = useState<
    "all" | "scheduled" | "completed" | "cancelled"
  >("all");

  // API Queries
  const {
    data: coachStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetCoachStatsQuery(user?.id || "", {
    skip: !user?.id,
  });
  const {
    data: trainingSessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useGetTrainingSessionsQuery(
    {
      coachId: user?.id || "",
      status: sessionsFilter === "all" ? undefined : sessionsFilter,
    },
    {
      skip: !user?.id,
    }
  );
  const {
    data: playerAssessments = [],
    isLoading: assessmentsLoading,
    error: assessmentsError,
  } = useGetPlayerAssessmentsQuery(
    {
      coachId: user?.id || "",
    },
    {
      skip: !user?.id,
    }
  );
  const {
    data: myPlayers = [],
    isLoading: playersLoading,
    error: playersError,
  } = useGetMyPlayersQuery(user?.id || "", {
    skip: !user?.id,
  });

  // Ensure myPlayers is always an array
  const playersArray = Array.isArray(myPlayers) ? myPlayers : [];

  // Mutations
  const [deleteTrainingSession] = useDeleteTrainingSessionMutation();
  const [deletePlayerAssessment] = useDeletePlayerAssessmentMutation();
  const [removePlayerFromTeam] = useRemovePlayerFromTeamMutation();

  const coachData = user?.coachData;

  if (!coachData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Coach Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Please complete your coaching profile to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Players Coached",
      value: playersLoading ? "..." : playersArray.length,
      icon: Users,
      color: "text-sport-600",
    },
    {
      label: "Training Sessions",
      value: statsLoading ? "..." : coachStats?.totalSessions || 0,
      icon: Calendar,
      color: "text-primary-600",
    },
    {
      label: "Assessments",
      value: statsLoading ? "..." : coachStats?.completedAssessments || 0,
      icon: FileText,
      color: "text-green-600",
    },
    {
      label: "Average Rating",
      value: statsLoading
        ? "..."
        : coachStats?.averageRating?.toFixed(1) || "0.0",
      icon: Target,
      color: "text-yellow-600",
    },
  ];

  const handleDeleteSession = async (sessionId: string) => {
    if (
      window.confirm("Are you sure you want to delete this training session?")
    ) {
      try {
        await deleteTrainingSession({
          coachId: user?.id || "",
          sessionId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert("Failed to delete training session. Please try again.");
      }
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        await deletePlayerAssessment({
          coachId: user?.id || "",
          assessmentId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete assessment:", error);
        alert("Failed to delete assessment. Please try again.");
      }
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${playerName} from your team?`
      )
    ) {
      try {
        await removePlayerFromTeam({
          coachId: user?.id || "",
          playerId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to remove player:", error);
        alert("Failed to remove player. Please try again.");
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsError ? (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">
              Failed to load coach statistics
            </p>
          </div>
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Training Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Training Sessions
            </h2>
            <button
              onClick={() => setActiveTab("sessions")}
              className="text-sport-600 hover:text-sport-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {sessionsLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading training sessions...
              </div>
            ) : sessionsError ? (
              <div className="text-center py-4 text-red-500">
                <p>Failed to load training sessions</p>
                <p className="text-sm">
                  Please check your connection and try again
                </p>
              </div>
            ) : trainingSessions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No training sessions yet
              </div>
            ) : (
              trainingSessions.slice(0, 3).map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString()} •{" "}
                      {session.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {session.participants?.length || 0} players
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        session.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Assessments
            </h2>
            <button
              onClick={() => setActiveTab("assessments")}
              className="text-sport-600 hover:text-sport-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {assessmentsLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading assessments...
              </div>
            ) : assessmentsError ? (
              <div className="text-center py-4 text-red-500">
                <p>Failed to load assessments</p>
                <p className="text-sm">
                  Please check your connection and try again
                </p>
              </div>
            ) : playerAssessments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No assessments yet
              </div>
            ) : (
              playerAssessments.slice(0, 3).map((assessment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {assessment.playerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assessment.type} •{" "}
                      {new Date(assessment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rating: {assessment.overallRating}/10
                    </p>
                    <p className="text-sm text-gray-600">
                      {assessment.playerPosition}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTrainingModal(true)}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 text-sport-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Schedule Training</p>
              <p className="text-sm text-gray-600">Plan your next session</p>
            </div>
          </button>

          <button
            onClick={() => setShowAssessmentModal(true)}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5 text-sport-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Player Assessment</p>
              <p className="text-sm text-gray-600">
                Evaluate player performance
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Users className="w-5 h-5 text-sport-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Players</p>
              <p className="text-sm text-gray-600">Recruit new team members</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("players")}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp className="w-5 h-5 text-sport-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Player Progress</p>
              <p className="text-sm text-gray-600">View detailed stats</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTrainingSessions = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Training Sessions
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={sessionsFilter}
            onChange={(e) => setSessionsFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Sessions</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setShowTrainingModal(true)}
            className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>

      {sessionsLoading ? (
        <div className="text-center py-8">Loading sessions...</div>
      ) : sessionsError ? (
        <div className="text-center py-8">
          <div className="text-red-500">
            <p>Failed to load training sessions</p>
            <p className="text-sm mt-2">
              Please check your connection and try again
            </p>
          </div>
        </div>
      ) : trainingSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No training sessions found. Create your first session to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Duration
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Participants
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {trainingSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.title}
                      </p>
                      <p className="text-sm text-gray-600">{session.type}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {session.duration} min
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {session.participants?.length || 0}/
                    {session.maxParticipants}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        session.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : session.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSession(session.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          /* TODO: Edit session */
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPlayerAssessments = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Player Assessments
        </h2>
        <button
          onClick={() => setShowAssessmentModal(true)}
          className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {assessmentsLoading ? (
        <div className="text-center py-8">Loading assessments...</div>
      ) : assessmentsError ? (
        <div className="text-center py-8">
          <div className="text-red-500">
            <p>Failed to load player assessments</p>
            <p className="text-sm mt-2">
              Please check your connection and try again
            </p>
          </div>
        </div>
      ) : playerAssessments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No player assessments found. Create your first assessment to get
          started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Player
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Position
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Rating
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {playerAssessments.map((assessment) => (
                <tr key={assessment.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {assessment.playerName}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {assessment.playerPosition}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {assessment.type}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(assessment.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-sm font-medium ${
                        assessment.overallRating >= 8
                          ? "text-green-600"
                          : assessment.overallRating >= 6
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {assessment.overallRating}/10
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAssessment(assessment.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          /* TODO: Edit assessment */
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMyPlayers = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Players</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Players
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playersLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">Loading players...</div>
          </div>
        ) : playersError ? (
          <div className="col-span-full text-center py-8">
            <div className="text-red-500">
              <p>Failed to load players</p>
              <p className="text-sm mt-2">
                Please check your connection and try again
              </p>
            </div>
          </div>
        ) : playersArray.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No players assigned yet. Use the "Add Players" button to recruit
            team members.
          </div>
        ) : (
          playersArray.map((player) => (
            <div
              key={player.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {player.profileImage ? (
                    <img
                      src={player.profileImage}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{player.name}</h3>
                  <p className="text-sm text-gray-600">
                    {player.playerData?.position}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="text-gray-900">
                    {player.playerData?.age}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`${
                      player.playerData?.status === "Signed"
                        ? "text-green-600"
                        : player.playerData?.status === "Free Agent"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {player.playerData?.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowAssessmentModal(true)}
                  className="flex-1 bg-sport-600 text-white py-2 px-3 rounded text-sm hover:bg-sport-700"
                >
                  Assess
                </button>
                <button className="flex-1 border border-gray-300 py-2 px-3 rounded text-sm hover:bg-gray-50">
                  View Progress
                </button>
                <button
                  onClick={() => handleRemovePlayer(player.id, player.name)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  title="Remove from team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Coach Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-sport-600">
                Specialization:
              </span>
              <span className="text-sm text-gray-700">
                {coachData.specialization}
              </span>
            </div>
            {coachData.clubName && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-sport-600">
                  Club:
                </span>
                <span className="text-sm text-gray-700">
                  {coachData.clubName}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowTrainingModal(true)}
            className="bg-sport-600 text-white px-4 py-2 rounded-lg hover:bg-sport-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Training Session
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "sessions", label: "Training Sessions", icon: Calendar },
              { id: "assessments", label: "Assessments", icon: FileText },
              { id: "players", label: "My Players", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-sport-500 text-sport-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "sessions" && renderTrainingSessions()}
          {activeTab === "assessments" && renderPlayerAssessments()}
          {activeTab === "players" && renderMyPlayers()}
        </div>
      </div>

      {/* Modals */}
      {showTrainingModal && (
        <TrainingSessionModal
          onClose={() => setShowTrainingModal(false)}
          coachId={user?.id || ""}
        />
      )}

      {showAssessmentModal && (
        <PlayerAssessmentModal
          onClose={() => setShowAssessmentModal(false)}
          players={playersArray}
          coachId={user?.id || ""}
        />
      )}

      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={() => setShowAddPlayerModal(false)}
          coachId={user?.id || ""}
          coachClubId={coachData.clubId}
        />
      )}

      {selectedSession && (
        <TrainingSessionDetails
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {selectedAssessment && (
        <PlayerAssessmentDetails
          assessmentId={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
        />
      )}
    </div>
  );
};

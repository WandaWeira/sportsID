import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  UserPlus,
  MapPin,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import type { RootState } from "../../store";
import {
  useGetClubStatsQuery,
  useGetClubMembersQuery,
  useGetClubEventsQuery,
  useGetJoinRequestsQuery,
  useRespondToJoinRequestMutation,
  useCreateClubEventMutation,
  useUpdateClubEventMutation,
  useDeleteClubEventMutation,
} from "../../store/api/apiSlice";
import type {
  ClubEvent,
  CreateClubEventRequest,
  JoinRequest,
} from "../../store/api/apiSlice";
import EventModal from "../../components/club/EventModal";

const ClubDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "events" | "requests"
  >("overview");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);

  // API Queries - only call if user ID exists and user is a club
  const { data: clubStats, isLoading: statsLoading } = useGetClubStatsQuery(
    user?.id || "",
    { skip: !user?.id || user?.role !== "club" }
  );
  const { data: members, isLoading: membersLoading } = useGetClubMembersQuery(
    user?.id || "",
    { skip: !user?.id || user?.role !== "club" }
  );
  const { data: events, isLoading: eventsLoading } = useGetClubEventsQuery(
    user?.id || "",
    { skip: !user?.id || user?.role !== "club" }
  );
  const { data: joinRequests, isLoading: requestsLoading } =
    useGetJoinRequestsQuery(user?.id || "", {
      skip: !user?.id || user?.role !== "club",
    });

  // API Mutations
  const [respondToJoinRequest] = useRespondToJoinRequestMutation();
  const [createEvent] = useCreateClubEventMutation();
  const [updateEvent] = useUpdateClubEventMutation();
  const [deleteEvent] = useDeleteClubEventMutation();

  const handleJoinRequestResponse = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await respondToJoinRequest({
        clubId: user?.id || "",
        requestId,
        status,
      }).unwrap();
    } catch (error) {
      console.error("Failed to respond to join request:", error);
    }
  };

  const handleCreateEvent = async (eventData: CreateClubEventRequest) => {
    try {
      await createEvent({
        clubId: user?.id || "",
        eventData,
      }).unwrap();
      setShowEventModal(false);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleUpdateEvent = async (
    eventId: string,
    data: Partial<CreateClubEventRequest>
  ) => {
    try {
      await updateEvent({
        clubId: user?.id || "",
        eventId,
        data,
      }).unwrap();
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent({
          clubId: user?.id || "",
          eventId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const EventCard: React.FC<{ event: ClubEvent }> = ({ event }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === "scheduled"
                  ? "bg-blue-100 text-blue-800"
                  : event.status === "ongoing"
                  ? "bg-green-100 text-green-800"
                  : event.status === "completed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {event.status}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.type === "match"
                  ? "bg-sport-100 text-sport-800"
                  : event.type === "training"
                  ? "bg-green-100 text-green-800"
                  : event.type === "tournament"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {event.type}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingEvent(event)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteEvent(event.id)}
            className="p-2 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const JoinRequestCard: React.FC<{ request: JoinRequest }> = ({ request }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={request.profileImage || "/default-avatar.png"}
            alt={request.userName}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{request.userName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{request.userRole}</span>
              <span>•</span>
              <span>{new Date(request.requestDate).toLocaleDateString()}</span>
            </div>
            {request.message && (
              <p className="text-sm text-gray-600 mt-1">{request.message}</p>
            )}
          </div>
        </div>
        {request.status === "pending" && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleJoinRequestResponse(request.id, "approved")}
              className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </button>
            <button
              onClick={() => handleJoinRequestResponse(request.id, "rejected")}
              className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </button>
          </div>
        )}
        {request.status !== "pending" && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              request.status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {request.status}
          </span>
        )}
      </div>
    </div>
  );

  // Check if user is authenticated and is a club
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">
            Please log in to access the club dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "club") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">
            Access denied. This page is only available to club accounts.
          </p>
        </div>
      </div>
    );
  }

  if (statsLoading || membersLoading || eventsLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Club Dashboard</h1>
          <p className="text-gray-600">{user?.clubData?.name}</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "members", label: "Members", icon: Users },
            { id: "events", label: "Events", icon: Calendar },
            { id: "requests", label: "Join Requests", icon: UserPlus },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-sport-500 text-sport-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.id === "requests" && joinRequests && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {joinRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Members"
              value={clubStats?.totalMembers || 0}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Players"
              value={clubStats?.totalPlayers || 0}
              icon={Trophy}
              color="bg-green-500"
            />
            <StatCard
              title="Upcoming Events"
              value={clubStats?.upcomingEvents || 0}
              icon={Calendar}
              color="bg-purple-500"
            />
            <StatCard
              title="Join Requests"
              value={clubStats?.membershipRequests || 0}
              icon={UserPlus}
              color="bg-orange-500"
            />
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Events
              </h2>
            </div>
            <div className="p-6">
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No events yet. Create your first event!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Club Members
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
                        className="h-10 w-10 rounded-full"
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
                            Joined{" "}
                            {new Date(member.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No members yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Club Events</h2>
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center px-3 py-1.5 bg-sport-600 text-white rounded-md hover:bg-sport-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </button>
          </div>
          <div className="p-6">
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No events scheduled. Create your first event!
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Join Requests
            </h2>
          </div>
          <div className="p-6">
            {joinRequests && joinRequests.length > 0 ? (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <JoinRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No join requests at the moment.</p>
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={handleCreateEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
      />

      {/* Edit Event Modal */}
      <EventModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSubmit={(data) =>
          editingEvent && handleUpdateEvent(editingEvent.id, data)
        }
        event={editingEvent}
        isEditing={true}
      />
    </div>
  );
};

export default ClubDashboard;

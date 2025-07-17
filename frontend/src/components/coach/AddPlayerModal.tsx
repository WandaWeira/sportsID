import React, { useState } from "react";
import {
  X,
  Search,
  UserPlus,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Users,
} from "lucide-react";
import {
  useSearchAvailablePlayersQuery,
  useAddPlayerToTeamMutation,
  useSendPlayerInvitationMutation,
} from "../../store/api/apiSlice";
import type { User } from "../../store/api/apiSlice";

interface AddPlayerModalProps {
  onClose: () => void;
  coachId: string;
  coachClubId?: string;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  onClose,
  coachId: _coachId,
  coachClubId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // API queries
  const {
    data: availablePlayers = [],
    isLoading,
    error,
  } = useSearchAvailablePlayersQuery({
    query: searchTerm,
    position: selectedPosition || undefined,
    location: undefined,
  });

  const [addPlayerToTeam, { isLoading: isAdding }] =
    useAddPlayerToTeamMutation();
  const [sendInvitation, { isLoading: isSending }] =
    useSendPlayerInvitationMutation();

  const handleAddPlayer = async (player: User) => {
    try {
      if (
        player.playerData?.clubId &&
        player.playerData.clubId !== coachClubId
      ) {
        // Player is already signed to another club, send invitation instead
        setSelectedPlayer(player);
        setShowInviteForm(true);
      } else {
        // Direct add for free agents or same club players
        await addPlayerToTeam({
          playerId: player.id,
        }).unwrap();
        alert(`${player.name} has been successfully added to your team!`);
        onClose();
      }
    } catch (error) {
      console.error("Failed to add player:", error);
      alert("Failed to add player to team. Please try again.");
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedPlayer) return;

    try {
      await sendInvitation({
        playerId: selectedPlayer.id,
        message: invitationMessage,
      }).unwrap();
      alert(`Invitation sent to ${selectedPlayer.name} successfully!`);
      setShowInviteForm(false);
      setSelectedPlayer(null);
      setInvitationMessage("");
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      alert("Failed to send invitation. Please try again.");
    }
  };

  const getPlayerStatusColor = (status: string) => {
    switch (status) {
      case "Free Agent":
        return "bg-green-100 text-green-800";
      case "Signed":
        return "bg-blue-100 text-blue-800";
      case "Looking to be Scouted":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showInviteForm && selectedPlayer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Send Invitation
            </h2>
            <button
              onClick={() => {
                setShowInviteForm(false);
                setSelectedPlayer(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedPlayer.profileImage ? (
                    <img
                      src={selectedPlayer.profileImage}
                      alt={selectedPlayer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedPlayer.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPlayer.playerData?.position} •{" "}
                    {selectedPlayer.playerData?.sport}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  This player is currently signed with{" "}
                  <span className="font-medium">
                    {selectedPlayer.playerData?.clubName}
                  </span>
                  . Sending an invitation will notify them of your interest.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Message (Optional)
              </label>
              <textarea
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sport-500 focus:border-sport-500"
                placeholder="Hi! I'm interested in having you join our team. Would you like to discuss this opportunity?"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setSelectedPlayer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitation}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-sport-600 text-white rounded-md text-sm font-medium hover:bg-sport-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {isSending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Players to Team
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-sport-500 focus:border-sport-500"
              />
            </div>

            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sport-500 focus:border-sport-500"
            >
              <option value="">All Sports</option>
              <option value="Football">Football</option>
              <option value="Basketball">Basketball</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Cricket">Cricket</option>
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-sport-500 focus:border-sport-500"
            >
              <option value="">All Positions</option>
              <option value="Forward">Forward</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Defender">Defender</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Point Guard">Point Guard</option>
              <option value="Shooting Guard">Shooting Guard</option>
              <option value="Center">Center</option>
            </select>
          </div>
        </div>

        {/* Players List */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {" "}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Searching for players...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">
                <p>Failed to search for players</p>
                <p className="text-sm mt-2">
                  Please check your connection and try again
                </p>
              </div>
            </div>
          ) : availablePlayers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                No players found matching your criteria
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlayers.map((player: User) => (
                <div
                  key={player.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
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
                        <h3 className="font-medium text-gray-900 flex items-center gap-2">
                          {player.name}
                          {player.isVerified && (
                            <Shield className="w-4 h-4 text-blue-500" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {player.playerData?.position} •{" "}
                          {player.playerData?.sport}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPlayerStatusColor(
                        player.playerData?.status || ""
                      )}`}
                    >
                      {player.playerData?.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Age: {player.playerData?.age}</span>
                    </div>
                    {player.playerData?.clubName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Current Club: {player.playerData.clubName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddPlayer(player)}
                    disabled={isAdding}
                    className="w-full bg-sport-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-sport-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {player.playerData?.clubId &&
                    player.playerData.clubId !== coachClubId
                      ? "Send Invitation"
                      : "Add to Team"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

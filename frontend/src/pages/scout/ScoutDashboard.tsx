import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  FileText,
  Star,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Calendar,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";
import {
  useGetShortlistedPlayersQuery,
  useCreateScoutReportMutation,
  useGetPlayersByPositionQuery,
} from "../../store/api/apiSlice";
import type { RootState } from "../../store";

export const ScoutDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<
    "overview" | "shortlist" | "reports" | "discover"
  >("overview");
  const [searchFilters, setSearchFilters] = useState({
    position: "",
    sport: "Football",
  });

  const { data: shortlistedPlayers, isLoading: shortlistLoading } =
    useGetShortlistedPlayersQuery(user?.id || "", { skip: !user?.id });

  const { data: availablePlayers, isLoading: playersLoading } =
    useGetPlayersByPositionQuery(searchFilters, {
      skip: !searchFilters.position,
    });

  if (!user || user.role !== "scout") {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need to be a scout to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>{icon}</div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  const PlayerCard: React.FC<{ player: any; isShortlisted?: boolean }> = ({
    player,
    isShortlisted = false,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-medium text-lg">
            {player.name?.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {player.name}
            </h3>
            {isShortlisted && <Star className="w-4 h-4 text-yellow-500" />}
          </div>

          {player.playerData && (
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                {player.playerData.sport} • {player.playerData.position}
              </p>
              <p>{player.playerData.age} years old</p>
              <p>Status: {player.playerData.status}</p>
              {player.playerData.clubName && (
                <p>Current Club: {player.playerData.clubName}</p>
              )}
              {player.playerData.stats && (
                <p>
                  {player.playerData.stats.matches} matches,{" "}
                  {player.playerData.stats.goals || 0} goals,{" "}
                  {player.playerData.stats.assists || 0} assists
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <button className="px-3 py-1 text-sm bg-sport-600 text-white rounded-md hover:bg-sport-700 flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>Contact</span>
          </button>
          {!isShortlisted && (
            <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Shortlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Scout Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.name}!
              {user.scoutData?.clubName && ` • ${user.scoutData.clubName}`}
            </p>
          </div>
          <button className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: <TrendingUp className="w-4 h-4" />,
              },
              {
                key: "shortlist",
                label: "Shortlist",
                icon: <Star className="w-4 h-4" />,
              },
              {
                key: "reports",
                label: "Reports",
                icon: <FileText className="w-4 h-4" />,
              },
              {
                key: "discover",
                label: "Discover",
                icon: <Search className="w-4 h-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? "border-sport-500 text-sport-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Shortlisted Players"
                  value={shortlistedPlayers?.length || 0}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Reports Created"
                  value={user.scoutData?.reports?.length || 0}
                  icon={<FileText className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="This Month"
                  value="12"
                  icon={<Calendar className="w-6 h-6 text-white" />}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Success Rate"
                  value="78%"
                  icon={<Target className="w-6 h-6 text-white" />}
                  color="bg-orange-500"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">2 hours ago</span>
                    <span className="text-gray-900">
                      Added John Smith to shortlist
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">1 day ago</span>
                    <span className="text-gray-900">
                      Created scout report for Sarah Johnson
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">3 days ago</span>
                    <span className="text-gray-900">
                      Recommended Mike Wilson for signing
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sport-500 hover:bg-sport-50 transition-colors text-center">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">
                    Discover Players
                  </div>
                  <div className="text-xs text-gray-500">Find new talent</div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sport-500 hover:bg-sport-50 transition-colors text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">
                    Create Report
                  </div>
                  <div className="text-xs text-gray-500">
                    Document your findings
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sport-500 hover:bg-sport-50 transition-colors text-center">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">
                    Review Shortlist
                  </div>
                  <div className="text-xs text-gray-500">
                    Manage your prospects
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Shortlist Tab */}
          {activeTab === "shortlist" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Shortlist
                </h2>
                <div className="flex space-x-3">
                  <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {shortlistLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-6 animate-pulse"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : shortlistedPlayers && shortlistedPlayers.length > 0 ? (
                <div className="space-y-4">
                  {shortlistedPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      isShortlisted={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No players shortlisted yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start building your shortlist by discovering and evaluating
                    players
                  </p>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700"
                  >
                    Discover Players
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Scout Reports
                </h2>
                <button className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Report</span>
                </button>
              </div>

              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reports created yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create detailed reports on players you've scouted
                </p>
                <button className="px-4 py-2 bg-sport-600 text-white rounded-lg hover:bg-sport-700">
                  Create First Report
                </button>
              </div>
            </div>
          )}

          {/* Discover Tab */}
          {activeTab === "discover" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Discover Players
                </h2>
              </div>

              {/* Search Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport
                    </label>
                    <select
                      value={searchFilters.sport}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          sport: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sport-500 focus:border-sport-500"
                    >
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={searchFilters.position}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sport-500 focus:border-sport-500"
                    >
                      <option value="">All Positions</option>
                      <option value="Forward">Forward</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Defender">Defender</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="w-full px-4 py-2 bg-sport-600 text-white rounded-md hover:bg-sport-700">
                      Search Players
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {searchFilters.position ? (
                playersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-6 animate-pulse"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availablePlayers && availablePlayers.length > 0 ? (
                  <div className="space-y-4">
                    {availablePlayers.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No players found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search criteria
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start discovering players
                  </h3>
                  <p className="text-gray-500">
                    Use the filters above to find players by position and sport
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

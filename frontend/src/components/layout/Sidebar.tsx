import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  User,
  Users,
  Search,
  MessageCircle,
  Trophy,
  Target,
  Calendar,
} from "lucide-react";
import type { RootState } from "../../store";

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/search", icon: Search, label: "Discover" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
  ];

  // Add role-specific items
  if (user?.role === "scout") {
    sidebarItems.push({
      path: "/scout-dashboard",
      icon: Target,
      label: "Scout Dashboard",
    });
  }

  if (user?.role === "coach") {
    sidebarItems.push({
      path: "/coach-dashboard",
      icon: Users,
      label: "Coach Dashboard",
    });
    sidebarItems.push({
      path: "/training-plans",
      icon: Calendar,
      label: "Training Plans",
    });
  }

  if (user?.role === "club") {
    sidebarItems.push({
      path: "/club-dashboard",
      icon: Users,
      label: "Club Dashboard",
    });
    sidebarItems.push({
      path: "/club-management",
      icon: Trophy,
      label: "Club Management",
    });
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-sport-100 text-sport-700 border-r-2 border-sport-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick actions section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
              Create Post
            </button>
            {user?.role === "scout" && (
              <>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  Add Scout Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  View Shortlist
                </button>
              </>
            )}
            {user?.role === "coach" && (
              <>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  Create Training Plan
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  Player Assessment
                </button>
              </>
            )}
            {user?.role === "club" && (
              <>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  Post Trial Event
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                  Club Analytics
                </button>
              </>
            )}
          </div>
        </div>

        {/* Verification status */}
        {user?.isVerified && (
          <div className="mt-8 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-green-800">
                  Verified Account
                </p>
                <p className="text-xs text-green-600">Trusted member</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

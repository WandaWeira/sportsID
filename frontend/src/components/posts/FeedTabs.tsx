import React from "react";

type FeedTab = "all" | "following" | "trending" | "my-role";

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  userRole: string;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({
  activeTab,
  onTabChange,
  userRole,
}) => {
  const tabs = [
    { id: "all" as const, label: "All Posts" },
    { id: "trending" as const, label: "Trending" },
    { id: "following" as const, label: "Following" },
    {
      id: "my-role" as const,
      label: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}s`,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-sport-500 text-sport-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

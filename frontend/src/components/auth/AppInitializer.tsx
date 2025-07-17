import React from "react";

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  // For now, just pass through the children
  // Token verification will be handled by individual API calls
  return <>{children}</>;
};

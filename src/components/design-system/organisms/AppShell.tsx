"use client";

import { type ReactNode, type FC } from "react";
import { TopBar } from "./TopBar";

export interface AppShellProps {
  topBarContent?: ReactNode;
  onChatClick?: () => void;
  alertCount?: number;
  userEmail?: string;
  children: ReactNode;
}

const AppShell: FC<AppShellProps> = ({
  topBarContent,
  onChatClick,
  alertCount,
  userEmail,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar
        onChatClick={onChatClick}
        alertCount={alertCount}
        userEmail={userEmail}
      >
        {topBarContent}
      </TopBar>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export { AppShell };

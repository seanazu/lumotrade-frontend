"use client";

import { type ReactNode, type FC } from "react";
import { TopBar } from "./TopBar";

export interface AppShellProps {
  topBarContent?: ReactNode;
  alertCount?: number;
  userEmail?: string;
  children: ReactNode;
}

const AppShell: FC<AppShellProps> = ({
  topBarContent,
  alertCount,
  userEmail,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar
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

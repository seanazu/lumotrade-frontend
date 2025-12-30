"use client";

import { type ReactNode, type FC, useState, createContext, useContext } from "react";
import { TopBar } from "./TopBar";
import { AIChatSidebar } from "./AIChatSidebar";

export interface AppShellProps {
  topBarContent?: ReactNode;
  alertCount?: number;
  userEmail?: string;
  children: ReactNode;
}

// Create a context for the chat state
interface ChatContextType {
  isChatOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within AppShell");
  }
  return context;
};

const AppShell: FC<AppShellProps> = ({
  topBarContent,
  alertCount,
  userEmail,
  children,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, toggleChat, openChat, closeChat }}>
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar alertCount={alertCount} userEmail={userEmail}>
          {topBarContent}
        </TopBar>

        <div className="flex-1 flex overflow-hidden">
          {/* Main content - shifts when chat opens */}
          <main
            className="flex-1 transition-all duration-300 ease-in-out overflow-auto"
            style={{
              marginRight: isChatOpen ? "384px" : "0",
            }}
          >
            {children}
          </main>

          {/* AI Chat Sidebar - Fixed to right side */}
          <AIChatSidebar isOpen={isChatOpen} onClose={closeChat} />
        </div>
      </div>
    </ChatContext.Provider>
  );
};

export { AppShell };

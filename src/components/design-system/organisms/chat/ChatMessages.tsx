"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

/**
 * ChatMessages Component
 * Scrollable message list container with auto-scroll
 */
export const ChatMessages = React.memo(function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Start a conversation with your AI assistant</p>
            <p className="text-xs mt-1">Ask about markets, stocks, or strategies</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
});

ChatMessages.displayName = "ChatMessages";


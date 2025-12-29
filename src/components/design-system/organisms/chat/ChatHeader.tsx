"use client";

import React from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";

interface ChatHeaderProps {
  onClose: () => void;
}

/**
 * ChatHeader Component
 * Chat panel header with title and close button
 */
export const ChatHeader = React.memo(function ChatHeader({
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Trading Assistant</h3>
          <p className="text-xs text-muted-foreground">Always learning</p>
        </div>
      </div>
      <Button onClick={onClose} variant="ghost" size="icon">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
});

ChatHeader.displayName = "ChatHeader";


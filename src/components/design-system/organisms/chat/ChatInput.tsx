"use client";

import React from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/design-system/atoms/Input";
import { Button } from "@/components/design-system/atoms/Button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

/**
 * ChatInput Component
 * Message input field with send button
 */
export const ChatInput = React.memo(function ChatInput({
  value,
  onChange,
  onSend,
  isLoading = false,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask about market trends, stock analysis..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        size="icon"
        className="flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
});

ChatInput.displayName = "ChatInput";


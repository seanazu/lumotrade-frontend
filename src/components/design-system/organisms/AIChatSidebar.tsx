"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI Chat Sidebar Component
 * Full-featured AI chat matching Figma design with API integration
 * Connects to market data, trading opportunities, and AI analysis
 */
export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Based on current market data, the tech sector is showing strong momentum due to positive earnings reports from major semiconductor companies. Would you like a detailed breakdown of the NVDA chart?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call AI chat API endpoint
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[384px] bg-[rgba(11,11,12,0.9)] border-l border-[#27272a] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-[#27272a] h-[89px] flex items-center px-6 relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-[0px_0px_20px_-5px_rgba(99,102,241,0.4)]"
                style={{
                  background:
                    "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                }}
              >
                <Sparkles className="w-[18px] h-[22px] text-white -scale-y-100" />
              </div>
              <h3 className="ml-3 font-bold text-[18px] text-[#f4f4f5] leading-[28px]">
                Lumo AI
              </h3>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-6 w-10 h-10 rounded-full hover:bg-[#27272a] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : ""}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{
                          background:
                            "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                        }}
                      >
                        <span className="text-[10px] font-normal text-white">
                          AI
                        </span>
                      </div>
                      <div className="bg-[#1e2026] rounded-br-2xl rounded-tr-2xl rounded-bl-2xl px-4 py-3 flex-1 max-w-[267px]">
                        <p className="text-[14px] text-[#d4d4d8] leading-[22.75px]">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="flex items-start gap-3">
                      <div className="bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] rounded-bl-2xl rounded-tl-2xl rounded-br-2xl px-4 py-3 max-w-[249px]">
                        <p className="text-[14px] text-[#6366f1] leading-[20px] font-medium">
                          {message.content}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#3f3f46] flex-shrink-0" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                    style={{
                      background:
                        "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                    }}
                  >
                    <span className="text-[10px] font-normal text-white">AI</span>
                  </div>
                  <div className="bg-[#1e2026] rounded-br-2xl rounded-tr-2xl rounded-bl-2xl p-4 w-[58px]">
                    <div className="flex gap-1.5 items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#27272a] px-6 py-4">
              <div className="bg-[#1e2026] border border-[#27272a] rounded-xl h-[46px] flex items-center px-4 gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Lumo anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-[#6b7280] outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send className="w-5 h-6 text-muted-foreground -scale-y-100" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

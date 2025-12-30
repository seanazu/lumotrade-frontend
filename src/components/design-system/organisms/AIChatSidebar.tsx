"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

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
 * AI Chat Sidebar - Matches Figma Design Exactly
 * Full-featured AI chat with comprehensive system context
 * Connects to all endpoints and provides real-time market intelligence
 */
export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Based on current market data, the tech sector is showing strong momentum due to positive earnings reports from major semiconductor companies. Would you like a detailed breakdown of the NVDA chart?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Theme-aware colors
  const colors = {
    background: theme === "dark" ? "rgba(11, 11, 12, 0.9)" : "rgba(255, 255, 255, 0.95)",
    border: theme === "dark" ? "#27272a" : "#e5e7eb",
    headerText: theme === "dark" ? "#f4f4f5" : "#18181b",
    closeHover: theme === "dark" ? "#27272a" : "#f4f4f5",
    closeIcon: theme === "dark" ? "#a1a1aa" : "#71717a",
    messageBubbleBg: theme === "dark" ? "#1e2026" : "#f4f4f5",
    messageText: theme === "dark" ? "#d4d4d8" : "#3f3f46",
    userBubbleBg: theme === "dark" ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.15)",
    userText: theme === "dark" ? "#6366f1" : "#4f46e5",
    userAvatar: theme === "dark" ? "#3f3f46" : "#d4d4d8",
    inputBg: theme === "dark" ? "#1e2026" : "#f9fafb",
    inputText: theme === "dark" ? "#ffffff" : "#18181b",
    inputPlaceholder: theme === "dark" ? "#6b7280" : "#9ca3af",
    sendIcon: theme === "dark" ? "#a1a1aa" : "#71717a",
    sendHover: theme === "dark" ? "#27272a" : "#f4f4f5",
  };

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
      // Extract current symbol from URL if on analyzer page
      let currentSymbol: string | undefined;
      if (pathname?.includes("/analyzer")) {
        const params = new URLSearchParams(window.location.search);
        currentSymbol = params.get("symbol") || undefined;
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
            .concat([{ role: userMessage.role, content: userMessage.content }]),
          currentSymbol,
          currentPage: pathname,
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
      } else if (data.error) {
        throw new Error(data.details || data.error);
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
        /* Sidebar - Fixed to right side, pushes content */
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-12 right-0 w-[384px] flex flex-col"
          style={{
            height: "calc(100vh - 48px)", // Full height minus TopBar (48px / h-12)
            background: colors.background,
            borderLeft: `1px solid ${colors.border}`,
            boxShadow: theme === "dark" 
              ? "0px 25px 50px -12px rgba(0, 0, 0, 0.25)" 
              : "0px 25px 50px -12px rgba(0, 0, 0, 0.1)",
            zIndex: 40,
          }}
        >
          {/* Header - 89px height */}
          <div
            className="flex-shrink-0 h-[89px] flex items-center"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
          >
            {/* AI Icon with gradient and shadow */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                boxShadow: "0px 0px 20px -5px rgba(99, 102, 241, 0.4)",
              }}
            >
              <Sparkles
                className="w-[18px] h-[22px] text-white"
                style={{ transform: "scaleY(-1)" }}
              />
            </div>

            {/* Title */}
            <h3
              className="ml-3 font-bold text-[18px] leading-[28px] flex-shrink-0"
              style={{ color: colors.headerText, fontFamily: "Manrope, sans-serif" }}
            >
              Lumo AI
            </h3>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              style={{ color: colors.closeIcon }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.closeHover}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              aria-label="Close AI Chat"
            >
              <X className="w-6 h-6" style={{ transform: "scaleY(-1)" }} />
            </button>
          </div>

          {/* Messages Container - Scrollable - Fills remaining space */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : ""}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-start gap-3">
                      {/* AI Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                        }}
                      >
                        <span
                          className="text-[10px] font-normal"
                          style={{
                            color: "#ffffff",
                            fontFamily: "Manrope, sans-serif",
                          }}
                        >
                          AI
                        </span>
                      </div>

                      {/* AI Message Bubble */}
                      <div
                        className="rounded-br-2xl rounded-tr-2xl rounded-bl-2xl px-4 py-3 flex-1 max-w-[267px]"
                        style={{
                          background: colors.messageBubbleBg,
                        }}
                      >
                        <p
                          className="text-[14px] leading-[22.75px] whitespace-pre-wrap font-normal"
                          style={{
                            color: colors.messageText,
                            fontFamily: "Manrope, sans-serif",
                          }}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="flex items-start gap-3 justify-end">
                      {/* User Message Bubble */}
                      <div
                        className="rounded-bl-2xl rounded-tl-2xl rounded-br-2xl px-4 py-3 max-w-[249px]"
                        style={{
                          background: colors.userBubbleBg,
                        }}
                      >
                        <p
                          className="text-[14px] leading-[20px] font-medium"
                          style={{
                            color: colors.userText,
                            fontFamily: "Manrope, sans-serif",
                          }}
                        >
                          {message.content}
                        </p>
                      </div>

                      {/* User Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ background: colors.userAvatar }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator - Three Dots */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  {/* AI Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                    }}
                  >
                    <span
                      className="text-[10px] font-normal"
                      style={{
                        color: "#ffffff",
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      AI
                    </span>
                  </div>

                  {/* Loading Bubble */}
                  <div
                    className="rounded-br-2xl rounded-tr-2xl rounded-bl-2xl p-4 w-[58px] h-[38px] flex items-center justify-center"
                    style={{ background: colors.messageBubbleBg }}
                  >
                    <div className="flex gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: colors.messageText }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: colors.messageText,
                          animationDelay: "0.2s",
                        }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: colors.messageText,
                          animationDelay: "0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - 79px height - Fixed to bottom */}
          <div
            className="flex-shrink-0 h-[79px] flex items-center"
            style={{
              borderTop: `1px solid ${colors.border}`,
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
          >
            <div
              className="w-full h-[46px] rounded-xl flex items-center px-4 gap-2"
              style={{
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Lumo anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-[14px] outline-none disabled:opacity-50"
                style={{
                  color: colors.inputText,
                  caretColor: "#6366f1",
                  fontFamily: "Manrope, sans-serif",
                }}
              />
              <style jsx>{`
                input::placeholder {
                  color: ${colors.inputPlaceholder};
                }
              `}</style>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ color: colors.sendIcon }}
                onMouseEnter={(e) => !isLoading && input.trim() && (e.currentTarget.style.background = colors.sendHover)}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                aria-label="Send message"
              >
                <Send
                  className="w-5 h-6"
                  style={{ transform: "scaleY(-1)" }}
                />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { usePathname } from "next/navigation";

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
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })).concat([{ role: userMessage.role, content: userMessage.content }]),
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Sidebar - Exact Figma Design */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[384px] z-50 flex flex-col shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
            style={{
              background: "rgba(11, 11, 12, 0.9)",
              borderLeft: "1px solid #27272a",
            }}
          >
            {/* Header - 89px height */}
            <div
              className="relative h-[89px] flex items-center px-6"
              style={{
                borderBottom: "1px solid #27272a",
              }}
            >
              {/* AI Icon with gradient and shadow */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                  boxShadow: "0px 0px 20px -5px rgba(99, 102, 241, 0.4)",
                }}
              >
                <Sparkles className="w-[18px] h-[22px] text-white -scale-y-100" />
              </div>

              {/* Title */}
              <h3
                className="ml-3 font-bold text-[18px] leading-[28px]"
                style={{ color: "#f4f4f5" }}
              >
                Lumo AI
              </h3>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-6 w-10 h-10 rounded-full hover:bg-[#27272a] flex items-center justify-center transition-colors"
                style={{ color: "#a1a1aa" }}
              >
                <X className="w-7 h-7 -scale-y-100" />
              </button>
            </div>

            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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
                          style={{ color: "#ffffff" }}
                        >
                          AI
                        </span>
                      </div>

                      {/* AI Message Bubble */}
                      <div
                        className="rounded-br-2xl rounded-tr-2xl rounded-bl-2xl px-4 py-3 flex-1 max-w-[267px]"
                        style={{
                          background: "#1e2026",
                        }}
                      >
                        <p
                          className="text-[14px] leading-[22.75px] whitespace-pre-wrap"
                          style={{ color: "#d4d4d8" }}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="flex items-start gap-3">
                      {/* User Message Bubble */}
                      <div
                        className="rounded-bl-2xl rounded-tl-2xl rounded-br-2xl px-4 py-3 max-w-[249px]"
                        style={{
                          background: "rgba(99, 102, 241, 0.1)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                        }}
                      >
                        <p
                          className="text-[14px] leading-[20px] font-medium"
                          style={{ color: "#6366f1" }}
                        >
                          {message.content}
                        </p>
                      </div>

                      {/* User Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ background: "#3f3f46" }}
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
                      style={{ color: "#ffffff" }}
                    >
                      AI
                    </span>
                  </div>

                  {/* Loading Bubble */}
                  <div
                    className="rounded-br-2xl rounded-tr-2xl rounded-bl-2xl p-4 w-[58px]"
                    style={{ background: "#1e2026" }}
                  >
                    <div className="flex gap-1.5 items-center justify-center">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: "#94a3b8" }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: "#94a3b8",
                          animationDelay: "0.2s",
                        }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: "#94a3b8",
                          animationDelay: "0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - 79px height */}
            <div
              className="h-[79px] px-6 py-4"
              style={{
                borderTop: "1px solid #27272a",
              }}
            >
              <div
                className="h-[46px] rounded-xl flex items-center px-4 gap-2"
                style={{
                  background: "#1e2026",
                  border: "1px solid #27272a",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Lumo anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[14px] outline-none disabled:opacity-50"
                  style={{
                    color: "#ffffff",
                    caretColor: "#6366f1",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send
                    className="w-5 h-6 -scale-y-100"
                    style={{ color: "#a1a1aa" }}
                  />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

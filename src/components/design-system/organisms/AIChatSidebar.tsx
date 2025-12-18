"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, MessageSquare, Send } from "lucide-react";

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI Chat Sidebar Component
 * Full-screen sliding sidebar with chat interface for AI interactions
 */
export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
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
            className="fixed inset-0 bg-black/50 dark:bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[384px] bg-white/95 dark:bg-[rgba(11,11,12,0.95)] border-l border-border z-50 flex flex-col shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="border-b border-border h-[89px] flex items-center px-6 relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40"
                style={{
                  background:
                    "linear-gradient(45deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                }}
              >
                <Sparkles className="w-4.5 h-5.5 text-white" />
              </div>
              <h3 className="ml-3 font-bold text-[18px] text-foreground leading-[28px]">
                Lumo AI
              </h3>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-6 w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* AI Message */}
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
                <div className="bg-muted dark:bg-surface-2 rounded-br-2xl rounded-tr-2xl rounded-bl-2xl p-4 flex-1 max-w-[267px]">
                  <p className="text-[14px] text-foreground leading-[22.75px]">
                    Based on current market data, the tech sector is showing
                    strong momentum due to positive earnings reports from major
                    semiconductor companies. Would you like a detailed breakdown
                    of the NVDA chart?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-bl-2xl rounded-tl-2xl rounded-br-2xl p-4 max-w-[249px]">
                  <p className="text-[14px] text-indigo-500 dark:text-indigo-400 leading-[20px] font-medium">
                    Explain the recent volatility in gold prices.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted dark:bg-zinc-700 flex-shrink-0" />
              </div>

              {/* AI Typing */}
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
                <div className="bg-muted dark:bg-surface-2 rounded-br-2xl rounded-tr-2xl rounded-bl-2xl p-4 w-[58px]">
                  <div className="flex gap-1.5 items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6">
              <div className="bg-muted dark:bg-surface-2 border border-border rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask Lumo anything..."
                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center justify-center">
                  <Send className="w-5 h-6 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


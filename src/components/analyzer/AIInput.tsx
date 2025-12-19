"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface AIInputProps {
  symbol?: string;
}

export function AIInput({ symbol }: AIInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // TODO: Connect to AI chat sidebar
    // For now, just log the query
    console.log(`AI Query about ${symbol || "stocks"}: ${input}`);
    setInput("");
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${symbol || "stocks"}...`}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </form>
    </div>
  );
}

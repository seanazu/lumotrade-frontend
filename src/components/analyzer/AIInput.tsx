"use client";

import { Send } from "lucide-react";

export function AIInput() {
  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Lumo anything..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors">
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}

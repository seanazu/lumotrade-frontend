"use client";

interface NewsItem {
  text: string;
  time: string;
}

interface NewsSectionProps {
  news: NewsItem[];
}

export function NewsSection({ news }: NewsSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-3">Relevant News</h3>
      <div className="space-y-2.5">
        {news.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">{item.text}</p>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

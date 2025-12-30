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
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
      <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Relevant News</h3>
      <div className="space-y-2 sm:space-y-2.5">
        {news.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 sm:gap-2">
            <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 sm:mt-2 flex-shrink-0" />
            <p className="text-[11px] sm:text-xs text-muted-foreground flex-1 leading-relaxed">{item.text}</p>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

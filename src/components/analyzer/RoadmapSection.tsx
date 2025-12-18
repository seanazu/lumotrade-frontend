"use client";

interface RoadmapItem {
  quarter: string;
  event: string;
}

interface RoadmapSectionProps {
  roadmap: RoadmapItem[];
}

export function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-3">Future Roadmap</h3>
      <div className="space-y-3">
        {roadmap.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {item.quarter}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{item.event}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

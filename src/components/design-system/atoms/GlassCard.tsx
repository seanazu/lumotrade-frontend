import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ gradient, hover, glow, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-lg border border-border bg-card p-4",
          // Hover effects
          hover && "transition-all duration-200 cursor-pointer",
          hover && "hover:border-primary/30 hover:shadow-card-hover",
          // Gradient
          gradient && "bg-gradient-to-br from-card via-card to-surface-2",
          // Glow effect
          glow && "shadow-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };

interface PositionSizeInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function PositionSizeInput({
  value,
  onChange,
  min = 100,
  max = 10000,
  step = 100,
}: PositionSizeInputProps) {
  return (
    <div className="pt-2 border-t border-border/50">
      <label className="text-[9px] text-muted-foreground uppercase mb-1 block">
        Risk Per Trade ($)
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full bg-muted/30 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
    </div>
  );
}

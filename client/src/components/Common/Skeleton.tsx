interface SkeletonProps {
  widths?: number[];
}

export function Skeleton({ widths = [92, 98, 64] }: SkeletonProps) {
  return (
    <div className="flex flex-col gap-2 py-1">
      {widths.map((w, i) => (
        <span
          key={i}
          className="h-[11px] rounded bg-gradient-to-r from-[var(--surface)] via-[var(--surface-2)] to-[var(--surface)] bg-[length:200%_100%] animate-[shimmer_1.3s_infinite]"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

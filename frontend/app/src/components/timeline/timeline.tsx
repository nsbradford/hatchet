import { TimelineProps } from './types';
import { TimelineItem } from './timeline-item';
import { useEffect } from 'react';
import useTimeline from '@/hooks/use-timeline-context';

export function Timeline({ items, showTimeLabels = false }: TimelineProps) {
  const { earliest, latest, updateTimeRange, resetTimeRange } = useTimeline();

  // Update the global time range when this timeline's range changes
  useEffect(() => {
    if (items?.length > 0) {
      items.forEach((item) => {
        updateTimeRange(item);
      });
    }
  }, [updateTimeRange, items, resetTimeRange]);

  if (!earliest || !latest) {
    return null;
  }

  // Ensure we have a valid time range to prevent division by zero
  const timeRangeMs = Math.max(latest - earliest, 1);

  return (
    <div className="relative border border-border border-dashed border-r-0 h-full w-full">
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-full w-full border-r flex items-center"
            style={{ left: `${i * 25}%` }}
          >
            <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pl-1">
              {showTimeLabels &&
                new Date(earliest + (i * timeRangeMs) / 5).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {items.map((item, index) => (
        <TimelineItem
          key={item.metadata?.id || index}
          item={item}
          onClick={undefined}
          globalStartTime={earliest}
          globalEndTime={latest}
        />
      ))}
    </div>
  );
}

// Export the TimelineItem component for direct use
export { TimelineItem } from './timeline-item';
export * from './types';

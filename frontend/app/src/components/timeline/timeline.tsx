import { TimelineProps } from './types';
import { TimelineItem } from './timeline-item';
import { sortTimelineItems } from './utils';
import { useEffect } from 'react';
import useTimeline from '@/hooks/use-timeline-context';

export function Timeline({ items, showTimeLabels = false }: TimelineProps) {
  const { earliest, latest, updateTimeRange } = useTimeline();

  // Update the global time range when this timeline's range changes
  useEffect(() => {
    if (items?.length > 0) {
      // Process all items regardless of whether they have createdAt or startedAt
      items.forEach((item) => {
        // Determine start and end times
        let startTime: number | null = null;
        let endTime: number | null = null;

        // For items with startedAt (running or completed items)
        if (item.startedAt) {
          startTime = new Date(item.startedAt).getTime();
          endTime = item.finishedAt
            ? new Date(item.finishedAt).getTime()
            : Date.now();
        }
        // For items with only createdAt (events or pending items)
        else if (item.createdAt) {
          startTime = new Date(item.createdAt).getTime();
          endTime = startTime; // Point event
        }

        // Update the global time range if we have valid times
        if (startTime !== null && endTime !== null) {
          updateTimeRange(startTime, endTime);
        }
      });
    }
  }, [updateTimeRange, items]);

  const sortedItems = sortTimelineItems(items);

  if (!earliest || !latest) {
    return null;
  }

  // Ensure we have a valid time range to prevent division by zero
  const timeRangeMs = Math.max(latest - earliest, 1);

  return (
    <div className="relative border border-border border-dashed border-r-0 h-full w-full">
      {/* Time markers - render 5 evenly spaced markers from left to right */}
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => {
          // Calculate the time for this marker (0%, 25%, 50%, 75%, 100% of the timeline)
          const markerPosition = i / 4; // 0, 0.25, 0.5, 0.75, 1
          const markerTime = earliest + timeRangeMs * markerPosition;

          return (
            <div
              key={i}
              className="h-full border-r flex items-center"
              style={{
                position: 'absolute',
                left: `${markerPosition * 100}%`,
                height: '100%',
              }}
            >
              <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pl-1">
                {showTimeLabels &&
                  new Date(markerTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline items */}
      {sortedItems.map((item, index) => (
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
export * from './utils';

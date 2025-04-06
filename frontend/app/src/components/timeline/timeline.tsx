import { TimelineProps } from './types';
import { TimelineItem } from './timeline-item';
import { calculateTimeRange, sortTimelineItems } from './utils';
import { useEffect } from 'react';
import useTimeline from '@/hooks/use-timeline-context';

export function Timeline({
  items,
  showLabels = false,
  height,
  showTimeLabels = false,
}: TimelineProps) {
  const { globalEarliestTime, globalLatestTime, updateTimeRange } =
    useTimeline();

  // Default time range
  const defaultTimeRange = {
    earliestTime: Date.now(),
    latestTime: Date.now(),
  };

  // Calculate time range if items exist
  const timeRange =
    items?.length > 0 ? calculateTimeRange(items) : defaultTimeRange;

  const { earliestTime, latestTime } = timeRange;

  // Update the global time range when this timeline's range changes
  useEffect(() => {
    if (items?.length > 0) {
      // Use the cleanup function returned by updateTimeRange
      const cleanup = updateTimeRange(earliestTime, latestTime);

      // Return cleanup function when this component unmounts
      return cleanup;
    }
  }, [earliestTime, latestTime, updateTimeRange, items]);

  const sortedItems = sortTimelineItems(items);

  // Use global time range if available, otherwise use local time range
  const effectiveEarliestTime = globalEarliestTime ?? earliestTime;
  const effectiveLatestTime = globalLatestTime ?? latestTime;

  // Ensure we have a valid time range to prevent division by zero
  const timeRangeMs = Math.max(
    effectiveLatestTime - effectiveEarliestTime,
    1, // minimum 1ms to prevent division by zero
  );

  return (
    <div
      className="relative border border-border rounded h-full w-full"
      style={{ height }}
    >
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-full w-px bg-border"
            style={{ left: `${i * 25}%` }}
          >
            <div className="text-xs text-muted-foreground">
              {showTimeLabels &&
                new Date(
                  effectiveEarliestTime + (i * timeRangeMs) / 5,
                ).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {sortedItems.map((item, index) => (
        <TimelineItem
          key={item.metadata?.id || index}
          item={item}
          onClick={undefined}
          globalStartTime={effectiveEarliestTime}
          globalEndTime={effectiveLatestTime}
        />
      ))}

      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
          <div>{new Date(effectiveEarliestTime).toLocaleTimeString()}</div>
          <div>{new Date(effectiveLatestTime).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
}

// Export the TimelineItem component for direct use
export { TimelineItem } from './timeline-item';
export * from './types';
export * from './utils';

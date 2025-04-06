import { TimelineProps } from './types';
import { TimelineItem } from './timeline-item';
import { calculateTimeRange, sortTimelineItems } from './utils';

export function Timeline({
  items,
  showLabels = false,
  minWidth,
  height,
}: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex-1 text-xs text-muted-foreground">
        No timeline data
      </div>
    );
  }

  const { earliestTime, latestTime } = calculateTimeRange(items);
  const sortedItems = sortTimelineItems(items);

  return (
    <div
      className="flex-1 relative border border-border rounded"
      style={{ minWidth, height }}
    >
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-full w-px bg-border"
            style={{ left: `${i * 25}%` }}
          />
        ))}
      </div>

      {sortedItems.map((item, index) => (
        <TimelineItem
          key={item.metadata?.id || index}
          item={item}
          onClick={undefined}
        />
      ))}

      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
          <div>{new Date(earliestTime).toLocaleTimeString()}</div>
          <div>{new Date(latestTime).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
}

// Export the TimelineItem component for direct use
export { TimelineItem } from './timeline-item';
export * from './types';
export * from './utils';

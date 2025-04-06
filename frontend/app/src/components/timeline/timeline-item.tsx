import { formatDuration, intervalToDuration } from 'date-fns';
import { getStatusBadgeColor } from '../runs/columns';
import { TimelineItemProps } from './types';

export function TimelineItem({
  item,
  onClick,
  globalStartTime,
  globalEndTime,
}: TimelineItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Handle run with startedAt
  if (item.startedAt) {
    const itemStartTime = new Date(item.startedAt).getTime();
    const itemEndTime = item.finishedAt
      ? new Date(item.finishedAt).getTime()
      : Date.now();

    const duration = intervalToDuration({
      start: itemStartTime,
      end: itemEndTime,
    });

    // Ensure we have valid global times
    const effectiveGlobalStart = globalStartTime ?? itemStartTime;
    const effectiveGlobalEnd = globalEndTime ?? itemEndTime;

    // Calculate the total time range (ensure it's at least 1ms to prevent division by zero)
    const timeRange = Math.max(effectiveGlobalEnd - effectiveGlobalStart, 1);

    // Calculate left position as percentage of the timeline - always render from left
    const leftPos = ((itemStartTime - effectiveGlobalStart) / timeRange) * 100;

    // Ensure leftPos is within bounds (0-100%)
    const adjustedLeftPos = Math.max(0, Math.min(100, leftPos));

    // Calculate width as percentage of the timeline
    const widthPercent = ((itemEndTime - itemStartTime) / timeRange) * 100;
    // Ensure item has reasonable width and doesn't exceed right boundary
    const itemWidth = Math.min(
      100 - adjustedLeftPos,
      Math.max(0.5, widthPercent),
    );

    const tooltipText = `${item.displayName}: ${formatDuration(duration, {
      format: ['days', 'hours', 'minutes', 'seconds'],
      delimiter: ', ',
    })}`;

    const statusColorClass = getStatusBadgeColor(item.status);

    return (
      <div
        className="absolute h-6 rounded cursor-pointer hover:brightness-110 transition-all flex items-center justify-center border h-full"
        style={{
          left: `${adjustedLeftPos}%`,
          width: `${itemWidth}%`,
          minWidth: '20px',
        }}
        onClick={handleClick}
        title={tooltipText}
      >
        <div
          className={`absolute inset-0 ${statusColorClass} opacity-50`}
        ></div>
        <div className="z-10 px-1 text-[10px] font-mono font-light text-muted-foreground/60 whitespace-nowrap w-full flex justify-between">
          <span className="text-xs text-muted-foreground/60">
            {item.displayName}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {formatDuration(duration, {
              format: ['hours', 'minutes', 'seconds'],
            })
              .replace(/days?/, 'd')
              .replace(/hours?/, 'h')
              .replace(/minutes?/, 'm')
              .replace(/seconds?/, 's')}
          </span>
        </div>
      </div>
    );
  }

  // Handle events with createdAt
  if (item.createdAt) {
    const itemTime = new Date(item.createdAt).getTime();

    // Ensure we have valid global times
    const effectiveGlobalStart = globalStartTime ?? itemTime;
    const effectiveGlobalEnd = globalEndTime ?? itemTime + 1; // Add 1ms to prevent division by zero

    // Calculate the total time range (ensure it's at least 1ms)
    const timeRange = Math.max(effectiveGlobalEnd - effectiveGlobalStart, 1);

    // Calculate position as percentage of the timeline - always render from left
    const leftPos = ((itemTime - effectiveGlobalStart) / timeRange) * 100;

    // Ensure position is within bounds (0-100%)
    const adjustedLeftPos = Math.max(0, Math.min(100, leftPos));

    const tooltipText = `${item.displayName}: ${item.createdAt}`;

    return (
      <div
        className="absolute h-full flex flex-col items-center cursor-pointer ml-[-10px]"
        style={{ left: `${adjustedLeftPos}%` }}
        onClick={handleClick}
        title={tooltipText}
      >
        <div className="flex flex-row items-center h-full">
          <div className="w-[10px] h-[10px] rounded-full bg-secondary"></div>
        </div>
        <div className="w-full bg-secondary/50"></div>
      </div>
    );
  }

  return null;
}

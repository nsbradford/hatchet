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

    // Calculate left position as percentage of the timeline
    const leftPos = ((itemStartTime - effectiveGlobalStart) / timeRange) * 100;

    // Calculate width as percentage of the timeline
    const widthPercent = ((itemEndTime - itemStartTime) / timeRange) * 100;
    const itemWidth = Math.max(0.5, widthPercent); // ensure minimum width

    // Ensure the item stays within the bounds of the timeline (0-100%)
    const adjustedLeftPos = Math.min(100 - itemWidth, Math.max(0, leftPos));

    const tooltipText = `${item.displayName}: ${formatDuration(duration, {
      format: ['days', 'hours', 'minutes', 'seconds'],
      delimiter: ', ',
    })}`;

    const statusColorClass = getStatusBadgeColor(item.status);

    return (
      <div
        className="absolute h-6 rounded cursor-pointer hover:brightness-110 transition-all flex items-center justify-center overflow-hidden border"
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
        <div className="z-10 px-1 text-xs font-medium truncate text-center w-full text-gray-900 dark:text-white">
          {formatDuration(duration, {
            format: ['minutes', 'seconds'],
            delimiter: ':',
          })}
        </div>
      </div>
    );
  }

  // Handle events with createdAt
  if (item.createdAt) {
    const itemTime = new Date(item.createdAt).getTime();

    // Ensure we have valid global times
    const effectiveGlobalStart = globalStartTime ?? itemTime;
    const effectiveGlobalEnd = globalEndTime ?? Date.now();

    // Calculate the total time range (ensure it's at least 1ms to prevent division by zero)
    const timeRange = Math.max(effectiveGlobalEnd - effectiveGlobalStart, 1);

    // Calculate position as percentage of the timeline
    const leftPos = ((itemTime - effectiveGlobalStart) / timeRange) * 100;

    // Ensure the item stays within the bounds of the timeline (0-100%)
    const adjustedLeftPos = Math.min(99, Math.max(1, leftPos));

    const tooltipText = `${item.displayName}: ${item.createdAt}`;

    return (
      <div
        className="absolute h-full flex flex-col items-center cursor-pointer"
        style={{ left: `${adjustedLeftPos}%` }}
        onClick={handleClick}
        title={tooltipText}
      >
        <div className="w-0.5 h-full bg-secondary/50"></div>
        <div className="w-3 h-3 rounded-full bg-secondary absolute top-0"></div>
      </div>
    );
  }

  return null;
}

import { formatDuration, intervalToDuration } from 'date-fns';
import { getStatusBadgeColor } from '../runs/columns';
import { TimelineItemProps } from './types';

export function TimelineItem({ item, onClick }: TimelineItemProps) {
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

    const timeRange = itemEndTime - itemStartTime;
    const leftPos = ((itemStartTime - 0) / timeRange) * 100;
    const itemWidth = 300;

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
        <div className="z-10 px-1 text-xs font-medium truncate text-gray-900 dark:text-white">
          {item.displayName}
        </div>
        {itemWidth > 20 && (
          <div className="z-10 text-xs absolute bottom-0 right-1 text-gray-900 dark:text-white opacity-80">
            {formatDuration(duration, {
              format: ['days', 'hours', 'minutes', 'seconds'],
              delimiter: ', ',
            })}
          </div>
        )}
      </div>
    );
  }

  // Handle events with createdAt
  if (item.createdAt) {
    const itemTime = new Date(item.createdAt).getTime();
    const timeRange = Date.now() - itemTime;
    const leftPos = ((itemTime - 0) / timeRange) * 100;

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
        {item.metadata?.id && (
          <div className="absolute -top-6 text-xs whitespace-nowrap transform -translate-x-1/2 text-muted-foreground">
            {item.metadata.id}
          </div>
        )}
      </div>
    );
  }

  return null;
}

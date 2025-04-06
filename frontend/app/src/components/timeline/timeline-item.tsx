import { Duration, intervalToDuration } from 'date-fns';
import { getStatusBadgeColor } from '../runs/columns';
import { TimelineItemProps } from './types';
import { V1TaskStatus } from '@/lib/api';
import useTimeline from '@/hooks/use-timeline-context';
import { cn } from '@/lib/utils';

export function TimelineItem({ item, onClick }: TimelineItemProps) {
  const { earliest, timeRange } = useTimeline();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if (!item.createdAt) {
    return undefined;
  }

  // Handle run with startedAt
  if (item.startedAt) {
    const itemCreatedAt = new Date(item.createdAt).getTime();
    const itemStartTime = new Date(item.startedAt).getTime();
    const itemEndTime = item.finishedAt
      ? new Date(item.finishedAt).getTime()
      : Date.now();

    // Calculate the total time range (ensure it's at least 1ms to prevent division by zero)
    const duration = Math.max(itemEndTime - itemStartTime, 1);

    const widthPercent = (duration / timeRange) * 100;

    const createdOffset = item.createdAt
      ? Math.round(((itemCreatedAt - earliest) / timeRange) * 100)
      : 0;

    const startedOffset = item.startedAt
      ? Math.round(((itemStartTime - earliest) / timeRange) * 100)
      : 0;

    const timeInQueue = Math.max(itemStartTime - itemCreatedAt, 1);

    const timeToStartWidth = item.startedAt
      ? Math.round((timeInQueue / timeRange) * 100)
      : 0;

    return (
      <>
        <div
          className="absolute h-full rounded cursor-pointer hover:brightness-110 z-10 flex items-center"
          style={{
            width: `${timeToStartWidth}%`,
            left: `${createdOffset}%`,
          }}
        >
          <EventDot />
        </div>
        <div
          className="absolute h-full rounded cursor-pointer hover:brightness-110"
          style={{
            left: `${startedOffset}%`,
            width: `${widthPercent}%`,
          }}
          onClick={handleClick}
        >
          <RunBar
            displayName={item.displayName}
            duration={intervalToDuration({
              start: itemStartTime,
              end: itemEndTime,
            })}
            status={item.status}
          />
        </div>
      </>
    );
  }

  return null;
}

function RunBar({
  displayName,
  duration,
  status,
}: {
  displayName: string;
  duration: Duration;
  status: V1TaskStatus;
}) {
  const statusColorClass = getStatusBadgeColor(status);

  return (
    <div className="flex flex-row items-center h-full rounded-md overflow-hidden">
      <div
        className={cn(
          'z-10 px-1 text-[10px] font-mono font-light text-muted-foreground/60 whitespace-nowrap w-full flex justify-between h-full items-center',
          statusColorClass,
        )}
      ></div>
    </div>
  );
}

function EventDot() {
  return (
    <>
      <div className="flex flex-row items-center h-full ml-[-5px]">
        <div className="w-[10px] h-[10px] rounded-full bg-white/50"></div>
      </div>
      <div className="border-t border-white/50 w-full"></div>
    </>
  );
}

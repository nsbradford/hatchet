import { V1WorkflowRun } from '@/lib/api';

/**
 * Sort timeline items by start time or created time
 */
export function sortTimelineItems(items: V1WorkflowRun[]): V1WorkflowRun[] {
  return [...items].sort((a, b) => {
    const timeA = a.startedAt
      ? new Date(a.startedAt).getTime()
      : a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
    const timeB = b.startedAt
      ? new Date(b.startedAt).getTime()
      : b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;
    return timeA - timeB;
  });
}

/**
 * Calculate the earliest and latest times from a set of timeline items
 */
export function calculateTimeRange(items: V1WorkflowRun[]): {
  earliestTime: number;
  latestTime: number;
} {
  if (!items || items.length === 0) {
    const now = Date.now();
    return { earliestTime: now, latestTime: now };
  }

  let earliestTime = Infinity;
  let latestTime = -Infinity;

  items.forEach((item) => {
    if (item.startedAt) {
      const startTime = new Date(item.startedAt).getTime();
      earliestTime = Math.min(earliestTime, startTime);

      if (item.finishedAt) {
        const endTime = new Date(item.finishedAt).getTime();
        // Ensure end time is after start time
        if (endTime > startTime) {
          latestTime = Math.max(latestTime, endTime);
        } else {
          latestTime = Math.max(latestTime, startTime);
        }
      } else {
        // If not finished, use current time
        latestTime = Math.max(latestTime, Date.now());
      }
    } else if (item.createdAt) {
      const createdTime = new Date(item.createdAt).getTime();
      earliestTime = Math.min(earliestTime, createdTime);
      latestTime = Math.max(latestTime, createdTime);
    }
  });

  // Handle edge case where no valid times were found
  if (earliestTime === Infinity || latestTime === -Infinity) {
    const now = Date.now();
    return { earliestTime: now, latestTime: now };
  }

  // Ensure we have at least 1ms difference to prevent division by zero issues
  if (earliestTime === latestTime) {
    latestTime = earliestTime + 1;
  }

  // Add padding to the time range (5% on each side)
  const timeSpan = latestTime - earliestTime;
  const padding = Math.max(timeSpan * 0.05, 1); // at least 1ms padding

  earliestTime = Math.floor(earliestTime - padding);
  latestTime = Math.ceil(latestTime + padding);

  return { earliestTime, latestTime };
}

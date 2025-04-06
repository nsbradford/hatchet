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
  let earliestTime = Infinity;
  let latestTime = -Infinity;

  items.forEach((item) => {
    if (item.startedAt) {
      earliestTime = Math.min(earliestTime, new Date(item.startedAt).getTime());
      if (item.finishedAt) {
        latestTime = Math.max(latestTime, new Date(item.finishedAt).getTime());
      } else {
        latestTime = Math.max(latestTime, Date.now());
      }
    } else if (item.createdAt) {
      earliestTime = Math.min(earliestTime, new Date(item.createdAt).getTime());
      latestTime = Math.max(latestTime, new Date(item.createdAt).getTime());
    }
  });

  // Add padding to the time range
  earliestTime = Math.floor(earliestTime - (latestTime - earliestTime) * 0.05);
  latestTime = Math.ceil(latestTime + (latestTime - earliestTime) * 0.05);

  return { earliestTime, latestTime };
}

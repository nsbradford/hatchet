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

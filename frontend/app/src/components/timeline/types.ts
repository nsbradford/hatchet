import { V1WorkflowRun } from '@/lib/api';

export interface TimelineProps {
  items: V1WorkflowRun[];
  showLabels?: boolean;
  minWidth?: number;
  height?: number;
}

export interface TimelineItemProps {
  item: V1WorkflowRun;
  onClick?: () => void;
}

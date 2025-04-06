'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  V1TaskSummary,
  V1TaskStatus,
  WorkflowRunOrderByField,
} from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Time } from '@/components/ui/time';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { formatDuration, intervalToDuration } from 'date-fns';
import type { Duration } from 'date-fns';

export const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const getStatusBadgeColor = (status: V1TaskStatus) => {
  const statusMap: Record<string, string> = {
    COMPLETED: 'bg-green-500 hover:bg-green-600',
    FAILED: 'bg-red-500 hover:bg-red-600',
    RUNNING: 'bg-blue-500 hover:bg-blue-600',
    PENDING: 'bg-yellow-500 hover:bg-yellow-600',
    CANCELLED: 'bg-gray-500 hover:bg-gray-600',
  };

  return statusMap[status] || 'bg-gray-500 hover:bg-gray-600';
};

export const columns: ColumnDef<V1TaskSummary>[] = [
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as V1TaskStatus;
      return (
        <div className="flex items-center justify-center h-full">
          <Badge
            className={getStatusBadgeColor(status)}
            variant="xs"
            tooltipContent={status}
            animated={status === 'RUNNING'}
          />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'startedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Started"
        orderBy={WorkflowRunOrderByField.StartedAt}
      />
    ),
    cell: ({ row }) => {
      const startedAt = row.getValue('startedAt') as string | null;
      if (!startedAt) {
        return <span>-</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Time
                  date={startedAt}
                  variant="compact"
                  className="font-mono text-xs text-muted-foreground whitespace-nowrap"
                  asChild
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <Time date={startedAt} variant="timeSince" asChild />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'displayName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Run ID" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('displayName')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'workflowName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workflow" />
    ),
    cell: ({ row }) => <div>{row.getValue('workflowName')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created"
        orderBy={WorkflowRunOrderByField.CreatedAt}
      />
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Time date={row.getValue('createdAt')} variant="timeSince" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <Time date={row.getValue('createdAt')} variant="timestamp" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const startedAt = row.getValue('startedAt') as string | null;
      const finishedAt = row.getValue('finishedAt') as string | null;
      const status = row.getValue('status') as V1TaskStatus;

      if (!startedAt) {
        return <span>-</span>;
      }

      const start = new Date(startedAt);
      // For ongoing tasks (RUNNING or PENDING status), use current time instead of finishedAt
      const end = finishedAt ? new Date(finishedAt) : new Date();

      // Calculate duration
      const duration = intervalToDuration({ start, end });

      // Custom formatting to make it more compact
      const formatCompactDuration = (duration: Duration) => {
        const parts = [];
        if (duration.days) {
          parts.push(`${duration.days}d`);
        }
        if (duration.hours) {
          parts.push(`${duration.hours}h`);
        }
        if (duration.minutes) {
          parts.push(`${duration.minutes}m`);
        }
        if (duration.seconds || !parts.length) {
          parts.push(`${duration.seconds || 0}s`);
        }
        return parts.length ? parts.join(' ') : '< 1s';
      };

      const compactDuration = formatCompactDuration(duration);

      // For RUNNING status, add a visual indicator
      const isRunning = status === 'RUNNING';

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={isRunning ? 'animate-pulse' : ''}>
                {compactDuration}
                {isRunning && '...'}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {isRunning ? 'Running for ' : ''}
              {formatDuration(duration, {
                format: ['days', 'hours', 'minutes', 'seconds'],
                delimiter: ', ',
              }) || '< 1 second'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end h-full">
        <DataTableRowActions row={row} />
      </div>
    ),
    enableHiding: false,
  },
];

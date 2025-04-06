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
import { intervalToDuration } from 'date-fns';
import { formatDuration, RunId } from './run-id';
import { Clock } from 'lucide-react';

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
    accessorKey: 'runId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Run ID" />
    ),
    cell: ({ row }) => <RunId run={row.original} />,
    enableSorting: true,
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
      const finishedAt = row.original.finishedAt as string | null;
      const status = row.getValue('status') as V1TaskStatus;

      if (!startedAt) {
        return <span>-</span>;
      }

      const start = new Date(startedAt);
      // For ongoing tasks (RUNNING or PENDING status), use current time instead of finishedAt
      const end = finishedAt ? new Date(finishedAt) : new Date();

      // Calculate duration
      const duration = intervalToDuration({ start, end });

      const rawDuration = end.getTime() - start.getTime();
      const compactDuration = formatDuration(duration, rawDuration);

      // For RUNNING status, add a visual indicator
      const isRunning = status === 'RUNNING';

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={isRunning ? 'animate-pulse' : ''}>
                  {compactDuration}
                  {isRunning && '...'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isRunning ? 'Running for ' : ''}
              {formatDuration(duration, rawDuration)}
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

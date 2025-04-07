import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Time } from '@/components/ui/time';
import { DocsButton } from '@/components/ui/docs-button';
import docs from '@/docs-meta-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { MoreHorizontal, RefreshCw, Trash2, Clock, Plus } from 'lucide-react';
import { ScheduledWorkflows, WorkflowRunStatus } from '@/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { DestructiveDialog } from '@/components/ui/dialog/destructive-dialog';
import {
  Pagination,
  usePagination,
} from '@/components/ui/pagination/pagination';
import useSchedules from '@/hooks/use-schedules';

interface ScheduledRunsTableProps {
  onCreateClicked: () => void;
}

export function ScheduledRunsTable({
  onCreateClicked,
}: ScheduledRunsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<ScheduledWorkflows | null>(
    null,
  );
  const pagination = usePagination();

  const {
    data: scheduledRunsData = [],
    isLoading,
    delete: deleteSchedule,
  } = useSchedules({
    refetchInterval: 5000,
    paginationManager: pagination,
  });

  const handleDeleteClick = (run: ScheduledWorkflows) => {
    setSelectedRun(run);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRun) {
      await deleteSchedule.mutateAsync(selectedRun.metadata.id);
      setDeleteDialogOpen(false);
      setSelectedRun(null);
    }
  };

  const getStatusBadge = (status?: WorkflowRunStatus) => {
    if (!status) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          Pending
        </Badge>
      );
    }

    switch (status) {
      case 'RUNNING':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Running
          </Badge>
        );
      case 'SUCCEEDED':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Succeeded
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Failed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancelled
          </Badge>
        );
      case 'QUEUED':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Queued
          </Badge>
        );
      case 'BACKOFF':
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Backoff
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Separator className="my-6" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trigger At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledRunsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24">
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <p className="text-md">No scheduled runs found.</p>
                    <p className="text-sm text-muted-foreground">
                      Create a new scheduled run to get started.
                    </p>
                    {
                      <Button onClick={onCreateClicked}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Scheduled Run
                      </Button>
                    }
                    <DocsButton doc={docs.home['scheduled-runs']} />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scheduledRunsData.map((run) => (
                <TableRow key={run.metadata.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{run.workflowName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(run.workflowRunStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Time date={run.triggerAt} variant="timeSince" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <Time date={run.triggerAt} variant="timestamp" />
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Time date={run.metadata.createdAt} variant="timestamp" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(run);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination />
      </div>

      <DestructiveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Scheduled Run"
        description={`Are you sure you want to delete the scheduled run "${selectedRun?.workflowName}"?`}
        confirmationText="confirm"
        confirmButtonText="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

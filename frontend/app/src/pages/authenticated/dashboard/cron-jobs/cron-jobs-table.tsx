import { Badge } from '@/components/ui/badge';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, CalendarDays, RefreshCw } from 'lucide-react';
import useCrons from '@/hooks/use-crons';
import {
  PageSelector,
  PageSizeSelector,
  Pagination,
  usePagination,
} from '@/components/ui/pagination';
import { Time } from '@/components/ui/time';
import { DestructiveDialog } from '@/components/ui/dialog/destructive-dialog';
import { useState } from 'react';
import { CronWorkflows } from '@/lib/api';
import cronstrue from 'cronstrue';

export default function CronJobsTable() {
  const paginationManager = usePagination();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCron, setSelectedCron] = useState<CronWorkflows>();

  const {
    data: crons = [],
    isLoading,
    delete: deleteCron,
  } = useCrons({
    paginationManager,
  });

  const handleDeleteCron = async (cronId: string) => {
    try {
      await deleteCron.mutateAsync(cronId);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete cron job:', error);
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Expression</TableHead>
            <TableHead>Parsed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No cron jobs found.
              </TableCell>
            </TableRow>
          ) : (
            crons.map((cron) => (
              <TableRow key={cron.metadata.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    {cron.name || `Cron-${cron.metadata.id.substring(0, 8)}`}
                  </div>
                </TableCell>
                <TableCell>{cron.workflowName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {cron.cron}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {cron.cron
                        ? cronstrue.toString(cron.cron)
                        : 'No schedule'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {cron.enabled ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      Paused
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <Time date={cron.metadata.createdAt} variant="timestamp" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCron(cron);
                            setDeleteDialogOpen(true);
                          }}
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
      <Pagination className="p-2 justify-between flex flex-row">
        <PageSizeSelector />
        <PageSelector variant="dropdown" />
      </Pagination>

      <DestructiveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Cron Job"
        description={`Are you sure you want to delete this cron job? This action will stop all future runs.`}
        confirmationText={selectedCron?.name || 'confirm'}
        confirmButtonText="Delete"
        onConfirm={() =>
          selectedCron && handleDeleteCron(selectedCron.metadata.id)
        }
      />
    </div>
  );
}

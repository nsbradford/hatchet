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
import {
  MoreHorizontal,
  Trash2,
  Play,
  Pause,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import useCrons from '@/hooks/use-crons';
import {
  PageSelector,
  PageSizeSelector,
  Pagination,
  usePagination,
} from '@/components/ui/pagination';
import { Time } from '@/components/ui/time';

export default function CronJobsTable() {
  const paginationManager = usePagination();

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
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      title={cron.enabled ? 'Pause' : 'Activate'}
                      disabled
                    >
                      {cron.enabled ? (
                        <Pause className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Play className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
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
                          onClick={() => handleDeleteCron(cron.metadata.id)}
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
    </div>
  );
}

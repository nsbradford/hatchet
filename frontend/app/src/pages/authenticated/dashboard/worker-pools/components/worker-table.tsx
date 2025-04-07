import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { MoreHorizontal, Play, Pause } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { SlotsBadge } from './slots-badge';
import { WorkerStatus } from './worker-filter';
import { Worker } from '@/lib/api';

interface WorkerTableProps {
  workers: Worker[];
  poolName: string;
  isLoading: boolean;
  selectedWorkers: string[];
  toggleSelectWorker: (workerId: string) => void;
  selectAllWorkers: () => void;
  clearSelection: () => void;
  handleResumeWorker: (workerId: string) => void;
  handlePauseWorker: (workerId: string) => void;
  handleStopWorker?: (workerId: string) => void;
  filterStatus: WorkerStatus;
}

// Skeleton for table row
export const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-4 mx-auto" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </TableCell>
  </TableRow>
);

export function WorkerTable({
  workers,
  poolName,
  isLoading,
  selectedWorkers,
  toggleSelectWorker,
  selectAllWorkers,
  clearSelection,
  handleResumeWorker,
  handlePauseWorker,
  handleStopWorker,
  filterStatus,
}: WorkerTableProps) {
  // Filter workers based on selected status
  const filteredWorkers = workers.filter((worker) => {
    if (filterStatus === 'all') {
      return true;
    }
    if (filterStatus === 'active' && worker.status === 'ACTIVE') {
      return true;
    }
    if (filterStatus === 'paused' && worker.status === 'PAUSED') {
      return true;
    }
    if (filterStatus === 'inactive' && worker.status === 'INACTIVE') {
      return true;
    }
    return false;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={
                    selectedWorkers.length > 0 &&
                    selectedWorkers.length === filteredWorkers.length
                  }
                  onChange={
                    selectedWorkers.length === filteredWorkers.length
                      ? clearSelection
                      : selectAllWorkers
                  }
                  className="h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Slots</TableHead>
            <TableHead>Last Heartbeat</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Skeleton loading state
            Array(5)
              .fill(0)
              .map((_, index) => <TableRowSkeleton key={index} />)
          ) : filteredWorkers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {filterStatus === 'all'
                  ? 'No workers in this pool.'
                  : `No ${filterStatus} workers in this pool.`}
              </TableCell>
            </TableRow>
          ) : (
            filteredWorkers.map((worker) => (
              <TableRow key={worker.metadata.id}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.metadata.id)}
                      onChange={() => toggleSelectWorker(worker.metadata.id)}
                      className="h-4 w-4"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    to={`/pools/${encodeURIComponent(poolName)}/${encodeURIComponent(
                      worker.metadata.id,
                    )}`}
                    className="hover:underline text-primary"
                  >
                    {worker.metadata.id.substring(0, 8)}...
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge status={worker.status} />
                </TableCell>
                <TableCell>
                  <SlotsBadge
                    available={
                      worker.status === 'ACTIVE' ? worker.availableRuns || 0 : 0
                    }
                    max={worker.maxRuns || 0}
                  />
                </TableCell>
                <TableCell>
                  {worker.lastHeartbeatAt
                    ? new Date(worker.lastHeartbeatAt).toLocaleString()
                    : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    {worker.status !== 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResumeWorker(worker.metadata.id)}
                        title="Resume Worker"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {worker.status !== 'PAUSED' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePauseWorker(worker.metadata.id)}
                        title="Pause Worker"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
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
                          onClick={() => handleResumeWorker(worker.metadata.id)}
                        >
                          Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePauseWorker(worker.metadata.id)}
                        >
                          Pause
                        </DropdownMenuItem>
                        {handleStopWorker && (
                          <DropdownMenuItem
                            onClick={() => handleStopWorker(worker.metadata.id)}
                            className="text-red-600"
                          >
                            Stop
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

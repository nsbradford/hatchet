import useWorkers from '@/hooks/use-workers';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  ArrowUpRight,
  Cloud,
  Server,
  Zap,
  X,
  Pause,
  Play,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { SlotsBadge } from './components/slots-badge';

// Status badge component to reduce repetition
const StatusBadge = ({
  count,
  status,
}: {
  count: number;
  status: 'ACTIVE' | 'NO_AVAILABLE' | 'PAUSED';
}) => {
  if (status !== 'ACTIVE' && count <= 0) {
    return null;
  }

  const statusConfig = {
    ACTIVE: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Active',
    },
    NO_AVAILABLE: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Inactive',
    },
    PAUSED: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Paused',
    },
  };

  const config =
    status !== 'ACTIVE' && count <= 0
      ? statusConfig.NO_AVAILABLE
      : statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border}`}
    >
      {count} {config.label}
    </Badge>
  );
};

// Pool row component to simplify the main component
const PoolRow = ({ pool }: { pool: any }) => {
  const { data: workers = [], bulkUpdate } = useWorkers();

  const getLastActiveTime = () => {
    const mostRecentWorker = pool.workers
      .filter((worker: any) => worker.lastHeartbeatAt)
      .sort(
        (a: any, b: any) =>
          new Date(b.lastHeartbeatAt).getTime() -
          new Date(a.lastHeartbeatAt).getTime(),
      )[0];

    return mostRecentWorker?.lastHeartbeatAt
      ? new Date(mostRecentWorker.lastHeartbeatAt).toLocaleString()
      : 'Never';
  };

  // Calculate slots totals
  const totalMaxRuns = pool.workers
    .filter((worker: any) => worker.status === 'ACTIVE')
    .reduce((sum: number, worker: any) => sum + (worker.maxRuns || 0), 0);
  const totalAvailableRuns = pool.workers
    .filter((worker: any) => worker.status === 'ACTIVE')
    .reduce((sum: number, worker: any) => sum + (worker.availableRuns || 0), 0);

  // Handlers for pause and resume
  const handlePauseAllActive = async () => {
    // Get all active worker IDs for this pool
    const activeWorkerIds = pool.workers
      .filter((worker: any) => worker.status === 'ACTIVE')
      .map((worker: any) => worker.metadata.id);

    if (activeWorkerIds.length > 0) {
      await bulkUpdate.mutateAsync({
        workerIds: activeWorkerIds,
        data: { isPaused: true },
      });
    }
  };

  const handleResumeAllPaused = async () => {
    // Get all paused worker IDs for this pool
    const pausedWorkerIds = pool.workers
      .filter((worker: any) => worker.status === 'PAUSED')
      .map((worker: any) => worker.metadata.id);

    if (pausedWorkerIds.length > 0) {
      await bulkUpdate.mutateAsync({
        workerIds: pausedWorkerIds,
        data: { isPaused: false },
      });
    }
  };

  return (
    <TableRow key={pool.id}>
      <TableCell className="font-medium">
        <Link to={`/pools/${encodeURIComponent(pool.name)}`}>{pool.name}</Link>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <StatusBadge count={pool.activeCount} status="ACTIVE" />
          <StatusBadge count={pool.pausedCount} status="PAUSED" />
        </div>
      </TableCell>
      <TableCell>
        <SlotsBadge available={totalAvailableRuns} max={totalMaxRuns} />
      </TableCell>
      <TableCell>{getLastActiveTime()}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <Link to={`/pools/${encodeURIComponent(pool.name)}`}>
            <Button variant="ghost" size="icon">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
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
              <DropdownMenuItem>
                <Link
                  to={`/pools/${encodeURIComponent(pool.name)}`}
                  className="w-full"
                >
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={pool.activeCount === 0}
                onClick={handlePauseAllActive}
                className="flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause all active workers
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={pool.pausedCount === 0}
                onClick={handleResumeAllPaused}
                className="flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume all paused workers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Skeleton row component for loading state
const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-5 w-[180px]" />
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-[90px]" />
        <Skeleton className="h-6 w-[100px]" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-[80px]" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-[120px]" />
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);

// Hatchet Cloud advertisement component
const HatchetCloudCard = ({ onDismiss }: { onDismiss: () => void }) => (
  <Card className="mt-8 relative">
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-6 w-6"
      onClick={onDismiss}
      aria-label="Dismiss"
    >
      <X className="h-4 w-4" />
    </Button>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Cloud className="h-5 w-5 text-primary" />
        <CardTitle>Hatchet Cloud</CardTitle>
      </div>
      <CardDescription>
        Managed compute infrastructure for your Hatchet workflows
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0">
        <div className="flex items-start space-x-2">
          <Server className="mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Fully managed worker pools with auto-scaling
          </p>
        </div>
        <div className="flex items-start space-x-2">
          <Zap className="mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Zero maintenance, high availability, and instant scaling
          </p>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <a
        href="https://docs.hatchet.run/home/managed-compute"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline">Learn more about Hatchet Cloud</Button>
      </a>
    </CardFooter>
  </Card>
);

export default function WorkerPoolsPage() {
  const [showCloudCard, setShowCloudCard] = useState(true);

  // Check local storage on component mount
  useEffect(() => {
    const isHidden = localStorage.getItem('hideHatchetCloudCard') === 'true';
    setShowCloudCard(!isHidden);
  }, []);

  // Handle dismissal
  const handleDismissCard = () => {
    localStorage.setItem('hideHatchetCloudCard', 'true');
    setShowCloudCard(false);
  };

  const {
    data: workers = [],
    isLoading,
    filters,
    setFilters,
    paginationState,
    setPagination,
    pagination,
  } = useWorkers({
    refetchInterval: 5000,
  });

  // Process the workers to group by name (pool)
  const workerPools = workers.reduce((pools: Record<string, any>, worker) => {
    const poolName = worker.name;
    if (!pools[poolName]) {
      pools[poolName] = {
        id: poolName,
        name: poolName,
        workersCount: 0,
        activeCount: 0,
        inactiveCount: 0,
        pausedCount: 0,
        workers: [],
      };
    }

    pools[poolName].workersCount++;
    if (worker.status === 'ACTIVE') {
      pools[poolName].activeCount++;
    } else if (worker.status === 'INACTIVE') {
      pools[poolName].inactiveCount++;
    } else if (worker.status === 'PAUSED') {
      pools[poolName].pausedCount++;
    }

    pools[poolName].workers.push(worker);
    return pools;
  }, {});

  // Convert to array for the table
  const poolsData = Object.values(workerPools);

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setFilters({
      ...filters,
      status:
        status === 'ALL'
          ? undefined
          : (status as 'ACTIVE' | 'INACTIVE' | 'PAUSED'),
    });
  };

  // Pagination handlers
  const handleNextPage = () => {
    setPagination({
      ...paginationState,
      currentPage: paginationState.currentPage + 1,
    });
  };

  const handlePreviousPage = () => {
    if (paginationState.currentPage > 1) {
      setPagination({
        ...paginationState,
        currentPage: paginationState.currentPage - 1,
      });
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => <SkeletonRow key={`skeleton-${index}`} />);
    }

    if (poolsData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            No worker pools found.
          </TableCell>
        </TableRow>
      );
    }

    return poolsData.map((pool: any) => <PoolRow key={pool.id} pool={pool} />);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <div className="flex gap-4 mb-6">
          <Select
            value={filters.status || 'ALL'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Slots</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableContent()}</TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={paginationState.currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={
              !pagination ||
              paginationState.currentPage >= (pagination?.num_pages || 0) ||
              isLoading
            }
          >
            Next
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {paginationState.currentPage} of {pagination?.num_pages || 1}
          </div>
        </div>

        {showCloudCard && <HatchetCloudCard onDismiss={handleDismissCard} />}
      </div>
    </div>
  );
}

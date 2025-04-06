import { useState } from 'react';
import useWorkers from '@/hooks/use-workers';
import { Input } from '@/components/ui/input';
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
  Search,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
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

export default function WorkerPoolsPage() {
  const {
    data: workers = [],
    isLoading,
    filters,
    setFilters,
    paginationState,
    setPagination,
  } = useWorkers({
    initialPagination: { currentPage: 1, pageSize: 10 },
  });

  const [searchInput, setSearchInput] = useState(filters.search || '');

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

  // Handle search submission
  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput });
  };

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Worker Pools</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search worker pools..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button type="submit" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
                <TableHead>Workers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : poolsData.length > 0 ? (
                poolsData.map((pool: any) => (
                  <TableRow key={pool.id}>
                    <TableCell className="font-medium">{pool.name}</TableCell>
                    <TableCell>{pool.workersCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pool.activeCount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {pool.activeCount} Active
                          </Badge>
                        )}
                        {pool.inactiveCount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            {pool.inactiveCount} Inactive
                          </Badge>
                        )}
                        {pool.pausedCount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            {pool.pausedCount} Paused
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const mostRecentWorker = pool.workers
                          .filter((worker: any) => worker.lastHeartbeatAt)
                          .sort(
                            (a: any, b: any) =>
                              new Date(b.lastHeartbeatAt).getTime() -
                              new Date(a.lastHeartbeatAt).getTime(),
                          )[0];

                        if (mostRecentWorker?.lastHeartbeatAt) {
                          return new Date(
                            mostRecentWorker.lastHeartbeatAt,
                          ).toLocaleString();
                        }

                        return 'Never';
                      })()}
                    </TableCell>
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
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>
                              Pause all workers
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Stop all workers
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No worker pools found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{poolsData.length}</span>{' '}
            worker pools
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={paginationState.currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

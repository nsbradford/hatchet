import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useWorkers from '@/hooks/use-workers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  MoreHorizontal,
  ChevronLeft,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function PoolDetailPage() {
  const { poolName = '' } = useParams<{ poolName: string }>();
  const decodedPoolName = decodeURIComponent(poolName);

  const {
    data: workers = [],
    isLoading,
    update,
  } = useWorkers({
    initialPagination: { currentPage: 1, pageSize: 100 },
  });

  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  // Filter workers for this pool
  const poolWorkers = useMemo(() => {
    return workers.filter((worker) => worker.name === decodedPoolName);
  }, [workers, decodedPoolName]);

  // Pool stats
  const poolStats = useMemo(() => {
    const stats = {
      total: poolWorkers.length,
      active: 0,
      inactive: 0,
      paused: 0,
      lastActive: null as Date | null,
    };

    poolWorkers.forEach((worker) => {
      if (worker.status === 'ACTIVE') {
        stats.active++;
      } else if (worker.status === 'INACTIVE') {
        stats.inactive++;
      } else if (worker.status === 'PAUSED') {
        stats.paused++;
      }

      if (worker.lastHeartbeatAt) {
        const heartbeatTime = new Date(worker.lastHeartbeatAt);
        if (!stats.lastActive || heartbeatTime > stats.lastActive) {
          stats.lastActive = heartbeatTime;
        }
      }
    });

    return stats;
  }, [poolWorkers]);

  // Handlers for worker actions
  const handlePauseWorker = async (workerId: string) => {
    try {
      await update.mutateAsync({
        workerId,
        data: { isPaused: true },
      });
    } catch (error) {
      console.error('Failed to pause worker:', error);
    }
  };

  const handleResumeWorker = async (workerId: string) => {
    try {
      await update.mutateAsync({
        workerId,
        data: { isPaused: false },
      });
    } catch (error) {
      console.error('Failed to resume worker:', error);
    }
  };

  const handleStopWorker = async (workerId: string) => {
    try {
      await update.mutateAsync({
        workerId,
        data: { isPaused: true },
      });
    } catch (error) {
      console.error('Failed to stop worker:', error);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'pause' | 'resume' | 'stop') => {
    const isPaused = action === 'resume' ? false : true;

    for (const workerId of selectedWorkers) {
      try {
        await update.mutateAsync({
          workerId,
          data: { isPaused },
        });
      } catch (error) {
        console.error(`Failed to ${action} worker ${workerId}:`, error);
      }
    }

    // Clear selection after bulk action
    setSelectedWorkers([]);
  };

  const toggleSelectWorker = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  const selectAllWorkers = () => {
    const allWorkerIds = poolWorkers.map((worker) => worker.metadata.id);
    setSelectedWorkers(allWorkerIds);
  };

  const clearSelection = () => {
    setSelectedWorkers([]);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return <Badge variant="outline">Unknown</Badge>;
    }

    switch (status) {
      case 'ACTIVE':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Inactive
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Paused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center mb-4">
        <Link to="/pools" className="mr-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Pools
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{decodedPoolName}</h1>
          <p className="text-muted-foreground">
            Worker pool details and management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{poolStats.total}</div>
              <p className="text-sm text-muted-foreground">Total Workers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {poolStats.active}
              </div>
              <p className="text-sm text-muted-foreground">Active Workers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {poolStats.paused}
              </div>
              <p className="text-sm text-muted-foreground">Paused Workers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {poolStats.inactive}
              </div>
              <p className="text-sm text-muted-foreground">Inactive Workers</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Workers in this Pool</h3>
            {selectedWorkers.length > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('resume')}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('pause')}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleBulkAction('stop')}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop Selected
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear Selection ({selectedWorkers.length})
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={selectAllWorkers}>
                Select All
              </Button>
            )}
          </div>
          <Separator className="my-2" />
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
                            selectedWorkers.length === poolWorkers.length
                          }
                          onChange={
                            selectedWorkers.length === poolWorkers.length
                              ? clearSelection
                              : selectAllWorkers
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Heartbeat</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poolWorkers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No workers in this pool.
                      </TableCell>
                    </TableRow>
                  ) : (
                    poolWorkers.map((worker) => (
                      <TableRow key={worker.metadata.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedWorkers.includes(
                                worker.metadata.id,
                              )}
                              onChange={() =>
                                toggleSelectWorker(worker.metadata.id)
                              }
                              className="h-4 w-4"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            to={`/pools/${encodeURIComponent(decodedPoolName)}/${encodeURIComponent(worker.metadata.id)}`}
                            className="hover:underline text-primary"
                          >
                            {worker.metadata.id.substring(0, 8)}...
                          </Link>
                        </TableCell>
                        <TableCell>{getStatusBadge(worker.status)}</TableCell>
                        <TableCell>{worker.type}</TableCell>
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
                                onClick={() =>
                                  handleResumeWorker(worker.metadata.id)
                                }
                                title="Resume Worker"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {worker.status !== 'PAUSED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handlePauseWorker(worker.metadata.id)
                                }
                                title="Pause Worker"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {worker.status !== 'INACTIVE' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStopWorker(worker.metadata.id)
                                }
                                title="Stop Worker"
                              >
                                <StopCircle className="h-4 w-4" />
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
                                  onClick={() =>
                                    handleResumeWorker(worker.metadata.id)
                                  }
                                >
                                  Resume
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePauseWorker(worker.metadata.id)
                                  }
                                >
                                  Pause
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleStopWorker(worker.metadata.id)
                                  }
                                >
                                  Stop
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

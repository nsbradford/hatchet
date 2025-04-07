import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useWorkers from '@/hooks/use-workers';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import {
  WorkerFilter,
  WorkerStats,
  WorkerTable,
  type WorkerStatus,
} from './components';
import BasicLayout from '@/components/layouts/basic.layout';
import { DocsButton } from '@/components/ui/docs-button';
import {
  Headline,
  PageTitle,
  HeadlineActions,
  HeadlineActionItem,
} from '@/components/ui/page-header';
import docs from '@/docs-meta-data';

// Worker action types for code reusability
type WorkerAction = 'pause' | 'resume' | 'stop';

export default function PoolDetailPage() {
  const { poolName = '' } = useParams<{ poolName: string }>();
  const decodedPoolName = decodeURIComponent(poolName);

  const {
    data: workers = [],
    isLoading,
    update,
  } = useWorkers({
    refetchInterval: 5000,
  });

  const { setBreadcrumbs } = useBreadcrumbs();
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<WorkerStatus>('active');

  useEffect(() => {
    if (!workers) {
      return;
    }

    const breadcrumbs = [
      {
        title: poolName,
        url: `/pools/${encodeURIComponent(decodedPoolName)}`,
      },
    ];

    setBreadcrumbs(breadcrumbs);

    // Clear breadcrumbs when this component unmounts
    return () => {
      setBreadcrumbs([]);
    };
  }, [workers, decodedPoolName, setBreadcrumbs, poolName]);

  // Filter workers for this pool
  const poolWorkers = useMemo(() => {
    return workers.filter((worker) => worker.name === decodedPoolName);
  }, [workers, decodedPoolName]);

  // Pool stats
  const poolStats = useMemo(() => {
    return {
      total: poolWorkers.length,
      active: poolWorkers.filter((worker) => worker.status === 'ACTIVE').length,
      inactive: poolWorkers.filter((worker) => worker.status === 'INACTIVE')
        .length,
      paused: poolWorkers.filter((worker) => worker.status === 'PAUSED').length,
      slots: poolWorkers
        .filter((worker: any) => worker.status === 'ACTIVE')
        .reduce((sum: number, worker: any) => sum + (worker.maxRuns || 0), 0),
      maxSlots: poolWorkers
        .filter((worker: any) => worker.status === 'ACTIVE')
        .reduce((sum: number, worker: any) => sum + (worker.maxRuns || 0), 0),
      lastActive: null,
    };
  }, [poolWorkers]);

  // Generic worker action handler
  const handleWorkerAction = async (workerId: string, action: WorkerAction) => {
    try {
      await update.mutateAsync({
        workerId,
        data: { isPaused: action !== 'resume' },
      });
    } catch (error) {
      console.error(`Failed to ${action} worker:`, error);
    }
  };

  // Handlers for worker actions
  const handlePauseWorker = (workerId: string) =>
    handleWorkerAction(workerId, 'pause');
  const handleResumeWorker = (workerId: string) =>
    handleWorkerAction(workerId, 'resume');
  const handleStopWorker = (workerId: string) =>
    handleWorkerAction(workerId, 'stop');

  // Bulk actions
  const handleBulkAction = async (action: WorkerAction) => {
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
    const filteredWorkers = poolWorkers.filter((worker) => {
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

    const allWorkerIds = filteredWorkers.map((worker) => worker.metadata.id);
    setSelectedWorkers(allWorkerIds);
  };

  const clearSelection = () => {
    setSelectedWorkers([]);
  };

  // Handler for filter status change
  const handleStatusChange = (status: WorkerStatus) => {
    setFilterStatus(status);
    // Clear selection when filter changes
    setSelectedWorkers([]);
  };

  return (
    <BasicLayout>
      <Headline>
        <PageTitle description="Manage workers in a worker pool">
          {decodedPoolName}
        </PageTitle>
        <HeadlineActions>
          <HeadlineActionItem>
            <DocsButton doc={docs.home.workers} size="icon" />
          </HeadlineActionItem>
        </HeadlineActions>
      </Headline>
      <Separator className="my-4" />

      {/* Stats Cards */}
      <div className="mb-6">
        <WorkerStats
          stats={poolStats}
          isLoading={isLoading}
          onFilterChange={handleStatusChange}
          currentFilter={filterStatus}
        />
      </div>

      <div className="mb-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-2">
          <h3 className="text-lg font-medium">
            {filterStatus === 'all'
              ? 'All Workers'
              : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Workers`}
          </h3>

          {/* Worker Filters */}
          <WorkerFilter
            selectedStatus={filterStatus}
            onStatusChange={handleStatusChange}
            counts={{
              all: poolStats.total,
              active: poolStats.active,
              paused: poolStats.paused,
              inactive: poolStats.inactive,
            }}
          />

          {/* Bulk Actions */}
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

        {/* Worker Table with Filtering */}
        <WorkerTable
          workers={poolWorkers}
          poolName={decodedPoolName}
          isLoading={isLoading}
          selectedWorkers={selectedWorkers}
          toggleSelectWorker={toggleSelectWorker}
          selectAllWorkers={selectAllWorkers}
          clearSelection={clearSelection}
          handleResumeWorker={handleResumeWorker}
          handlePauseWorker={handlePauseWorker}
          handleStopWorker={handleStopWorker}
          filterStatus={filterStatus}
        />
      </div>
    </BasicLayout>
  );
}

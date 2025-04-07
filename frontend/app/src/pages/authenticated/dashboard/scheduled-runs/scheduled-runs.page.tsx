import { useState } from 'react';
import { ScheduledWorkflows } from '@/lib/api';
import useSchedules from '@/hooks/use-schedules';
import { ScheduledRunsHeader } from './components/scheduled-runs-header';
import { ScheduledRunsTable } from './components/scheduled-runs-table';
import { EditScheduledRunDialog } from './components/edit-scheduled-run-dialog';
import useCan from '@/hooks/use-can';
import { scheduledRuns } from '@/lib/can/features/scheduled-runs.permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

export default function ScheduledRunsPage() {
  const { canWithReason } = useCan();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newScheduledRun, setNewScheduledRun] = useState({
    name: '',
    workflowId: '',
    startTime: '',
    frequency: 'DAILY',
    timezone: 'UTC',
  });
  const [editingRun, setEditingRun] = useState<ScheduledWorkflows | null>(null);

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  const {
    data: scheduledRunsData = [],
    isLoading,
    update,
    create,
    delete: deleteSchedule,
    filters,
    setFilters,
    pagination,
    setPagination,
  } = useSchedules({
    refetchInterval: 5000,
    initialPagination: paginationState,
  });

  const { allowed: canManage, message: canManageMessage } = canWithReason(
    scheduledRuns.manage(),
  );

  // Delete scheduled run
  const deleteScheduledRun = async (id: string) => {
    await deleteSchedule.mutateAsync(id);
  };

  // Handle create new scheduled run
  const handleCreateScheduledRun = async () => {
    await create.mutateAsync({
      workflowName: newScheduledRun.workflowId,
      data: {
        input: {},
        additionalMetadata: {},
        triggerAt: newScheduledRun.startTime,
      },
    });

    setIsCreateDialogOpen(false);
    setNewScheduledRun({
      name: '',
      workflowId: '',
      startTime: '',
      frequency: 'DAILY',
      timezone: 'UTC',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ScheduledRunsHeader
        isCreateDialogOpen={isCreateDialogOpen}
        onCreateDialogOpenChange={setIsCreateDialogOpen}
        onCreateScheduledRun={handleCreateScheduledRun}
        newScheduledRun={newScheduledRun}
        onNewScheduledRunChange={(field, value) =>
          setNewScheduledRun({ ...newScheduledRun, [field]: value })
        }
      />
      {canManageMessage && (
        <Alert variant="warning">
          <Lock className="w-4 h-4 mr-2" />
          <AlertTitle>Role required</AlertTitle>
          <AlertDescription>{canManageMessage}</AlertDescription>
        </Alert>
      )}

      {canManage && (
        <>
          <ScheduledRunsTable
            scheduledRuns={scheduledRunsData}
            isLoading={isLoading}
            onDelete={deleteScheduledRun}
            onViewDetails={() => {}}
          />

          <EditScheduledRunDialog
            editingRun={editingRun}
            onClose={() => setEditingRun(null)}
            onSave={async (run) => {
              await update.mutateAsync({
                scheduleId: run.metadata.id,
                workflowId: run.workflowId,
                data: {
                  input: run.input || {},
                  additionalMetadata: run.additionalMetadata || {},
                  triggerAt: run.triggerAt,
                },
              });
              setEditingRun(null);
            }}
          />
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ScheduledWorkflows } from '@/lib/api';
import { ScheduledRunsHeader } from './components/scheduled-runs-header';
import { ScheduledRunsTable } from './components/scheduled-runs-table';
import { EditScheduledRunDialog } from './components/edit-scheduled-run-dialog';
import useCan from '@/hooks/use-can';
import { scheduledRuns } from '@/lib/can/features/scheduled-runs.permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { PaginationProvider } from '@/components/ui/pagination/pagination';

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

  const { allowed: canManage, message: canManageMessage } = canWithReason(
    scheduledRuns.manage(),
  );

  // Handle create new scheduled run
  const handleCreateScheduledRun = async () => {
    // Handle create if needed
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
          <PaginationProvider initialPage={1} initialPageSize={5}>
            <ScheduledRunsTable
              onCreateClicked={() => setIsCreateDialogOpen(true)}
            />
          </PaginationProvider>

          <EditScheduledRunDialog
            editingRun={editingRun}
            onClose={() => setEditingRun(null)}
            onSave={async (run) => {
              // Handle save if needed
              setEditingRun(null);
            }}
          />
        </>
      )}
    </div>
  );
}

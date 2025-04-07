import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { DocsButton } from '@/components/ui/docs-button';
import docs from '@/docs-meta-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useCan from '@/hooks/use-can';
import { scheduledRuns } from '@/lib/can/features/scheduled-runs.permissions';

interface ScheduledRunsHeaderProps {
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
  onCreateScheduledRun: () => void;
  newScheduledRun: {
    name: string;
    workflowId: string;
    startTime: string;
    frequency: string;
    timezone: string;
  };
  onNewScheduledRunChange: (field: string, value: string) => void;
}

export function ScheduledRunsHeader({
  isCreateDialogOpen,
  onCreateDialogOpenChange,
  onCreateScheduledRun,
  newScheduledRun,
  onNewScheduledRunChange,
}: ScheduledRunsHeaderProps) {
  const { canWithReason } = useCan();
  const { allowed: canManage } = canWithReason(scheduledRuns.manage());

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Runs</h1>
          <p className="text-muted-foreground">
            Run tasks at a specific date and time
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <DocsButton doc={docs.home['scheduled-runs']} size="icon" />
          {canManage && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={onCreateDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Run
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Run</DialogTitle>
                  <DialogDescription>
                    Set up a scheduled execution of a workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="name">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={newScheduledRun.name}
                      onChange={(e) =>
                        onNewScheduledRunChange('name', e.target.value)
                      }
                      className="col-span-3"
                      placeholder="Daily Data Pipeline"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="workflowId">
                      Workflow ID
                    </label>
                    <Input
                      id="workflowId"
                      value={newScheduledRun.workflowId}
                      onChange={(e) =>
                        onNewScheduledRunChange('workflowId', e.target.value)
                      }
                      className="col-span-3"
                      placeholder="workflow-123"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="startTime">
                      Start Time
                    </label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newScheduledRun.startTime}
                      onChange={(e) =>
                        onNewScheduledRunChange('startTime', e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="frequency">
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      value={newScheduledRun.frequency}
                      onChange={(e) =>
                        onNewScheduledRunChange('frequency', e.target.value)
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="HOURLY">Hourly</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm" htmlFor="timezone">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={newScheduledRun.timezone}
                      onChange={(e) =>
                        onNewScheduledRunChange('timezone', e.target.value)
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => onCreateDialogOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={onCreateScheduledRun}>Schedule Run</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

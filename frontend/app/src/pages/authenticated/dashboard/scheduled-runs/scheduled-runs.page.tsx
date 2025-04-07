import { useState } from 'react';
import { ScheduledRunsTable } from './components/scheduled-runs-table';
import useCan from '@/hooks/use-can';
import { scheduledRuns } from '@/lib/can/features/scheduled-runs.permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Lock, Plus } from 'lucide-react';
import { PaginationProvider } from '@/components/ui/pagination';
import {
  Headline,
  HeadlineActionItem,
  HeadlineActions,
  PageTitle,
} from '@/components/ui/page-header';
import { DocsButton } from '@/components/ui/docs-button';
import docs from '@/docs-meta-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BasicLayout from '@/components/layouts/basic.layout';

export default function ScheduledRunsPage() {
  const { canWithReason } = useCan();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { allowed: canManage, message: canManageMessage } = canWithReason(
    scheduledRuns.manage(),
  );

  return (
    <BasicLayout>
      <Headline>
        <PageTitle description="Run tasks at a specific date and time">
          Scheduled Runs
        </PageTitle>
        <HeadlineActions>
          <HeadlineActionItem>
            <DocsButton doc={docs.home['scheduled-runs']} size="icon" />
          </HeadlineActionItem>
          {canManage && (
            <HeadlineActionItem>
              <Button
                className="w-full md:w-auto"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Run
              </Button>
            </HeadlineActionItem>
          )}
        </HeadlineActions>
      </Headline>
      {canManageMessage && (
        <Alert variant="warning">
          <Lock className="w-4 h-4 mr-2" />
          <AlertTitle>Role required</AlertTitle>
          <AlertDescription>{canManageMessage}</AlertDescription>
        </Alert>
      )}
      {canManage && (
        <>
          <Separator className="my-4" />

          <PaginationProvider
            initialPage={1}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 20, 50]}
          >
            <ScheduledRunsTable
              onCreateClicked={() => setIsCreateDialogOpen(true)}
            />
          </PaginationProvider>
        </>
      )}
    </BasicLayout>
  );
}

import { Separator } from '@/components/ui/separator';
import BasicLayout from '@/components/layouts/basic.layout';
import { DocsButton } from '@/components/ui/docs-button';
import {
  Headline,
  PageTitle,
  HeadlineActions,
  HeadlineActionItem,
} from '@/components/ui/page-header';
import docs from '@/docs-meta-data';
import CronJobsTable from './cron-jobs-table';
import useCan from '@/hooks/use-can';
import { cronJobs } from '@/lib/can/features/cron-jobs.permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { PaginationProvider } from '@/components/ui/pagination';

export default function CronJobsPage() {
  const { canWithReason } = useCan();
  const { allowed: canManage, message: canManageMessage } = canWithReason(
    cronJobs.manage(),
  );

  return (
    <BasicLayout>
      <Headline>
        <PageTitle description="Schedule recurring task runs based on cron expressions">
          Cron Jobs
        </PageTitle>
        <HeadlineActions>
          <HeadlineActionItem>
            <DocsButton doc={docs.home['cron-runs']} size="icon" />
          </HeadlineActionItem>
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
          <PaginationProvider>
            <CronJobsTable />
          </PaginationProvider>
        </>
      )}
    </BasicLayout>
  );
}

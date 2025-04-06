import { useParams } from 'react-router-dom';
import { useRunDetail } from '@/hooks/use-run-detail';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeColor } from '@/components/runs/columns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RunChildrenCardRoot } from '@/components/runs/run-children';
import { RunOutputCard } from '@/components/runs/run-output-card';
import useTenant from '@/hooks/use-tenant';
import { WrongTenant } from '@/components/errors/unauthorized';
import { RunId } from '@/components/runs/run-id';

export default function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const { tenant } = useTenant();
  const { data, isLoading, error } = useRunDetail(runId || '');

  const { setBreadcrumbs } = useBreadcrumbs();

  const run = data?.run;

  useEffect(() => {
    if (!run) {
      return;
    }

    const breadcrumbs = [
      {
        title: <RunId run={data?.tasks[0]} />,
        url: `/runs/${runId}`,
        icon: (className: string) => (
          <Badge
            variant="xs"
            tooltipContent={run?.status}
            className={cn(className, getStatusBadgeColor(run?.status))}
          />
        ),
        alwaysShowIcon: true,
      },
    ];

    setBreadcrumbs(breadcrumbs);

    // Clear breadcrumbs when this component unmounts
    return () => {
      setBreadcrumbs([]);
    };
  }, [data?.tasks, run, runId, setBreadcrumbs]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-lg bg-card p-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading run</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Failed to load run details'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isRunning = run.status === 'RUNNING';

  // wrong tenant selected error
  if (tenant?.metadata.id !== run.tenantId) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        {run?.tenantId && <WrongTenant desiredTenantId={run.tenantId} />}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Badge
          className={getStatusBadgeColor(run.status)}
          variant="xs"
          tooltipContent={run.status}
          animated={isRunning}
        />
        <h1 className="text-2xl font-bold">
          <RunId run={data?.tasks[0]} />
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <RunChildrenCardRoot runId={run.metadata.id} />
        {/* <RunDetailsCard runId={run.metadata.id} /> */}
        {/* <RunInputCard input={run.input} /> */}
      </div>

      <RunOutputCard
        output={run.output}
        errorMessage={run.errorMessage}
        status={run.status}
      />
    </div>
  );
}

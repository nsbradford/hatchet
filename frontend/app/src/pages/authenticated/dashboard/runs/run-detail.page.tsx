import { useParams } from 'react-router-dom';
import { useRunDetail } from '@/hooks/use-run-detail';
import { AlertCircle, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Time } from '@/components/ui/time';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDuration, intervalToDuration } from 'date-fns';
import { getStatusBadgeColor } from '@/components/runs/columns';
import { Code } from '@/components/ui/code';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const { run, isLoading, error } = useRunDetail(runId || '');

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

  // Calculate duration
  const startedAt = run.startedAt ? new Date(run.startedAt) : null;
  const finishedAt = run.finishedAt ? new Date(run.finishedAt) : null;
  const isRunning = run.status === 'RUNNING';

  let durationText = 'Not started';
  if (startedAt) {
    const end = finishedAt || new Date();
    const duration = intervalToDuration({ start: startedAt, end });
    durationText =
      formatDuration(duration, {
        format: ['days', 'hours', 'minutes', 'seconds'],
        delimiter: ', ',
      }) || '< 1 second';

    if (isRunning) {
      durationText += ' (running)';
    }
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
        <h1 className="text-2xl font-bold">{run.displayName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">ID</div>
              <div className="col-span-2">
                <Code
                  variant="inline"
                  className="font-medium"
                  language={'plaintext'}
                  value={run.metadata.id}
                >
                  {run.metadata.id}
                </Code>
              </div>

              <div className="col-span-1 font-medium">Workflow</div>
              <div className="col-span-2">{run.workflowId}</div>

              <div className="col-span-1 font-medium">Status</div>
              <div className="col-span-2 flex items-center">
                <Badge
                  className={getStatusBadgeColor(run.status)}
                  variant="default"
                >
                  {run.status}
                </Badge>
              </div>

              <div className="col-span-1 font-medium">Created</div>
              <div className="col-span-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Time date={run.createdAt} variant="timeSince" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Time date={run.createdAt} variant="timestamp" />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="col-span-1 font-medium">Started</div>
              <div className="col-span-2">
                {run.startedAt ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Time date={run.startedAt} variant="timeSince" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <Time date={run.startedAt} variant="timestamp" />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-muted-foreground">Not started</span>
                )}
              </div>

              <div className="col-span-1 font-medium">Duration</div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isRunning ? 'animate-pulse' : ''}>
                    {durationText}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Code language="json" value={JSON.stringify(run.input, null, 2)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            {isRunning
              ? 'The run is still in progress'
              : run.status === 'COMPLETED'
                ? 'The run completed successfully'
                : run.status === 'FAILED'
                  ? 'The run failed with an error'
                  : 'The run was cancelled'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {run.errorMessage ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="font-mono whitespace-pre-wrap">
                {run.errorMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <Code language="json" value={JSON.stringify(run.output, null, 2)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

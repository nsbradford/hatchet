import { V1TaskSummary } from '@/lib/api';
import { Duration } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Code } from '@/components/ui/code';
import { Link } from 'react-router-dom';

export function RunId({ run }: { run: V1TaskSummary }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Link
              to={`/runs/${run.metadata.id}`}
              className="hover:underline text-blue-500"
            >
              {getFriendlyRunId(run)}
            </Link>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <Code
            variant="inline"
            className="font-medium"
            language={'plaintext'}
            value={run.metadata.id}
          >
            {run.metadata.id}
          </Code>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function getFriendlyRunId(run?: V1TaskSummary) {
  if (!run) {
    return '';
  }

  return (
    <span>
      {run.workflowName || run.displayName.split('-')[0]}-
      {run.metadata.id.split('-')[0]}
    </span>
  );
}

export function formatDuration(duration: Duration, rawTimeMs: number): string {
  const parts = [];

  if (duration.days) {
    parts.push(`${duration.days}d`);
  }

  if (duration.hours) {
    parts.push(`${duration.hours}h`);
  }

  if (duration.minutes) {
    parts.push(`${duration.minutes}m`);
  }

  if (rawTimeMs < 10000 && duration.seconds) {
    const ms = Math.floor((rawTimeMs % 1000) / 10);
    parts.push(`${duration.seconds}.${ms.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  }

  if (duration.seconds) {
    parts.push(`${duration.seconds}s`);
  }

  if (rawTimeMs < 1000) {
    const ms = rawTimeMs % 1000;
    parts.push(`${ms}ms`);
  }

  return parts.join(' ');
}

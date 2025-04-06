import { useRunDetail } from '@/hooks/use-run-detail';
import useRuns, { RunsProvider } from '@/hooks/use-runs';
import {
  V1WorkflowRun,
  V1WorkflowRunDetails,
  WorkflowRunOrderByField,
} from '@/lib/api';
import { Link } from 'react-router-dom';
import { PropsWithChildren, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Timeline } from '../timeline';
import { TimelineProvider } from '@/hooks/use-timeline-context';

const MAX_CHILDREN = 10;
const MAX_DEPTH = 10;
const ROW_HEIGHT = 36; // Fixed height for each row

interface RunRowProps {
  run: V1WorkflowRunDetails['run'];
  depth: number;
}

function HighlightGroup({ children }: PropsWithChildren) {
  return (
    <div className="border-l-[1px] border-primary/50 hover:border-primary pl-2 ml-2">
      {children}
    </div>
  );
}

function RunRow({
  run,
  isTitle,
}: Partial<RunRowProps> & { isTitle?: boolean }) {
  // Use run directly as timeline item
  const timelineItems = useMemo(() => {
    const items: V1WorkflowRun[] = [];

    if (!run) {
      return items;
    }

    // Add the run itself if it has started
    if (run.startedAt) {
      items.push({
        ...run,
        // Ensure we have both startedAt and finishedAt for proper rendering
        finishedAt: run.finishedAt || undefined, // Use undefined instead of null if not finished
      });
    }

    // Add a separate object for the created event if needed
    if (
      run.createdAt &&
      (!run.startedAt ||
        new Date(run.createdAt).getTime() < new Date(run.startedAt).getTime())
    ) {
      items.push({
        ...run,
        // Force this item to be treated as a creation event
        startedAt: undefined,
        finishedAt: undefined,
      });
    }

    return items;
  }, [run]);

  return (
    <div
      className="grid grid-cols-[1fr,600px] items-center"
      style={{ height: ROW_HEIGHT }}
    >
      <div className="text-sm text-muted-foreground truncate overflow-hidden whitespace-nowrap">
        {run && <Link to={`/runs/${run.metadata.id}`}>{run.displayName}</Link>}
      </div>
      <Timeline
        items={timelineItems}
        showLabels={false}
        height={28}
        showTimeLabels={isTitle}
      />
    </div>
  );
}

function ChildrenList({ run, depth }: RunRowProps) {
  const { data, isLoading } = useRuns();

  const [maxChildren, setMaxChildren] = useState(MAX_CHILDREN);

  const [render, numHidden] = useMemo(() => {
    if (data?.length === 0) {
      return [[], 0];
    }

    const numHidden = data.length - maxChildren;

    return [data.slice(0, maxChildren), numHidden];
  }, [data, maxChildren]);

  if (depth > MAX_DEPTH) {
    return <>More...</>;
  }

  return (
    <div className="flex flex-col gap-0">
      {render?.map((childRun) => (
        <HighlightGroup key={childRun.metadata.id}>
          <RunRow run={childRun} depth={depth + 1} />
          <RunsProvider
            initialFilters={{
              sortBy: WorkflowRunOrderByField.StartedAt,
              sortDirection: 'desc',
              parentTaskExternalId: childRun.metadata.id,
              isRootTask: false,
            }}
            initialPagination={{
              currentPage: 1,
              pageSize: 100,
            }}
            refetchInterval={5000}
          >
            {depth < 10 && <ChildrenList run={childRun} depth={depth + 1} />}
          </RunsProvider>
        </HighlightGroup>
      ))}
      {numHidden > 0 && (
        <div>
          <span>+{numHidden} more</span>
          <Button onClick={() => setMaxChildren(maxChildren + 10)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

interface RunChildrenCardProps {
  runId: string;
}

export function RunChildrenCardRoot({ runId }: RunChildrenCardProps) {
  const { data, isLoading } = useRunDetail(runId);

  const run = data?.run;

  if (!run) {
    return <div>Run not found</div>;
  }

  return (
    <TimelineProvider>
      <RunsProvider
        initialFilters={{
          sortBy: WorkflowRunOrderByField.StartedAt,
          sortDirection: 'desc',
          parentTaskExternalId: runId,
          isRootTask: false,
        }}
        initialPagination={{
          currentPage: 1,
          pageSize: 100,
        }}
        refetchInterval={5000}
      >
        <HighlightGroup>
          <RunRow isTitle depth={0} />
        </HighlightGroup>
        <HighlightGroup>
          <RunRow run={run} depth={0} />
          <ChildrenList run={run} depth={0} />
        </HighlightGroup>
      </RunsProvider>
    </TimelineProvider>
  );
}

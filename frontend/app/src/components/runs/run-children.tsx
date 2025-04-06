import { useRunDetail } from '@/hooks/use-run-detail';
import useRuns, { RunsProvider } from '@/hooks/use-runs';
import { V1WorkflowRunDetails, WorkflowRunOrderByField } from '@/lib/api';
import { Link } from 'react-router-dom';
import { PropsWithChildren, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Time } from '@/components/ui/time';
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

function RunRow({ run }: RunRowProps) {
  return (
    <div className={`flex flex-row gap-2 w-full items-center`}>
      <div className="text-sm text-muted-foreground truncate max-w-[50%] overflow-hidden whitespace-nowrap">
        <Link to={`/runs/${run.metadata.id}`}>{run.displayName}</Link>
      </div>
      <div className="text-sm text-muted-foreground bg-yellow-500 flex-1">
        <Time date={run.metadata.createdAt} variant="short" />
        <Time date={run.startedAt} variant="short" />
        <Time date={run.finishedAt} variant="short" />
      </div>
    </div>
  );
}

function ChildrenList({ run, depth }: RunRowProps) {
  const { data, isLoading } = useRuns();

  const [maxChildren, setMaxChildren] = useState(1);

  const [render, numHidden] = useMemo(() => {
    if (data?.length === 0) {
      return [[], 0];
    }

    const numHidden = data.length - maxChildren;

    return [data.slice(0, maxChildren), numHidden];
  }, [data, maxChildren]);

  if (depth > 10) {
    return <>More...</>;
  }

  return (
    <div className="flex flex-col gap-2">
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
        <RunRow run={run} depth={0} />
        <ChildrenList run={run} depth={0} />
      </HighlightGroup>
    </RunsProvider>
  );
}

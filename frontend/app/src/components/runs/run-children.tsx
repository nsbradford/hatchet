import { useRunDetail } from '@/hooks/use-run-detail';
import useRuns, { RunsProvider } from '@/hooks/use-runs';
import { V1TaskSummary, WorkflowRunOrderByField } from '@/lib/api';
import {
  PropsWithChildren,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import { Button } from '@/components/ui/button';
import { Timeline } from '../timeline';
import { TimelineProvider } from '@/hooks/use-timeline-context';
import { RunId } from './run-id';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_CHILDREN = 10;
const MAX_DEPTH = 2;

interface RunRowProps {
  run: V1TaskSummary;
  depth: number;
}

function HighlightGroup({ children }: PropsWithChildren) {
  return <div className="">{children}</div>;
}

function RunRow({
  run,
  isTitle,
  depth,
  hasChildren,
  isExpanded,
  toggleChildren,
}: Partial<RunRowProps> & {
  isTitle?: boolean;
  depth: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  toggleChildren?: () => void;
}) {
  return (
    <div className="grid grid-cols-[200px,1fr] items-center">
      <div
        className="text-sm text-muted-foreground truncate overflow-hidden whitespace-nowrap flex items-center gap-2"
        style={{
          paddingLeft: `${depth * 15}px`,
        }}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="w-4 h-4"
            onClick={toggleChildren}
          >
            <ChevronRight
              className={cn('w-2 h-2', isExpanded ? 'rotate-90' : 'rotate-0')}
            />
          </Button>
        )}
        {run && <RunId run={run} />}
      </div>
      <Timeline
        items={run ? [run] : []}
        showLabels={false}
        height={28}
        showTimeLabels={isTitle}
      />
    </div>
  );
}

function ChildrenList({
  run,
  depth,
  manuallyCollapsedIds,
}: RunRowProps & { manuallyCollapsedIds: Set<string> }) {
  const { data, isLoading } = useRuns(1000);
  const [maxChildren, setMaxChildren] = useState(MAX_CHILDREN);
  const [collapsedChildren, setCollapsedChildren] = useState<Set<string>>(
    new Set(),
  );

  // When a child is manually collapsed, add it to collapsed set
  const toggleChildCollapse = useCallback((id: string) => {
    setCollapsedChildren((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isManuallyCollapsed = (id: string) => {
    return manuallyCollapsedIds.has(id) || collapsedChildren.has(id);
  };

  const [render, numHidden] = useMemo(() => {
    if (!data || data.length === 0) {
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
      {render
        ?.sort(
          (a, b) =>
            new Date(a.startedAt || 0).getTime() -
            new Date(b.startedAt || 0).getTime(),
        )
        .map((childRun) => {
          const childId = childRun.metadata.id;
          const isExpanded = !isManuallyCollapsed(childId);
          const shouldShowChildren = isExpanded && depth < MAX_DEPTH;

          return (
            <HighlightGroup key={childId}>
              <RunRow
                run={childRun}
                depth={depth + 1}
                hasChildren={true}
                isExpanded={isExpanded}
                toggleChildren={() => toggleChildCollapse(childId)}
              />
              {shouldShowChildren && (
                <RunsProvider
                  initialFilters={{
                    sortBy: WorkflowRunOrderByField.StartedAt,
                    sortDirection: 'desc',
                    parentTaskExternalId: childId,
                    isRootTask: false,
                  }}
                  initialPagination={{
                    currentPage: 1,
                    pageSize: 100,
                  }}
                  refetchInterval={5000}
                >
                  <ChildrenList
                    run={childRun}
                    depth={depth + 1}
                    manuallyCollapsedIds={manuallyCollapsedIds}
                  />
                </RunsProvider>
              )}
            </HighlightGroup>
          );
        })}
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
  const { data, isLoading } = useRunDetail(runId, 1000);
  const [isRootExpanded, setIsRootExpanded] = useState(true);
  // Keep track of manually collapsed IDs across rerenders
  const manuallyCollapsedIds = useRef(new Set<string>()).current;

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
          <RunRow
            run={data?.tasks[0]}
            depth={0}
            hasChildren={true}
            isExpanded={isRootExpanded}
            toggleChildren={() => setIsRootExpanded(!isRootExpanded)}
          />
          {isRootExpanded && (
            <ChildrenList
              run={data?.tasks[0]}
              depth={0}
              manuallyCollapsedIds={manuallyCollapsedIds}
            />
          )}
        </HighlightGroup>
      </RunsProvider>
    </TimelineProvider>
  );
}

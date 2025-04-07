import { RunsTable } from '@/components/runs/runs-table';
import { RunsProvider } from '@/hooks/use-runs';
import { WorkflowRunOrderByField } from '@/lib/api';

export default function RunsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="rounded-lg bg-card p-4">
        <RunsProvider
          initialFilters={{
            sortBy: WorkflowRunOrderByField.StartedAt,
            sortDirection: 'desc',
            isRootTask: true,
          }}
          initialPagination={{
            currentPage: 1,
            pageSize: 1000,
          }}
          refetchInterval={5000}
        >
          <RunsTable />
        </RunsProvider>
      </div>
    </div>
  );
}

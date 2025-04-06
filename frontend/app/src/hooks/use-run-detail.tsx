import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useRunDetail(runId: string, refetchInterval?: number) {
  const query = useQuery({
    queryKey: ['workflow-run-details:get', runId],
    queryFn: async () => (await api.v1WorkflowRunGet(runId)).data,
    refetchInterval,
  });

  return {
    ...query,
  };
}

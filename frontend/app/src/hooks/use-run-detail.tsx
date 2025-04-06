import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useRunDetail(runId: string) {
  const query = useQuery({
    queryKey: ['workflow-run-details:get', runId],
    queryFn: async () => (await api.v1WorkflowRunGet(runId)).data,
  });

  return {
    ...query,
  };
}

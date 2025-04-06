import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useRunDetail(runId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['workflow-run-details:get', runId],
    queryFn: async () => (await api.v1WorkflowRunGet(runId)).data,
  });

  return {
    data,
    isLoading,
    error,
    run: data?.run,
    tasks: data?.tasks || [],
    taskEvents: data?.taskEvents || [],
    shape: data?.shape,
  };
}

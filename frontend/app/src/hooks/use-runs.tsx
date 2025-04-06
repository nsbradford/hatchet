import React, { useState, createContext, useContext, ReactNode } from 'react';
import api from '../lib/api';
import {
  V1TaskSummary,
  V1TaskSummaryList,
  V1TriggerWorkflowRunRequest,
  V1WorkflowRunDetails,
  V1TaskStatus,
  WorkflowRunOrderByField,
} from '../lib/api/generated/data-contracts';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import useTenant from './use-tenant';

// Define the RunQuery type to match the API parameter structure
type RunQuery = Parameters<typeof api.v1WorkflowRunList>[1];

// Types for filters and pagination
interface RunsFilters {
  search?: string;
  status?: V1TaskStatus;
  workflowId?: string;
  parentTaskExternalId?: string;
  workerId?: string;
  sortBy?: WorkflowRunOrderByField;
  sortDirection?: 'asc' | 'desc';
  createdAfter?: string;
  finishedBefore?: string;
  additionalMetadata?: string[];
  isRootTask?: boolean;
}

interface RunsPagination {
  currentPage: number;
  pageSize: number;
}

// Create run params
interface CreateRunParams {
  workflowId: string;
  data: V1TriggerWorkflowRunRequest;
}

interface RunsState {
  data: V1TaskSummary[];
  pagination?: V1TaskSummaryList['pagination'];
  isLoading: boolean;
  create: UseMutationResult<
    V1WorkflowRunDetails,
    Error,
    CreateRunParams,
    unknown
  >;

  // Filter state management
  filters: RunsFilters;
  setFilters: (filters: RunsFilters) => void;
  paginationState: RunsPagination;
  setPagination: (pagination: RunsPagination) => void;
  refetch: () => Promise<unknown>;
}

interface RunsProviderProps {
  children: ReactNode;
  initialFilters?: RunsFilters;
  initialPagination?: RunsPagination;
  refetchInterval?: number;
}

const RunsContext = createContext<RunsState | null>(null);

export function RunsProvider({
  children,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
  refetchInterval,
}: RunsProviderProps) {
  const { tenant } = useTenant();

  // State for filters and pagination
  const [filters, setFilters] = useState<RunsFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<RunsPagination>(initialPagination);

  const listRunsQuery = useQuery({
    queryKey: [
      'v1:workflow-run:list',
      tenant,
      filters.search,
      filters.status,
      filters.workflowId,
      filters.parentTaskExternalId,
      filters.workerId,
      filters.sortBy,
      filters.sortDirection,
      filters.createdAfter,
      filters.finishedBefore,
      filters.additionalMetadata,
      paginationState.currentPage,
      paginationState.pageSize,
    ],
    queryFn: async () => {
      if (!tenant) {
        return { rows: [], pagination: { current_page: 0, num_pages: 0 } };
      }

      // Convert pagination and filters to API query format
      const query: RunQuery = {
        offset: (paginationState.currentPage - 1) * paginationState.pageSize,
        limit: paginationState.pageSize,
        since:
          filters.createdAfter ||
          new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        until: filters.finishedBefore,
        workflow_ids: filters.workflowId ? [filters.workflowId] : undefined,
        parent_task_external_id: filters.parentTaskExternalId,
        worker_id: filters.workerId,
        only_tasks: !!filters.workerId,
        additional_metadata: filters.additionalMetadata,
        statuses: filters.status ? [filters.status] : undefined,
        is_root_task: !!filters.isRootTask,
      };

      return (await api.v1WorkflowRunList(tenant.metadata.id, query)).data;
    },
    refetchInterval,
  });

  // Create workflow run implementation
  const createRunMutation = useMutation({
    mutationKey: ['v1:workflow-run:create', tenant],
    mutationFn: async ({ workflowId, data }: CreateRunParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const res = await api.v1WorkflowRunCreate(tenant.metadata.id, data);
      return res.data;
    },
    onSuccess: () => {
      listRunsQuery.refetch();
    },
  });

  const value: RunsState = {
    data: listRunsQuery.data?.rows || [],
    pagination: listRunsQuery.data?.pagination,
    isLoading: listRunsQuery.isLoading,
    create: createRunMutation,
    refetch: listRunsQuery.refetch,

    // Filter state management
    filters,
    setFilters,
    paginationState,
    setPagination,
  };

  return <RunsContext.Provider value={value}>{children}</RunsContext.Provider>;
}

export default function useRuns(): RunsState {
  const context = useContext(RunsContext);
  if (!context) {
    throw new Error('useRuns must be used within a RunsProvider');
  }
  return context;
}

// Legacy function for backward compatibility
export function useRunsWithOptions({
  refetchInterval,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
}: {
  refetchInterval?: number;
  initialFilters?: RunsFilters;
  initialPagination?: RunsPagination;
} = {}): RunsState {
  console.warn(
    'useRunsWithOptions is deprecated. Please use RunsProvider and useRuns instead.',
  );

  const { tenant } = useTenant();

  // State for filters and pagination
  const [filters, setFilters] = useState<RunsFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<RunsPagination>(initialPagination);

  const listRunsQuery = useQuery({
    queryKey: [
      'v1:workflow-run:list',
      tenant,
      filters.search,
      filters.status,
      filters.workflowId,
      filters.parentTaskExternalId,
      filters.workerId,
      filters.sortBy,
      filters.sortDirection,
      filters.createdAfter,
      filters.finishedBefore,
      filters.additionalMetadata,
      paginationState.currentPage,
      paginationState.pageSize,
    ],
    queryFn: async () => {
      if (!tenant) {
        return { rows: [], pagination: { current_page: 0, num_pages: 0 } };
      }

      // Convert pagination and filters to API query format
      const query: RunQuery = {
        offset: (paginationState.currentPage - 1) * paginationState.pageSize,
        limit: paginationState.pageSize,
        since:
          filters.createdAfter ||
          new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        until: filters.finishedBefore,
        workflow_ids: filters.workflowId ? [filters.workflowId] : undefined,
        parent_task_external_id: filters.parentTaskExternalId,
        worker_id: filters.workerId,
        only_tasks: !!filters.workerId,
        additional_metadata: filters.additionalMetadata,
        statuses: filters.status ? [filters.status] : undefined,
        is_root_task: !!filters.isRootTask,
      };

      return (await api.v1WorkflowRunList(tenant.metadata.id, query)).data;
    },
    refetchInterval,
  });

  // Create workflow run implementation
  const createRunMutation = useMutation({
    mutationKey: ['v1:workflow-run:create', tenant],
    mutationFn: async ({ workflowId, data }: CreateRunParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const res = await api.v1WorkflowRunCreate(tenant.metadata.id, data);
      return res.data;
    },
    onSuccess: () => {
      listRunsQuery.refetch();
    },
  });

  return {
    data: listRunsQuery.data?.rows || [],
    pagination: listRunsQuery.data?.pagination,
    isLoading: listRunsQuery.isLoading,
    create: createRunMutation,
    refetch: listRunsQuery.refetch,

    // Filter state management
    filters,
    setFilters,
    paginationState,
    setPagination,
  };
}

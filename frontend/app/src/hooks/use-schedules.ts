import api, {
  ScheduledWorkflows,
  ScheduledWorkflowsList,
  ScheduleWorkflowRunRequest,
  ScheduledRunStatus,
  ScheduledWorkflowsOrderByField,
} from '@/lib/api';
import {
  useMutation,
  UseMutationResult,
  useQuery,
} from '@tanstack/react-query';
import useTenant from './use-tenant';
import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  createElement,
} from 'react';

// Types for filters and pagination
interface SchedulesFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
  statuses?: ScheduledRunStatus[];
  workflowId?: string;
}

interface SchedulesPagination {
  currentPage: number;
  pageSize: number;
}

// Update schedule params
interface UpdateScheduleParams {
  scheduleId: string;
  workflowId: string;
  data: ScheduleWorkflowRunRequest;
}

// Create schedule params
interface CreateScheduleParams {
  workflowName: string;
  data: ScheduleWorkflowRunRequest;
}

// Main hook return type
interface SchedulesState {
  data?: ScheduledWorkflowsList['rows'];
  pagination?: ScheduledWorkflowsList['pagination'];
  isLoading: boolean;
  update: UseMutationResult<
    ScheduledWorkflows,
    Error,
    UpdateScheduleParams,
    unknown
  >;
  create: UseMutationResult<
    ScheduledWorkflows,
    Error,
    CreateScheduleParams,
    unknown
  >;
  delete: UseMutationResult<void, Error, string, unknown>;

  // Added from context
  filters: SchedulesFilters;
  setFilters: (filters: SchedulesFilters) => void;
  paginationState: SchedulesPagination;
  setPagination: (pagination: SchedulesPagination) => void;
}

interface UseSchedulesOptions {
  refetchInterval?: number;
  initialFilters?: SchedulesFilters;
  initialPagination?: SchedulesPagination;
}

export default function useSchedules({
  refetchInterval,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
}: UseSchedulesOptions = {}): SchedulesState {
  const { tenant } = useTenant();

  // State from the former context
  const [filters, setFilters] = useState<SchedulesFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<SchedulesPagination>(initialPagination);

  const listSchedulesQuery = useQuery({
    queryKey: [
      'schedule:list',
      tenant,
      filters.search,
      filters.sortBy,
      filters.sortDirection,
      filters.fromDate,
      filters.toDate,
      filters.statuses,
      filters.workflowId,
      paginationState.currentPage,
      paginationState.pageSize,
    ],
    queryFn: async () => {
      if (!tenant) {
        return { rows: [], pagination: { current_page: 0, num_pages: 0 } };
      }

      // Build query params
      const queryParams: Record<string, any> = {
        limit: paginationState.pageSize,
        offset: (paginationState.currentPage - 1) * paginationState.pageSize,
      };

      if (filters.sortBy) {
        queryParams.orderByField =
          filters.sortBy as ScheduledWorkflowsOrderByField;
        queryParams.orderByDirection = filters.sortDirection || 'asc';
      }

      if (filters.statuses && filters.statuses.length > 0) {
        queryParams.statuses = filters.statuses;
      }

      if (filters.workflowId) {
        queryParams.workflowId = filters.workflowId;
      }

      const res = await api.workflowScheduledList(
        tenant?.metadata.id || '',
        queryParams,
      );

      // Client-side filtering for search if API doesn't support it
      let filteredRows = res.data.rows || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRows = filteredRows.filter((schedule) =>
          schedule.workflowName.toLowerCase().includes(searchLower),
        );
      }

      // Client-side date filtering
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredRows = filteredRows.filter((schedule) => {
          const createdAt = new Date(schedule.metadata.createdAt);
          return createdAt >= fromDate;
        });
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredRows = filteredRows.filter((schedule) => {
          const createdAt = new Date(schedule.metadata.createdAt);
          return createdAt <= toDate;
        });
      }

      return {
        ...res.data,
        rows: filteredRows,
      };
    },
    refetchInterval,
  });

  // Create implementation
  const createScheduleMutation = useMutation({
    mutationKey: ['schedule:create', tenant],
    mutationFn: async ({ workflowName, data }: CreateScheduleParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const res = await api.scheduledWorkflowRunCreate(
        tenant.metadata.id,
        workflowName,
        data,
      );

      return res.data;
    },
    onSuccess: () => {
      listSchedulesQuery.refetch();
    },
  });

  // Delete implementation
  const deleteScheduleMutation = useMutation({
    mutationKey: ['schedule:delete', tenant],
    mutationFn: async (scheduleId: string) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      await api.workflowScheduledDelete(tenant.metadata.id, scheduleId);
    },
    onSuccess: () => {
      listSchedulesQuery.refetch();
    },
  });

  // Update implementation that deletes and recreates the scheduled workflow
  const updateScheduleMutation = useMutation({
    mutationKey: ['schedule:update', tenant],
    mutationFn: async ({
      scheduleId,
      workflowId,
      data,
    }: UpdateScheduleParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // First delete the existing schedule
      await api.workflowScheduledDelete(tenant.metadata.id, scheduleId);

      // Then create a new one with the updated data
      const res = await api.scheduledWorkflowRunCreate(
        tenant.metadata.id,
        workflowId,
        data,
      );

      return res.data;
    },
    onSuccess: () => {
      listSchedulesQuery.refetch();
    },
  });

  return {
    data: listSchedulesQuery.data?.rows || [],
    pagination: listSchedulesQuery.data?.pagination,
    isLoading: listSchedulesQuery.isLoading,
    update: updateScheduleMutation,
    create: createScheduleMutation,
    delete: deleteScheduleMutation,

    // Added from context
    filters,
    setFilters,
    paginationState,
    setPagination,
  };
}

// Context implementation (to maintain compatibility with components)
interface SchedulesContextType extends SchedulesState {}

const SchedulesContext = createContext<SchedulesContextType | undefined>(
  undefined,
);

export const useSchedulesContext = () => {
  const context = useContext(SchedulesContext);
  if (context === undefined) {
    throw new Error(
      'useSchedulesContext must be used within a SchedulesProvider',
    );
  }
  return context;
};

interface SchedulesProviderProps extends PropsWithChildren {
  options?: UseSchedulesOptions;
}

export function SchedulesProvider(props: SchedulesProviderProps) {
  const { children, options = {} } = props;
  const schedulesState = useSchedules(options);

  return createElement(
    SchedulesContext.Provider,
    { value: schedulesState },
    children,
  );
}

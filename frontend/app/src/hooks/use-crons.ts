import api, {
  CronWorkflows,
  CreateCronWorkflowTriggerRequest,
  CronWorkflowsList,
  CronWorkflowsOrderByField,
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
interface CronsFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

interface CronsPagination {
  currentPage: number;
  pageSize: number;
}

// Update cron params
interface UpdateCronParams {
  cronId: string;
  workflowId: string;
  data: CreateCronWorkflowTriggerRequest;
}

// Create cron params
interface CreateCronParams {
  workflowId: string;
  data: CreateCronWorkflowTriggerRequest;
}

// Main hook return type
interface CronsState {
  data?: CronWorkflowsList['rows'];
  pagination?: CronWorkflowsList['pagination'];
  isLoading: boolean;
  update: UseMutationResult<CronWorkflows, Error, UpdateCronParams, unknown>;
  create: UseMutationResult<CronWorkflows, Error, CreateCronParams, unknown>;
  delete: UseMutationResult<void, Error, string, unknown>;

  // Added from context
  filters: CronsFilters;
  setFilters: (filters: CronsFilters) => void;
  paginationState: CronsPagination;
  setPagination: (pagination: CronsPagination) => void;
}

interface UseCronsOptions {
  refetchInterval?: number;
  initialFilters?: CronsFilters;
  initialPagination?: CronsPagination;
}

export default function useCrons({
  refetchInterval,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
}: UseCronsOptions = {}): CronsState {
  const { tenant } = useTenant();

  // State from the former context
  const [filters, setFilters] = useState<CronsFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<CronsPagination>(initialPagination);

  const listCronsQuery = useQuery({
    queryKey: [
      'cron:list',
      tenant,
      filters.search,
      filters.sortBy,
      filters.sortDirection,
      filters.fromDate,
      filters.toDate,
      paginationState.currentPage,
      paginationState.pageSize,
    ],
    queryFn: async () => {
      if (!tenant) {
        return { rows: [], pagination: { current_page: 0, num_pages: 0 } };
      }

      // Build query params
      const queryParams: Record<string, any> = {
        page: paginationState.currentPage,
        limit: paginationState.pageSize,
      };

      if (filters.sortBy) {
        queryParams.orderBy = filters.sortBy as CronWorkflowsOrderByField;
        queryParams.orderDirection = filters.sortDirection || 'asc';
      }

      const res = await api.cronWorkflowList(
        tenant?.metadata.id || '',
        queryParams,
      );

      // Client-side filtering for search if API doesn't support it
      let filteredRows = res.data.rows || [];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRows = filteredRows.filter(
          (cron) =>
            cron.name?.toLowerCase().includes(searchLower) ||
            cron.workflowName.toLowerCase().includes(searchLower),
        );
      }

      // Client-side date filtering
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredRows = filteredRows.filter((cron) => {
          const createdAt = new Date(cron.metadata.createdAt);
          return createdAt >= fromDate;
        });
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredRows = filteredRows.filter((cron) => {
          const createdAt = new Date(cron.metadata.createdAt);
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
  const createCronMutation = useMutation({
    mutationKey: ['cron:create', tenant],
    mutationFn: async ({ workflowId, data }: CreateCronParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const res = await api.cronWorkflowTriggerCreate(
        tenant.metadata.id,
        workflowId,
        data,
      );

      return res.data;
    },
    onSuccess: () => {
      listCronsQuery.refetch();
    },
  });

  // Delete implementation
  const deleteCronMutation = useMutation({
    mutationKey: ['cron:delete', tenant],
    mutationFn: async (cronId: string) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      await api.workflowCronDelete(tenant.metadata.id, cronId);
    },
    onSuccess: () => {
      listCronsQuery.refetch();
    },
  });

  const updateCronMutation = useMutation({
    mutationKey: ['cron:update', tenant],
    mutationFn: async ({ cronId, workflowId, data }: UpdateCronParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // First delete the existing cron
      await api.workflowCronDelete(tenant.metadata.id, cronId);

      // Then create a new one with the updated data
      const res = await api.cronWorkflowTriggerCreate(
        tenant.metadata.id,
        workflowId,
        data,
      );

      return res.data;
    },
    onSuccess: () => {
      listCronsQuery.refetch();
    },
  });

  return {
    data: listCronsQuery.data?.rows || [],
    pagination: listCronsQuery.data?.pagination,
    isLoading: listCronsQuery.isLoading,
    update: updateCronMutation,
    create: createCronMutation,
    delete: deleteCronMutation,

    // Added from context
    filters,
    setFilters,
    paginationState,
    setPagination,
  };
}

// Context implementation (to maintain compatibility with components)
interface CronsContextType extends CronsState {}

const CronsContext = createContext<CronsContextType | undefined>(undefined);

export const useCronsContext = () => {
  const context = useContext(CronsContext);
  if (context === undefined) {
    throw new Error('useCronsContext must be used within a CronsProvider');
  }
  return context;
};

interface CronsProviderProps extends PropsWithChildren {
  options?: UseCronsOptions;
}

export function CronsProvider(props: CronsProviderProps) {
  const { children, options = {} } = props;
  const cronsState = useCrons(options);

  return createElement(CronsContext.Provider, { value: cronsState }, children);
}

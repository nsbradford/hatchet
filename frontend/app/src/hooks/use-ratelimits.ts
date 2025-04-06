import api, {
  RateLimit,
  RateLimitList,
  RateLimitOrderByField,
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
interface RateLimitsFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

interface RateLimitsPagination {
  currentPage: number;
  pageSize: number;
}

// Rate limit create request
interface CreateRateLimitRequest {
  key: string;
  limitValue: number;
  window: string;
}

// Rate limit update request
interface UpdateRateLimitRequest {
  limitValue: number;
  window: string;
}

// Update rate limit params
interface UpdateRateLimitParams {
  key: string;
  data: UpdateRateLimitRequest;
}

// Main hook return type
interface RateLimitsState {
  data?: RateLimitList['rows'];
  pagination?: RateLimitList['pagination'];
  isLoading: boolean;
  create: UseMutationResult<RateLimit, Error, CreateRateLimitRequest, unknown>;
  update: UseMutationResult<RateLimit, Error, UpdateRateLimitParams, unknown>;
  delete: UseMutationResult<void, Error, string, unknown>;

  // Added from context
  filters: RateLimitsFilters;
  setFilters: (filters: RateLimitsFilters) => void;
  paginationState: RateLimitsPagination;
  setPagination: (pagination: RateLimitsPagination) => void;
}

interface UseRateLimitsOptions {
  refetchInterval?: number;
  initialFilters?: RateLimitsFilters;
  initialPagination?: RateLimitsPagination;
}

export default function useRateLimits({
  refetchInterval,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
}: UseRateLimitsOptions = {}): RateLimitsState {
  const { tenant } = useTenant();

  // State from the former context
  const [filters, setFilters] = useState<RateLimitsFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<RateLimitsPagination>(initialPagination);

  const listRateLimitsQuery = useQuery({
    queryKey: [
      'rate-limit:list',
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
        offset: (paginationState.currentPage - 1) * paginationState.pageSize,
        limit: paginationState.pageSize,
      };

      if (filters.search) {
        queryParams.search = filters.search;
      }

      if (filters.sortBy) {
        queryParams.orderByField = filters.sortBy as RateLimitOrderByField;
        queryParams.orderByDirection = filters.sortDirection || 'asc';
      }

      const res = await api.rateLimitList(
        tenant?.metadata.id || '',
        queryParams,
      );

      // Client-side date filtering
      let filteredRows = res.data.rows || [];
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredRows = filteredRows.filter((rateLimit) => {
          const lastRefill = new Date(rateLimit.lastRefill);
          return lastRefill >= fromDate;
        });
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredRows = filteredRows.filter((rateLimit) => {
          const lastRefill = new Date(rateLimit.lastRefill);
          return lastRefill <= toDate;
        });
      }

      return {
        ...res.data,
        rows: filteredRows,
      };
    },
    refetchInterval,
  });

  // Create rate limit implementation
  const createRateLimitMutation = useMutation({
    mutationKey: ['rate-limit:create', tenant],
    mutationFn: async (data: CreateRateLimitRequest) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Note: This is a hypothetical implementation as the actual API endpoint wasn't found
      // We would typically use something like:
      // const res = await api.rateLimitCreate(tenant.metadata.id, data);

      // For now, we'll simulate the creation by assuming the endpoint is like other patterns
      const res = await fetch(
        `/api/v1/tenants/${tenant.metadata.id}/rate-limits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        throw new Error('Failed to create rate limit');
      }

      const createdRateLimit = await res.json();
      return createdRateLimit;
    },
    onSuccess: () => {
      listRateLimitsQuery.refetch();
    },
  });

  // Update rate limit implementation
  const updateRateLimitMutation = useMutation({
    mutationKey: ['rate-limit:update', tenant],
    mutationFn: async ({ key, data }: UpdateRateLimitParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Note: This is a hypothetical implementation as the actual API endpoint wasn't found
      // We would typically use something like:
      // const res = await api.rateLimitUpdate(tenant.metadata.id, key, data);

      // For now, we'll simulate the update by assuming the endpoint follows RESTful patterns
      const res = await fetch(
        `/api/v1/tenants/${tenant.metadata.id}/rate-limits/${key}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        throw new Error('Failed to update rate limit');
      }

      const updatedRateLimit = await res.json();
      return updatedRateLimit;
    },
    onSuccess: () => {
      listRateLimitsQuery.refetch();
    },
  });

  // Delete rate limit implementation
  const deleteRateLimitMutation = useMutation({
    mutationKey: ['rate-limit:delete', tenant],
    mutationFn: async (key: string) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Note: This is a hypothetical implementation as the actual API endpoint wasn't found
      // We would typically use something like:
      // await api.rateLimitDelete(tenant.metadata.id, key);

      // For now, we'll simulate the deletion by assuming the endpoint follows RESTful patterns
      const res = await fetch(
        `/api/v1/tenants/${tenant.metadata.id}/rate-limits/${key}`,
        {
          method: 'DELETE',
        },
      );

      if (!res.ok) {
        throw new Error('Failed to delete rate limit');
      }
    },
    onSuccess: () => {
      listRateLimitsQuery.refetch();
    },
  });

  return {
    data: listRateLimitsQuery.data?.rows || [],
    pagination: listRateLimitsQuery.data?.pagination,
    isLoading: listRateLimitsQuery.isLoading,
    create: createRateLimitMutation,
    update: updateRateLimitMutation,
    delete: deleteRateLimitMutation,

    // Added from context
    filters,
    setFilters,
    paginationState,
    setPagination,
  };
}

// Context implementation (to maintain compatibility with components)
interface RateLimitsContextType extends RateLimitsState {}

const RateLimitsContext = createContext<RateLimitsContextType | undefined>(
  undefined,
);

export const useRateLimitsContext = () => {
  const context = useContext(RateLimitsContext);
  if (context === undefined) {
    throw new Error(
      'useRateLimitsContext must be used within a RateLimitsProvider',
    );
  }
  return context;
};

interface RateLimitsProviderProps extends PropsWithChildren {
  options?: UseRateLimitsOptions;
}

export function RateLimitsProvider(props: RateLimitsProviderProps) {
  const { children, options = {} } = props;
  const rateLimitsState = useRateLimits(options);

  return createElement(
    RateLimitsContext.Provider,
    { value: rateLimitsState },
    children,
  );
}

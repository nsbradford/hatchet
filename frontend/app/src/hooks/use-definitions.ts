import api from '@/lib/api';
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
interface DefinitionsFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
  type?: 'workflow' | 'task' | undefined;
}

interface DefinitionsPagination {
  currentPage: number;
  pageSize: number;
}

// Update definition params
interface UpdateDefinitionParams {
  definitionId: string;
  workflowId: string;
  data: any; // The updated definition data
}

// Create definition params
interface CreateDefinitionParams {
  workflowId: string;
  data: any; // The definition data to be created
}

// Main hook return type
interface DefinitionsState {
  data?: any[]; // The definitions data
  pagination?: any;
  isLoading: boolean;
  update: UseMutationResult<any, Error, UpdateDefinitionParams, unknown>;
  delete: UseMutationResult<void, Error, string, unknown>;

  // Added from context
  filters: DefinitionsFilters;
  setFilters: (filters: DefinitionsFilters) => void;
  paginationState: DefinitionsPagination;
  setPagination: (pagination: DefinitionsPagination) => void;
}

interface UseDefinitionsOptions {
  refetchInterval?: number;
  initialFilters?: DefinitionsFilters;
  initialPagination?: DefinitionsPagination;
}

export default function useDefinitions({
  refetchInterval,
  initialFilters = {},
  initialPagination = { currentPage: 1, pageSize: 10 },
}: UseDefinitionsOptions = {}): DefinitionsState {
  const { tenant } = useTenant();

  // State from the former context
  const [filters, setFilters] = useState<DefinitionsFilters>(initialFilters);
  const [paginationState, setPagination] =
    useState<DefinitionsPagination>(initialPagination);

  const listDefinitionsQuery = useQuery({
    queryKey: [
      'definition:list',
      tenant,
      filters.search,
      filters.sortBy,
      filters.sortDirection,
      filters.fromDate,
      filters.toDate,
      filters.type,
      paginationState.currentPage,
      paginationState.pageSize,
    ],
    queryFn: async () => {
      if (!tenant) {
        return { rows: [], pagination: { current_page: 0, num_pages: 0 } };
      }

      // Fetch workflow list as a basis for definitions
      const res = await api.workflowList(tenant?.metadata.id || '');

      // Map workflows to include their latest version's definition if available
      let rows = res.data.rows || [];

      // Client-side filtering for search if API doesn't support it
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        rows = rows.filter((workflow) =>
          workflow.name?.toLowerCase().includes(searchLower),
        );
      }

      // Filter by type if specified
      if (filters.type) {
        // For now we only have workflow definitions
        // If task-specific filtering is needed it would be implemented here
      }

      // Client-side date filtering
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        rows = rows.filter((workflow) => {
          const createdAt = new Date(workflow.metadata.createdAt);
          return createdAt >= fromDate;
        });
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        rows = rows.filter((workflow) => {
          const createdAt = new Date(workflow.metadata.createdAt);
          return createdAt <= toDate;
        });
      }

      // Client-side sorting if API doesn't support it
      if (filters.sortBy) {
        rows.sort((a, b) => {
          let valueA: any;
          let valueB: any;

          switch (filters.sortBy) {
            case 'name':
              valueA = a.name;
              valueB = b.name;
              break;
            case 'createdAt':
              valueA = new Date(a.metadata.createdAt).getTime();
              valueB = new Date(b.metadata.createdAt).getTime();
              break;
            default:
              return 0;
          }

          const direction = filters.sortDirection === 'desc' ? -1 : 1;
          if (valueA < valueB) {
            return -1 * direction;
          }
          if (valueA > valueB) {
            return 1 * direction;
          }
          return 0;
        });
      }

      // Implement pagination
      const startIndex =
        (paginationState.currentPage - 1) * paginationState.pageSize;
      const endIndex = startIndex + paginationState.pageSize;
      const paginatedRows = rows.slice(startIndex, endIndex);

      return {
        rows: paginatedRows,
        pagination: {
          current_page: paginationState.currentPage,
          num_pages: Math.ceil(rows.length / paginationState.pageSize),
        },
      };
    },
    refetchInterval,
  });

  const updateDefinitionMutation = useMutation({
    mutationKey: ['definition:update', tenant],
    mutationFn: async ({
      definitionId,
      workflowId,
      data,
    }: UpdateDefinitionParams) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Similar to create, we would need to implement the appropriate API call
      // This might involve updating a workflow version
      // For now, this is a placeholder

      // Example implementation (would need to be replaced with actual API)
      // const res = await api.workflowVersionUpdate(tenant.metadata.id, workflowId, definitionId, data);
      // return res.data;

      // Placeholder return
      return { success: true, definitionId, data };
    },
    onSuccess: () => {
      listDefinitionsQuery.refetch();
    },
  });

  const deleteDefinitionMutation = useMutation({
    mutationKey: ['definition:delete', tenant],
    mutationFn: async (definitionId: string) => {
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Implementation would depend on API capabilities
      // For now, this is a placeholder

      // Example implementation (would need to be replaced with actual API)
      // await api.workflowVersionDelete(tenant.metadata.id, definitionId);
    },
    onSuccess: () => {
      listDefinitionsQuery.refetch();
    },
  });

  return {
    data: listDefinitionsQuery.data?.rows || [],
    pagination: listDefinitionsQuery.data?.pagination,
    isLoading: listDefinitionsQuery.isLoading,
    update: updateDefinitionMutation,
    delete: deleteDefinitionMutation,

    // Added from context
    filters,
    setFilters,
    paginationState,
    setPagination,
  };
}

// Context implementation (to maintain compatibility with components)
interface DefinitionsContextType extends DefinitionsState {}

const DefinitionsContext = createContext<DefinitionsContextType | undefined>(
  undefined,
);

export const useDefinitionsContext = () => {
  const context = useContext(DefinitionsContext);
  if (context === undefined) {
    throw new Error(
      'useDefinitionsContext must be used within a DefinitionsProvider',
    );
  }
  return context;
};

interface DefinitionsProviderProps extends PropsWithChildren {
  options?: UseDefinitionsOptions;
}

export function DefinitionsProvider(props: DefinitionsProviderProps) {
  const { children, options = {} } = props;
  const definitionsState = useDefinitions(options);

  return createElement(
    DefinitionsContext.Provider,
    { value: definitionsState },
    children,
  );
}

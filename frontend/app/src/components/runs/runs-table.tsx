import useRuns from '@/hooks/use-runs';

import { DataTable } from './data-table';
import { columns } from './columns';

export function RunsTable() {
  const {
    data,
    pagination: paginationData,
    isLoading,
    filters,
    setFilters,
    paginationState,
    setPagination,
  } = useRuns();

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...paginationState, currentPage: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...paginationState, currentPage: page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ ...paginationState, pageSize });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading runs...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data || []}
      paginationAPI={{
        currentPage: paginationState.currentPage,
        totalPages: paginationData?.num_pages || 1,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      }}
      searchValue={filters.search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search runs..."
    />
  );
}

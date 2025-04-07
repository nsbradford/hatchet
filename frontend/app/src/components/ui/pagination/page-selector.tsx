import { usePagination } from './pagination-context';
import {
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from './pagination-link';

export function PageSelector() {
  const { currentPage, numPages, setCurrentPage } = usePagination();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        />
      </PaginationItem>
      {Array.from({ length: numPages || 1 }, (_, i) => i + 1).map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={currentPage === page}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= numPages}
        />
      </PaginationItem>
    </>
  );
}

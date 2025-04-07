import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants } from '@/components/ui/button';

export interface PaginationManager {
  currentPage: number;
  pageSize: number;
  numPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setNumPages: (numPages: number) => void;
}

export const PaginationManagerNoOp: PaginationManager = {
  currentPage: 1,
  pageSize: 10,
  numPages: 1,
  setCurrentPage: () => {},
  setPageSize: () => {},
  setNumPages: () => {},
};

interface PaginationContextType extends PaginationManager {}

const PaginationContext = React.createContext<
  PaginationContextType | undefined
>(undefined);

export function usePagination() {
  const context = React.useContext(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within a PaginationProvider');
  }
  return context;
}

interface PaginationProviderProps {
  children: React.ReactNode;
  initialPage?: number;
  initialPageSize?: number;
}

export function PaginationProvider({
  children,
  initialPage = 1,
  initialPageSize = 10,
}: PaginationProviderProps) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [numPages, setNumPages] = React.useState(1);

  const value = React.useMemo(
    () => ({
      currentPage,
      pageSize,
      numPages,
      setCurrentPage,
      setPageSize,
      setNumPages,
    }),
    [currentPage, pageSize, numPages],
  );

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
}

interface PaginationProps extends React.ComponentProps<'nav'> {}

const Pagination = ({ className, ...props }: PaginationProps) => {
  const { currentPage, pageSize, numPages, setCurrentPage, setPageSize } =
    usePagination();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    >
      <PaginationContent>
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
      </PaginationContent>
    </nav>
  );
};
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    aria-disabled={disabled}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      disabled && 'pointer-events-none opacity-50',
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

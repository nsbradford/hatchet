import * as React from 'react';
import { cn } from '@/lib/utils';
import { PaginationContent } from './pagination-content';
import { PageSelector } from './page-selector';
import { PageSizeSelector } from './page-size-selector';

interface PaginationProps extends React.ComponentProps<'nav'> {
  children?: React.ReactNode;
}

const Pagination = ({ className, children, ...props }: PaginationProps) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    >
      <PaginationContent>
        {children || (
          <>
            <PageSelector />
            <PageSizeSelector />
          </>
        )}
      </PaginationContent>
    </nav>
  );
};
Pagination.displayName = 'Pagination';

export { Pagination };

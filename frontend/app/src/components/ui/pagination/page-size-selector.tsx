import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePagination } from './pagination-context';
import { PaginationItem } from './pagination-link';

interface PageSizeSelectorProps {
  options?: number[];
}

export function PageSizeSelector({ options }: PageSizeSelectorProps) {
  const { pageSize, setPageSize, pageSizeOptions } = usePagination();
  const availableOptions = options || pageSizeOptions || [10, 50, 100, 500];

  return (
    <PaginationItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            {pageSize} per page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableOptions.map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => setPageSize(size)}
              className={cn(size === pageSize && 'bg-accent')}
            >
              {size} per page
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </PaginationItem>
  );
}

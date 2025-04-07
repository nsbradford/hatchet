import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/components/ui/button';
import { cva } from 'class-variance-authority';

const paginationVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        active:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        previous: 'gap-1 pl-2.5',
        next: 'gap-1 pr-2.5',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'icon',
    },
  },
);

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'active' | 'previous' | 'next';
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (
    {
      className,
      isActive,
      disabled,
      variant = 'default',
      size = 'icon',
      children,
      ...props
    },
    ref,
  ) => {
    const computedVariant = isActive ? 'active' : variant;

    return (
      <a
        ref={ref}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
        className={cn(
          paginationVariants({ variant: computedVariant, size }),
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...props}
      >
        {variant === 'previous' && <ChevronLeft className="h-4 w-4" />}
        {children}
        {variant === 'next' && <ChevronRight className="h-4 w-4" />}
      </a>
    );
  },
);
PaginationLink.displayName = 'PaginationLink';

// Previous component
const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  PaginationLinkProps
>((props, ref) => (
  <PaginationLink
    ref={ref}
    variant="previous"
    aria-label="Go to previous page"
    {...props}
  >
    <span>Previous</span>
  </PaginationLink>
));
PaginationPrevious.displayName = 'PaginationPrevious';

// Next component
const PaginationNext = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (props, ref) => (
    <PaginationLink
      ref={ref}
      variant="next"
      aria-label="Go to next page"
      {...props}
    >
      <span>Next</span>
    </PaginationLink>
  ),
);
PaginationNext.displayName = 'PaginationNext';

// Item component
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

export {
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationItem,
  paginationVariants,
};

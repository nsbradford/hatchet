import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import TimeAgo from 'timeago-react';

const timeVariants = cva('text-sm', {
  variants: {
    variant: {
      // Live count of time since the event
      timeSince: 'text-muted-foreground',
      // Formatted ISO-like date in monospace font
      timestamp: 'font-mono text-xs bg-muted px-1.5 py-0.5 rounded',
      // Short form of the date-time
      short: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'timeSince',
  },
});

export interface TimeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof timeVariants> {
  date?: string | Date | null;
  /**
   * Update interval in milliseconds for timeSince variant
   * This is converted to seconds for the timeago-react component
   * Default: 0 (uses timeago.js default intervals)
   */
  updateInterval?: number;
  asChild?: boolean;
}

export function Time({
  className,
  variant,
  date,
  updateInterval = 0,
  asChild,
  ...props
}: TimeProps) {
  // For timestamp and short variants, we'll format the date directly
  if (variant === 'timestamp' && date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formattedTime = format(dateObj, 'yyyy-MM-dd HH:mm:ss.SSS');

    return (
      <span
        className={cn(!asChild && timeVariants({ variant }), className)}
        {...props}
      >
        {formattedTime}
      </span>
    );
  }

  if (variant === 'short' && date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formattedTime = format(dateObj, 'MMM d, HH:mm');

    return (
      <span
        className={cn(!asChild && timeVariants({ variant }), className)}
        {...props}
      >
        {formattedTime}
      </span>
    );
  }

  // For timeSince variant or if no date is provided
  if (!date) {
    return (
      <span
        className={cn(!asChild && timeVariants({ variant }), className)}
        {...props}
      >
        N/A
      </span>
    );
  }

  // For timeSince variant, use TimeAgo component
  // Convert milliseconds to seconds for minInterval if specified
  const opts =
    updateInterval > 0
      ? { minInterval: Math.floor(updateInterval / 1000) }
      : undefined;

  return (
    <span
      className={cn(!asChild && timeVariants({ variant }), className)}
      {...props}
    >
      <TimeAgo datetime={date} live={true} opts={opts} />
    </span>
  );
}

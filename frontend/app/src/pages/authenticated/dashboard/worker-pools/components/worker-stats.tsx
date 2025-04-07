import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkerStatus } from './worker-filter';
import { cn } from '@/lib/utils';
import { slotsColor } from './slots-badge';

interface WorkerStatsProps {
  stats: {
    active: number;
    paused: number;
    inactive: number;
    total: number;
    slots: number;
    maxSlots: number;
  };
  isLoading: boolean;
  onFilterChange: (filter: WorkerStatus) => void;
  currentFilter: WorkerStatus;
}

// Skeleton loader for stat cards
export const StatCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-32" />
    </CardContent>
  </Card>
);

interface StatCardProps {
  value: number | React.ReactNode;
  label: string;
  colorClass: string;
  onClick: () => void;
  isActive: boolean;
  slots?: number;
  maxSlots?: number;
  className?: string;
}

const StatCard = ({
  value,
  label,
  colorClass,
  onClick,
  isActive,
  slots,
  maxSlots,
  className,
}: StatCardProps) => (
  <Card
    className={cn(
      'cursor-pointer transition-all hover:shadow-md',
      isActive && 'ring-2 ring-primary ring-opacity-50',
      className,
    )}
    onClick={onClick}
  >
    <CardContent className="pt-6">
      <div className={cn('text-2xl font-bold', colorClass)}>{value}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export function WorkerStats({
  stats,
  isLoading,
  onFilterChange,
  currentFilter,
}: WorkerStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        value={stats.active}
        label="Active"
        colorClass="text-green-600"
        onClick={() => onFilterChange('active')}
        isActive={currentFilter === 'active'}
      />

      <StatCard
        value={stats.paused}
        label="Paused"
        colorClass="text-yellow-600"
        onClick={() => onFilterChange('paused')}
        isActive={currentFilter === 'paused'}
      />

      <StatCard
        value={stats.inactive}
        label="Inactive"
        colorClass="text-red-600"
        onClick={() => onFilterChange('inactive')}
        isActive={currentFilter === 'inactive'}
      />

      <StatCard
        className={slotsColor(stats.slots, stats.maxSlots)}
        value={
          <span className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.slots}</span>
            <div className="text-sm">/ {stats.maxSlots}</div>
          </span>
        }
        label="Total Slots"
        colorClass=""
        onClick={() => onFilterChange('all')}
        isActive={currentFilter === 'all'}
      />
    </div>
  );
}

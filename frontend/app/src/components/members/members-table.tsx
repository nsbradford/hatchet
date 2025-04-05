import {
  TenantMember,
  TenantMemberRole,
} from '@/lib/api/generated/data-contracts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useCan from '@/hooks/use-can';
import { members } from '@/lib/can/features/members.permissions';
import useUser from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';

interface MembersTableProps {
  data: TenantMember[];
  isLoading: boolean;
  onRemoveClick?: (member: TenantMember) => void;
  emptyState?: React.ReactNode;
}

export function MembersTable({
  data,
  isLoading,
  onRemoveClick,
  emptyState,
}: MembersTableProps) {
  const { can } = useCan();
  const { data: user } = useUser();

  if (isLoading) {
    return <MembersTableSkeleton />;
  }

  if (data.length === 0 && emptyState) {
    return emptyState;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((member) => (
            <TableRow key={member.metadata.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {member.user.name || '-'}
                  {member.user.email === user?.email && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{formatRole(member.role)}</TableCell>
              <TableCell>{formatDate(member.metadata.createdAt)}</TableCell>
              <TableCell className="text-right">
                {onRemoveClick && can(members.remove(member)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveClick(member)}
                    className="h-8 px-2 lg:px-3"
                  >
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[120px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-[80px] ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleDateString();
}

function formatRole(role: TenantMemberRole) {
  switch (role) {
    case TenantMemberRole.ADMIN:
      return 'Admin';
    case TenantMemberRole.MEMBER:
      return 'Member';
    case TenantMemberRole.OWNER:
      return 'Owner';
    default:
      return role;
  }
}

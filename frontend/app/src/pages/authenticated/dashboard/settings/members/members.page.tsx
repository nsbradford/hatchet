import { useState } from 'react';
import { MembersProvider } from '@/hooks/use-members';
import useMembers from '@/hooks/use-members';
import { MembersTable } from '@/components/members/members-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TenantMember } from '@/lib/api/generated/data-contracts';
import { DocsButton } from '@/components/ui/docs-button';
import docs from '@/docs-meta-data';
import { UserPlus } from 'lucide-react';
import { RemoveMemberForm } from './components/remove-member-form';

export default function MembersPage() {
  return (
    <MembersProvider>
      <MembersContent />
    </MembersProvider>
  );
}

function MembersContent() {
  const { data, isLoading, refetch } = useMembers();
  const [removeMember, setRemoveMember] = useState<TenantMember | null>(null);

  const InviteMemberButton = () => (
    <Button
      key="invite-member"
      onClick={() => {
        // TODO: Implement invite functionality
        alert('Invite functionality not yet implemented');
      }}
    >
      <UserPlus className="mr-2 h-4 w-4" />
      Invite Member
    </Button>
  );

  return (
    <div className="flex-grow h-full w-full">
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-2xl font-semibold leading-tight text-foreground">
            Members
          </h2>
          <div className="flex flex-row items-center gap-2">
            <DocsButton doc={docs.home.setup} size="icon" />
            <InviteMemberButton />
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 my-4">
          Manage team members and their permissions in your workspace.
        </p>
        <Separator className="my-4" />

        <MembersTable
          data={data || []}
          isLoading={isLoading}
          onRemoveClick={(member) => {
            // Permission check is handled in the RemoveMemberForm component
            setRemoveMember(member);
          }}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <p className="text-sm text-muted-foreground">
                This state shouldn't be possible, how did you get here?
              </p>
            </div>
          }
        />

        {removeMember && (
          <RemoveMemberForm
            member={removeMember}
            close={() => {
              setRemoveMember(null);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}

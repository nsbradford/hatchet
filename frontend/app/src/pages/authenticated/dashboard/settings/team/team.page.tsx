import { useState } from 'react';
import { MembersProvider } from '@/hooks/use-members';
import { MembersTable } from '@/components/members/members-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TenantMemberRole } from '@/lib/api/generated/data-contracts';
import { UserPlus, Lock } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import useCan from '@/hooks/use-can';
import { members } from '@/lib/can/features/members.permissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CreateInviteForm } from './components/create-invite-form';
import BasicLayout from '@/components/layouts/basic.layout';
import {
  Headline,
  PageTitle,
  HeadlineActions,
  HeadlineActionItem,
} from '@/components/ui/page-header';

export default function MembersPage() {
  return (
    <MembersProvider>
      <MembersContent />
    </MembersProvider>
  );
}

function MembersContent() {
  const { canWithReason } = useCan();
  const { allowed: canViewMembers, message: canViewMembersMessage } =
    canWithReason(members.view(TenantMemberRole.MEMBER));

  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Check if user can invite members
  const { allowed: canInvite, message: canInviteMessage } = canWithReason(
    members.invite(TenantMemberRole.MEMBER),
  );

  const InviteMemberButton = () => (
    <Button
      key="invite-member"
      onClick={() => setShowInviteDialog(true)}
      disabled={!canInvite}
    >
      <UserPlus className="mr-2 h-4 w-4" />
      Invite
    </Button>
  );

  return (
    <BasicLayout>
      <Headline>
        <PageTitle description="Manage your team">Team</PageTitle>
        <HeadlineActions>
          <HeadlineActionItem>
            <InviteMemberButton />
          </HeadlineActionItem>
        </HeadlineActions>
      </Headline>

      {(canViewMembersMessage || canInviteMessage) && (
        <Alert variant="warning">
          <Lock className="w-4 h-4 mr-2" />
          <AlertTitle>Role required</AlertTitle>
          <AlertDescription>
            {canViewMembersMessage || canInviteMessage}
          </AlertDescription>
        </Alert>
      )}
      {canViewMembers && (
        <>
          <Separator className="my-4" />

          <h3 className="text-xl font-semibold leading-tight text-foreground mb-4">
            Active Members
          </h3>
          <MembersTable
            emptyState={
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <p className="text-sm text-muted-foreground">
                  No members found. Invite members to get started.
                </p>
                {canInvite && <InviteMemberButton />}
              </div>
            }
          />
        </>
      )}

      {showInviteDialog && (
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <CreateInviteForm close={() => setShowInviteDialog(false)} />
        </Dialog>
      )}
    </BasicLayout>
  );
}

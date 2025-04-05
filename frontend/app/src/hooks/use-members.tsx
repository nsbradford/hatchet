import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import useTenant from './use-tenant';
import {
  TenantMember,
  TenantMemberList,
} from '@/lib/api/generated/data-contracts';

interface MembersState {
  data: TenantMember[];
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

const MembersContext = createContext<MembersState | null>(null);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();

  const membersQuery = useQuery({
    queryKey: ['tenant-members:list', tenant?.metadata.id],
    queryFn: async (): Promise<TenantMemberList> => {
      if (!tenant?.metadata.id) {
        return { rows: [] };
      }
      return (await api.tenantMemberList(tenant.metadata.id)).data;
    },
    enabled: !!tenant?.metadata.id,
  });

  const value = {
    data: membersQuery.data?.rows || [],
    isLoading: membersQuery.isLoading,
    refetch: membersQuery.refetch,
  };

  return (
    <MembersContext.Provider value={value}>{children}</MembersContext.Provider>
  );
}

export default function useMembers(): MembersState {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
}

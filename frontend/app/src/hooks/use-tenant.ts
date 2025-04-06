import {
  Tenant,
  TenantMember,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '@/lib/api';
import api from '@/lib/api/api';
import useUser from './use-user';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

interface TenantState {
  tenant?: Tenant;
  membership?: TenantMember['role'];
  isLoading: boolean;
  setTenant: (tenant: Tenant | string) => void;
  create: UseMutationResult<Tenant, Error, string, unknown>;
  update: {
    mutate: (data: UpdateTenantRequest) => void;
    isPending: boolean;
  };
}

export default function useTenant(): TenantState {
  const { memberships, isLoading: isUserLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const setTenant = useCallback(
    (tenant: Tenant | string) => {
      const tenantId = typeof tenant === 'string' ? tenant : tenant.metadata.id;
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tenant', tenantId);
      setSearchParams(newSearchParams, { replace: true });

      console.log('setTenant', tenantId);
    },
    [searchParams, setSearchParams],
  );

  const membership = useMemo(() => {
    const tenantId =
      searchParams.get('tenant') || localStorage.getItem('tenant');

    if (tenantId == null) {
      const fallback = memberships?.[0];
      if (!fallback || !fallback.tenant) {
        return;
      }
      setTenant(fallback.tenant);
      return fallback;
    }

    const matched = memberships?.find(
      (membership) => membership.tenant?.metadata.id === tenantId,
    );

    if (!matched || !matched.tenant?.metadata.id) {
      return;
    }

    localStorage.setItem('tenant', matched.tenant?.metadata.id);

    return matched;
  }, [memberships, searchParams, setTenant]);

  const tenant = membership?.tenant;

  // Mutation for creating a tenant
  const createTenantMutation = useMutation({
    mutationKey: ['tenant:create'],
    mutationFn: async (name: string): Promise<Tenant> => {
      const tenantData: CreateTenantRequest = {
        name,
        slug: name, // Using name as slug since it's required and already validated
      };

      const response = await api.tenantCreate(tenantData);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['user:*'] });
      setTenant(data);
      return data;
    },
  });

  // Mutation for updating tenant details
  const updateTenantMutation = useMutation({
    mutationKey: ['tenant:update', tenant?.metadata.id],
    mutationFn: async (data: UpdateTenantRequest) => {
      if (!tenant?.metadata.id) {
        throw new Error('Tenant not found');
      }
      const response = await api.tenantUpdate(tenant.metadata.id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user:*'] });
      window.location.reload();
    },
  });

  return {
    tenant,
    isLoading: isUserLoading,
    membership: membership?.role,
    setTenant,
    create: createTenantMutation,
    update: {
      mutate: (data: UpdateTenantRequest) => updateTenantMutation.mutate(data),
      isPending: updateTenantMutation.isPending,
    },
  };
}

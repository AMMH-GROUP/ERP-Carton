'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserPermission {
  module: string;
  action: string;
}

interface PermissionContextType {
  permissions: UserPermission[];
  roles: string[];
  isSuperAdmin: boolean;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyPermission: (permissions: { module: string; action: string }[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPermissions([]);
        setRoles([]);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      // Fetch user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, roles(name_en, name_ar, is_system)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const activeRoleNames = userRoles?.map((ur: any) => ur.roles?.name_en).filter(Boolean) || [];
      setRoles(activeRoleNames);

      const adminCheck = activeRoleNames.includes('Super Admin');
      setIsSuperAdmin(adminCheck);

      if (adminCheck) {
        setLoading(false);
        return;
      }

      // Fetch RPC or joined permissions
      const { data: permsData } = await supabase.rpc('get_current_user_permissions');
      
      if (permsData) {
        setPermissions(permsData as UserPermission[]);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const hasPermission = (module: string, action: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.module === module && p.action === action);
  };

  const hasAnyPermission = (requiredPermissions: { module: string; action: string }[]): boolean => {
    if (isSuperAdmin) return true;
    return requiredPermissions.some(req => hasPermission(req.module, req.action));
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        roles,
        isSuperAdmin,
        loading,
        hasPermission,
        hasAnyPermission,
        refreshPermissions: fetchUserPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

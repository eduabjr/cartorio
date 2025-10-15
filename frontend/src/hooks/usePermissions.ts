import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../types/User';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permissionId: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permissionId);
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (!user) return false;
    return permissionIds.some(id => user.permissions.includes(id));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (!user) return false;
    return permissionIds.every(id => user.permissions.includes(id));
  };

  const getPermissionsByCategory = (category: string) => {
    return PERMISSIONS.filter(p => p.category === category);
  };

  const getUserPermissions = () => {
    if (!user) return [];
    return PERMISSIONS.filter(p => user.permissions.includes(p.id));
  };

  const isAdmin = (): boolean => {
    return user?.profile === 'admin';
  };

  const isEmployee = (): boolean => {
    return user?.profile === 'employee';
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByCategory,
    getUserPermissions,
    isAdmin,
    isEmployee,
    user
  };
};

import { AdminUser } from '@/types/auth.types';

// Check if user has permission
export const hasPermission = (user: AdminUser | null, permission: string): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.permissions.includes(permission);
};

// Check if user has any of the permissions
export const hasAnyPermission = (user: AdminUser | null, permissions: string[]): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissions.some((permission) => user.permissions.includes(permission));
};

// Check if user has all permissions
export const hasAllPermissions = (user: AdminUser | null, permissions: string[]): boolean => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissions.every((permission) => user.permissions.includes(permission));
};

// Check if user has role
export const hasRole = (user: AdminUser | null, role: string): boolean => {
  if (!user) return false;
  return user.role === role;
};

// Check if user is admin or above
export const isAdmin = (user: AdminUser | null): boolean => {
  if (!user) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
};

import { ROLES } from './constants';

/**
 * Default landing path after login/register by role.
 * Prefer an explicit `from` path when the user was redirected to login.
 */
export function getPostLoginPath(user, fromPath) {
  if (fromPath && typeof fromPath === 'string' && fromPath.startsWith('/')) {
    return fromPath;
  }
  return getDashboardPath(user) || '/account';
}

/** Ops home for staff/manager; null for customers. */
export function getDashboardPath(user) {
  if (!user?.role) {
    return null;
  }
  if (user.role === ROLES.MANAGER) {
    return '/manager';
  }
  if (user.role === ROLES.STAFF) {
    return '/staff';
  }
  return null;
}

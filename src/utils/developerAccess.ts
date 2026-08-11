import { toast } from 'sonner';

/**
 * Checks if the current user object has developer privileges.
 */
export const isDeveloperUser = (user: any): boolean => {
  if (!user) return false;
  return (
    user.role === 'developer' ||
    user.role === 'admin' ||
    user.isDeveloper === true ||
    (typeof user.email === 'string' && (user.email.includes('dev@') || user.email.includes('admin@')))
  );
};

/**
 * Triggers a professional, user-facing error notification whenever a restricted 
 * function or tool action is invoked by a non-developer user.
 * (Toast notification disabled per user preference)
 */
export const notifyDeveloperOnly = (_functionName?: string, _isKo: boolean = false): void => {
  // Toast popup suppressed per request — only modal dialog will be shown
};

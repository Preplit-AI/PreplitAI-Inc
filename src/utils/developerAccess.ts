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
 */
export const notifyDeveloperOnly = (functionName?: string, isKo: boolean = false): void => {
  const title = isKo ? '개발자 전용 권한 제한' : 'Developer Access Only';
  const nameLabel = functionName ? `'${functionName}' ` : '';
  
  const mainMessage = isKo
    ? `${nameLabel}기능은 허용된 개발자 계정 전용입니다. 일반 사용자 계정은 접근이 제한됩니다.`
    : `${nameLabel}This function is restricted to authorized developer accounts only.`;

  const description = isKo
    ? '시스템 기능 사용을 위해 개발자 계정으로 로그인하거나 권한을 요청하세요.'
    : 'Please sign in with an authorized developer account or request API access.';

  toast.error(title, {
    description: `${mainMessage} ${description}`,
    duration: 5000,
    dismissible: true,
  });
};

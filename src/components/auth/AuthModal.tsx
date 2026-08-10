import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { isDeveloperUser, notifyDeveloperOnly } from '@/utils/developerAccess';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any, token: string) => void;
  defaultTab?: 'login' | 'signup' | 'register';
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultTab === 'signup' ? 'register' : defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const isKo = language === 'ko';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Developer Only Access Check
    if (!isDeveloperUser({ email })) {
      const actionName = mode === 'login'
        ? (isKo ? '사용자 로그인 인증' : 'User Login Authentication')
        : (isKo ? '사용자 계정 회원가입' : 'User Account Registration');

      notifyDeveloperOnly(actionName, isKo);
      setError(
        isKo
          ? '개발자 전용 권한 제한: 로그인 및 회원가입은 현재 허용된 개발자 계정으로 제한됩니다.'
          : 'Developer Access Only: Authentication & registration are restricted to authorized developer accounts.'
      );
      return;
    }

    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { email, password, name };
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isKo ? '인증 실패' : 'Authentication failed'));
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onSuccess) onSuccess(data.user, data.accessToken);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || (isKo ? '오류가 발생했습니다' : 'Something went wrong'));
    }
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    const actionName = isKo ? '구글 소셜 로그인' : 'Google OAuth Login';
    notifyDeveloperOnly(actionName, isKo);
    setError(
      isKo
        ? '개발자 전용 권한 제한: 소셜 로그인은 허용된 개발자 계정 전용입니다.'
        : 'Developer Access Only: Social login is restricted to authorized developer accounts.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/25 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PreplitAI" className="w-7 h-7 object-contain" />
            <h3 className="text-[14px] font-semibold text-[#111] dark:text-white">
              {mode === 'login' ? (isKo ? '로그인' : 'Sign in') : (isKo ? '계정 만들기' : 'Create account')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#bbb] hover:text-[#666] dark:hover:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Developer Access Restriction Banner */}
        <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center gap-2.5 text-[11.5px] font-medium text-[#630000] dark:text-[#ffaaaa]">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#630000] dark:text-[#ff9999]" />
          <span>
            {isKo
              ? '개발자 전용 권한 제한: 허용된 개발자 계정만 로그인/가입할 수 있습니다.'
              : 'Developer Access Restricted: Only authorized developer accounts may sign in or register.'}
          </span>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          type="button"
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-[#e5e5e5] dark:border-white/[0.1] rounded-lg text-[13px] font-medium text-[#333] dark:text-[#ddd] hover:bg-[#f9f9f9] dark:hover:bg-white/[0.05] transition-colors mb-4"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {isKo ? 'Google 계정으로 계속하기' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-[#f0f0f0] dark:bg-white/[0.06] flex-1" />
          <span className="text-[11px] text-[#bbb] dark:text-[#555]">{isKo ? '또는' : 'or'}</span>
          <div className="h-px bg-[#f0f0f0] dark:bg-white/[0.06] flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[11.5px] font-medium text-[#666] dark:text-[#888] mb-1">{isKo ? '이름' : 'Full name'}</label>
              <input
                type="text"
                placeholder={isKo ? '성함 입력' : 'Your name'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-gray-900 text-black dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-medium text-[#666] dark:text-[#888] mb-1">{isKo ? '이메일' : 'Email'}</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-gray-900 text-black dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#666] dark:text-[#888] mb-1">{isKo ? '비밀번호' : 'Password'}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-gray-900 text-black dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-[12px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg px-3 py-2.5 leading-snug">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (isKo ? '처리 중...' : 'Loading...') : mode === 'login' ? (isKo ? '로그인' : 'Sign in') : (isKo ? '계정 만들기' : 'Create account')}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-[12px] text-[#999] dark:text-[#666] mt-4">
          {mode === 'login' ? (isKo ? '계정이 없으신가요? ' : "Don't have an account? ") : (isKo ? '이미 계정이 있으신가요? ' : 'Already have an account? ')}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-[#111] dark:text-white font-semibold hover:underline"
          >
            {mode === 'login' ? (isKo ? '회원가입' : 'Sign up') : (isKo ? '로그인' : 'Sign in')}
          </button>
        </p>
      </div>
    </div>
  );
}

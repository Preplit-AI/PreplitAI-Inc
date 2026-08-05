import React from 'react';
import { User, Check, Plus, Settings, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { translations, Language } from '@/i18n/translations';

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenManageSubscription?: () => void;
  language?: Language;
}

export function AccountMenu({ isOpen, onClose, onOpenSettings, onOpenAuth, onOpenManageSubscription, language = 'en' }: AccountMenuProps) {
  const [selectedAccount, setSelectedAccount] = React.useState('personal');
  if (!isOpen) return null;
  const t = translations[language] || translations.en;

  return (
    <div className="absolute bottom-full left-2 right-2 mb-1 z-50 bg-white dark:bg-[#181818] border border-[#e5e5e5] dark:border-white/[0.08] rounded-xl shadow-xl overflow-hidden">

      {/* Current account */}
      <div className="px-3 py-2.5 border-b border-[#f0f0f0] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#111] dark:bg-white flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-white dark:text-[#111]" />
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-[#111] dark:text-white truncate">My Account</p>
            <p className="text-[11px] text-[#999] dark:text-[#666] truncate">user@preplit.ai</p>
          </div>
        </div>
      </div>

      {/* Google sign in */}
      <div className="px-2 py-1.5 border-b border-[#f0f0f0] dark:border-white/[0.06]">
        <button
          onClick={() => { onClose(); onOpenAuth(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-white/[0.05] transition-colors text-left"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span className="text-[12.5px] font-medium text-[#111] dark:text-[#ddd]">Sign in with Google</span>
        </button>
        <button
          onClick={() => { onClose(); onOpenAuth(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-white/[0.05] transition-colors text-left"
        >
          <Plus className="w-4 h-4 text-[#bbb] dark:text-[#555] shrink-0" />
          <span className="text-[12.5px] font-medium text-[#666] dark:text-[#888]">{t.addAccount}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="px-2 py-1.5">
        <button
          onClick={() => { onClose(); onOpenSettings(); }}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-white/[0.05] transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-3.5 h-3.5 text-[#bbb] dark:text-[#555] shrink-0" />
            <span className="text-[12.5px] font-medium text-[#444] dark:text-[#bbb]">{t.settings}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#ddd] dark:text-[#444] group-hover:text-[#aaa] transition-colors" />
        </button>
        <button
          onClick={() => {
            onClose();
            if (onOpenManageSubscription) onOpenManageSubscription();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-white/[0.05] transition-colors text-left"
        >
          <CreditCard className="w-3.5 h-3.5 text-[#bbb] dark:text-[#555] shrink-0" />
          <span className="text-[12.5px] font-medium text-[#444] dark:text-[#bbb]">Manage Subscription</span>
        </button>
      </div>

      {/* Log out */}
      <div className="px-2 pb-1.5 border-t border-[#f0f0f0] dark:border-white/[0.06] pt-1.5">
        <button
          onClick={() => alert('Logged out.')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#fef2f2] dark:hover:bg-rose-950/20 transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400 dark:text-rose-600 shrink-0" />
          <span className="text-[12.5px] font-medium text-rose-500 dark:text-rose-500">{t.logOut}</span>
        </button>
      </div>
    </div>
  );
}

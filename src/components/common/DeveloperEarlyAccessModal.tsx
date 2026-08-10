import React from 'react';
import { Sparkles, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeveloperEarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function DeveloperEarlyAccessModal({ isOpen, onClose, featureName }: DeveloperEarlyAccessModalProps) {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#121214] border border-[#e8e5e0] dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#8B0000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#8B0000]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#999] hover:text-[#111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#fdf0f0] dark:bg-[#8B0000]/10 border border-[#f5c2c2] dark:border-[#8B0000]/30 flex items-center justify-center relative">
          <div className="w-10 h-10 rounded-xl bg-[#8B0000] flex items-center justify-center text-white shadow-md p-1.5">
            <img src="/logo.png" alt="PreplitAI Logo" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B0000] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#8B0000]"></span>
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0ede8] dark:bg-white/5 border border-[#e0dbd4] dark:border-white/10 text-[11px] font-bold text-[#8B0000] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            {isKo ? '사전 공개 테스트 진행 중' : "You're Early!"}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-[#111] dark:text-white tracking-tight pt-1">
            {isKo ? '개발자 전용 제한 안내' : 'Developer Access Only'}
          </h3>

          {featureName && (
            <p className="text-xs font-semibold text-[#8B0000] dark:text-red-400">
              {featureName}
            </p>
          )}

          <p className="text-[13.5px] text-[#666] dark:text-gray-300 leading-relaxed pt-1 px-2">
            {isKo
              ? '현재 PreplitAI 서비스는 정식 출시 전 개발자 계정에 한해 제한적으로 운영되고 있습니다. 정식 공개 출시를 기다려 주시기 바랍니다.'
              : "Access to PreplitAI services is currently restricted to authorized developer accounts only. Please wait for our official public release."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-[#8B0000] hover:bg-[#6d0000] text-white rounded-2xl font-semibold text-[14px] shadow-lg shadow-[#8B0000]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {isKo ? '확인했습니다' : 'Got it, I will wait'}
          </button>
        </div>
      </div>
    </div>
  );
}

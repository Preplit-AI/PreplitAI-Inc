import React, { useState } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onBalanceRefresh: () => void;
}

export function TopUpModal({ isOpen, onClose, currentBalance, onBalanceRefresh }: TopUpModalProps) {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  if (!isOpen) return null;

  const packages = [
    { id: 'pkg_starter',  name: 'Starter',    credits: 50,  price: 9.99,  features: ['50 AI credits', 'Quiz generation', 'Flashcards'] },
    { id: 'pkg_pro',      name: 'Scholar',     credits: 200, price: 29.99, popular: true, features: ['200 AI credits', 'Video lectures', 'All tools'] },
    { id: 'pkg_power',    name: 'Researcher',  credits: 500, price: 59.99, features: ['500 AI credits', 'Unlimited spaces', 'Priority queue'] },
  ];

  const handleCheckout = async (packageId: string) => {
    setLoadingPkg(packageId);
    try {
      const res = await fetch('http://localhost:5000/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ packageId })
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      alert('Redirecting to Stripe Checkout...');
      onClose();
    }
    setLoadingPkg(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/25 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#f0f0f0] dark:border-white/[0.06]">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111] dark:text-white">Add credits</h3>
            <p className="text-[12px] text-[#999] dark:text-[#666] mt-0.5">
              Current balance: <span className="font-medium text-[#111] dark:text-white">{currentBalance}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#bbb] hover:text-[#666] dark:hover:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-xl border p-4 transition-all ${
                pkg.popular
                  ? 'border-[#111] dark:border-white/40 bg-[#111] dark:bg-white text-white dark:text-[#111]'
                  : 'border-[#e8e8e8] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1c] hover:border-[#ccc] dark:hover:border-white/20'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#111] dark:bg-white text-white dark:text-[#111] text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}

              <div className="mb-3">
                <div className={`text-[11px] font-semibold tracking-widest uppercase mb-2 ${pkg.popular ? 'text-white/60 dark:text-[#111]/60' : 'text-[#aaa] dark:text-[#555]'}`}>
                  {pkg.name}
                </div>
                <div className={`text-[22px] font-bold tracking-tight ${pkg.popular ? 'text-white dark:text-[#111]' : 'text-[#111] dark:text-white'}`}>
                  ${pkg.price}
                </div>
                <div className={`text-[11px] mt-0.5 ${pkg.popular ? 'text-white/60 dark:text-[#111]/60' : 'text-[#aaa] dark:text-[#555]'}`}>
                  {pkg.credits} credits
                </div>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {pkg.features.map(f => (
                  <li key={f} className={`flex items-center gap-1.5 text-[11.5px] ${pkg.popular ? 'text-white/80 dark:text-[#111]/70' : 'text-[#666] dark:text-[#888]'}`}>
                    <Check className="w-3 h-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(pkg.id)}
                disabled={loadingPkg === pkg.id}
                className={`w-full py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50 ${
                  pkg.popular
                    ? 'bg-white dark:bg-[#111] text-[#111] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#222]'
                    : 'bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-[#333] dark:hover:bg-[#e8e8e8]'
                }`}
              >
                {loadingPkg === pkg.id ? 'Loading...' : 'Get started'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0] dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#bbb] dark:text-[#555]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secured by Stripe</span>
          </div>
          <span className="text-[11px] text-[#bbb] dark:text-[#555]">Credits never expire</span>
        </div>
      </div>
    </div>
  );
}

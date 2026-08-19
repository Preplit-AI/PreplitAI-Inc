import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  usagePercentage?: number;
  renewsAt?: string;
  onRefresh?: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan = 'Pro Plan',
  usagePercentage = 43,
  renewsAt,
  onRefresh
}: SubscriptionModalProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free',
      priceMonthly: '₩0',
      priceAnnual: '₩0',
      units: 'Limited Uploads & Daily Chats',
      features: ['Grounded RAG Chat', 'Basic Quizzes & Flashcards', 'Korean ↔ English basic translation', '2 Study Spaces'],
      popular: false
    },
    {
      id: 'pro',
      name: 'Student Pro',
      priceMonthly: '₩12,900',
      priceAnnual: '₩9,900',
      units: 'Unlimited AI Chats & Uploads',
      features: ['Interactive Learning Mode', 'AI Video Lecture & Podcast Mode', 'Predicted Exam Question Generator', 'Full AI Learning Analytics', 'Korean Academic Assistant', 'Unlimited Study Spaces'],
      popular: true
    },
    {
      id: 'institution',
      name: 'Institution',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      units: 'University-Wide Licensing',
      features: ['All Student Pro features', 'Bulk seat licensing & LMS integration', 'Administrator Dashboard & Analytics', 'SAML SSO & SCIM Provisioning', 'Dedicated Customer Support'],
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      onClose();
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('http://localhost:5000/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ planId, interval: billingInterval })
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e) {
      alert('Redirecting to Stripe Subscription Checkout...');
      onClose();
    }
    setLoadingPlan(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-[#f0f0f0] dark:border-white/[0.06] gap-3 shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111] dark:text-white">Preplit AI Subscriptions</h3>
            <p className="text-[12px] text-[#888] dark:text-[#666] mt-0.5">
              Current Plan: <span className="font-medium text-[#111] dark:text-white">{currentPlan}</span> ({usagePercentage}% used)
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Monthly / Annual toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#f5f5f5] dark:bg-white/[0.05] rounded-lg">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-2.5 py-1 text-[11.5px] font-medium rounded-md transition-all ${billingInterval === 'monthly' ? 'bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-2xs' : 'text-[#888] dark:text-[#666]'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('annual')}
                className={`px-2.5 py-1 text-[11.5px] font-medium rounded-md transition-all ${billingInterval === 'annual' ? 'bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-2xs' : 'text-[#888] dark:text-[#666]'}`}
              >
                Annual <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">-20%</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1 rounded-md text-[#bbb] hover:text-[#666] dark:hover:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6 overflow-y-auto flex-1">
          {plans.map(pkg => {
            const price = billingInterval === 'annual' ? pkg.priceAnnual : pkg.priceMonthly;
            const isCurrent = currentPlan.toLowerCase().includes(pkg.name.toLowerCase());
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  pkg.popular
                    ? 'border-[#111] dark:border-white/40 bg-[#111] dark:bg-white text-white dark:text-[#111] shadow-md'
                    : 'border-[#e8e8e8] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1c] hover:border-[#ccc] dark:hover:border-white/20'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#111] dark:bg-white text-white dark:text-[#111] border border-white/20 dark:border-black/20 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className={`text-[11px] font-semibold tracking-widest uppercase mb-1 ${pkg.popular ? 'text-white/60 dark:text-[#111]/60' : 'text-[#aaa] dark:text-[#555]'}`}>
                    {pkg.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-[22px] font-bold tracking-tight ${pkg.popular ? 'text-white dark:text-[#111]' : 'text-[#111] dark:text-white'}`}>
                      {price}
                    </span>
                    <span className={`text-[11px] ${pkg.popular ? 'text-white/60 dark:text-[#111]/60' : 'text-[#aaa] dark:text-[#555]'}`}>
                      /mo
                    </span>
                  </div>
                  <p className={`text-[11px] font-medium mb-3 ${pkg.popular ? 'text-emerald-300 dark:text-emerald-700' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {pkg.units}
                  </p>

                  <ul className="space-y-1.5 mb-4">
                    {pkg.features.map(f => (
                      <li key={f} className={`flex items-start gap-1.5 text-[11.5px] leading-tight ${pkg.popular ? 'text-white/80 dark:text-[#111]/80' : 'text-[#666] dark:text-[#888]'}`}>
                        <Check className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(pkg.id)}
                  disabled={loadingPlan === pkg.id || isCurrent}
                  className={`w-full py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50 ${
                    pkg.popular
                      ? 'bg-white dark:bg-[#111] text-[#111] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#222]'
                      : 'bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-[#333] dark:hover:bg-[#e8e8e8]'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : loadingPlan === pkg.id ? 'Redirecting...' : `Upgrade to ${pkg.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#f0f0f0] dark:border-white/[0.06] text-[11px] text-[#bbb] dark:text-[#555]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Stripe Recurring Subscription</span>
          </div>
          <span>Cancel anytime in Customer Portal</span>
        </div>
      </div>
    </div>
  );
}

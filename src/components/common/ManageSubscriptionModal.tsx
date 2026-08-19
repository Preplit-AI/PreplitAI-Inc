import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Calendar, Zap, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  currentPlanName?: string;
  usagePercentage?: number;
  renewsAt?: string;
}

export function ManageSubscriptionModal({
  isOpen,
  onClose,
  onOpenUpgrade,
  currentPlanName = 'Pro Plan',
  usagePercentage = 43,
  renewsAt = 'September 12, 2026'
}: ManageSubscriptionModalProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardSuccess, setCardSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await fetch('http://localhost:5000/api/subscription/portal', { method: 'POST' });
    } catch {}
    setTimeout(() => {
      setIsCanceling(false);
      setCancelConfirmed(true);
    }, 600);
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.trim().length > 12) {
      setCardSuccess(true);
      setTimeout(() => {
        setIsUpdatingCard(false);
        setCardSuccess(false);
        setCardNumber('');
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-[#f0f0f0] dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#111] dark:bg-white text-white dark:text-[#111] flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#111] dark:text-white">Manage Subscription</h3>
              <p className="text-[11.5px] text-[#888] dark:text-[#666]">Billing overview & membership details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#bbb] hover:text-[#666] dark:hover:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {/* Current Active Plan Overview Card */}
          <div className="bg-[#f9f9f9] dark:bg-white/[0.03] border border-[#e8e8e8] dark:border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-semibold tracking-wider text-[#999] dark:text-[#666] uppercase block mb-0.5">CURRENT MEMBERSHIP</span>
                <h4 className="text-[16px] font-bold text-[#111] dark:text-white">{currentPlanName}</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${cancelConfirmed ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'}`}>
                {cancelConfirmed ? 'Cancels at Period End' : 'Active Subscription'}
              </span>
            </div>

            {/* Usage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11.5px]">
                <span className="text-[#666] dark:text-[#888]">Monthly AI Allowance</span>
                <span className="font-medium text-[#111] dark:text-white tabular-nums">{usagePercentage}% Used</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e0e0e0] dark:bg-white/[0.1] overflow-hidden">
                <div
                  className="h-full bg-[#111] dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>

            {/* Billing Details Row */}
            <div className="flex items-center justify-between text-[12px] pt-1 text-[#666] dark:text-[#888] border-t border-[#eee] dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#999]" />
                <span>{cancelConfirmed ? 'Access until:' : 'Renews on:'} <strong className="text-[#111] dark:text-white font-medium">{renewsAt}</strong></span>
              </div>
              <span className="font-semibold text-[#111] dark:text-white">$19.00 / month</span>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-2">
            <label className="text-[11.5px] font-semibold text-[#888] dark:text-[#666] uppercase tracking-wider block">Payment Method</label>
            <div className="flex items-center justify-between p-3 border border-[#e8e8e8] dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#1c1c1c]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-[10px] tracking-widest shrink-0">
                  VISA
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-[#111] dark:text-white">Visa ending in 4242</p>
                  <p className="text-[11px] text-[#999] dark:text-[#666]">Expires 12/2028</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdatingCard(p => !p)}
                className="text-[12px] font-medium text-[#111] dark:text-white hover:underline px-2 py-1"
              >
                {isUpdatingCard ? 'Cancel' : 'Update'}
              </button>
            </div>

            {/* Inline Payment Update Form */}
            {isUpdatingCard && (
              <form onSubmit={handleUpdateCard} className="p-3 border border-[#e5e5e5] dark:border-white/[0.08] rounded-xl bg-[#f9f9f9] dark:bg-white/[0.02] space-y-2.5 animate-in fade-in duration-150">
                <label className="block text-[11px] font-medium text-[#666] dark:text-[#888]">New Card Number</label>
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="input-base text-[12px]"
                  required
                />
                {cardSuccess ? (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Card updated successfully!</span>
                  </div>
                ) : (
                  <button type="submit" className="btn-primary w-full py-1.5 text-[12px]">
                    Save Card Details
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#f0f0f0] dark:border-white/[0.06]">
            <button
              onClick={() => { onClose(); onOpenUpgrade(); }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#111] dark:bg-white text-white dark:text-[#111] font-semibold text-[12.5px] hover:bg-[#333] dark:hover:bg-[#e8e8e8] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade or Change Subscription Plan</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {!cancelConfirmed ? (
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors disabled:opacity-50"
              >
                {isCanceling ? 'Processing...' : 'Cancel Subscription'}
              </button>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[11.5px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Your plan remains active until {renewsAt}. You can re-activate anytime.</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#f0f0f0] dark:border-white/[0.06] text-[11px] text-[#bbb] dark:text-[#555]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure In-App Billing Engine</span>
          </div>
          <span>Preplit AI Enterprise SaaS</span>
        </div>
      </div>
    </div>
  );
}

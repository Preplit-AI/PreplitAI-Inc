import React, { useState, useEffect } from 'react';
import { TopUpModal } from './TopUpModal';

export function CreditBadge() {
  const [balance, setBalance] = useState<number>(100);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/credits/balance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.ok) { const d = await res.json(); setBalance(d.balance ?? 100); }
    } catch {}
  };

  useEffect(() => {
    fetchBalance();
    const t = setInterval(fetchBalance, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsTopUpOpen(true)}
        className="credit-pill"
        title="Top up credits"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span>{balance}</span>
      </button>
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} currentBalance={balance} onBalanceRefresh={fetchBalance} />
    </>
  );
}

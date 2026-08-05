import React, { useState, useEffect } from 'react';
import { SubscriptionModal } from './SubscriptionModal';

export function PlanBadge() {
  const [subData, setSubData] = useState({
    planName: 'Pro Plan',
    usagePercentage: 43,
    renewsAt: ''
  });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/subscription/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (res.ok) {
        const d = await res.json();
        setSubData({
          planName: d.planName || 'Pro Plan',
          usagePercentage: d.usagePercentage ?? 43,
          renewsAt: d.renewsAt || ''
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchSubscription();
    const t = setInterval(fetchSubscription, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsSubModalOpen(true)}
        className="credit-pill hover:border-[#aaa] transition-colors"
        title="View plan usage & subscription"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span>{subData.planName.split(' ')[0]} • {subData.usagePercentage}%</span>
      </button>

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        currentPlan={subData.planName}
        usagePercentage={subData.usagePercentage}
        renewsAt={subData.renewsAt}
        onRefresh={fetchSubscription}
      />
    </>
  );
}

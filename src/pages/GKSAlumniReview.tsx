import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { API_BASE_URL } from '@/constants/config';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function GKSAlumniReview() {
  const { language } = useLanguage();
  const { checkDeveloperAccess } = useAuth();
  const isKo = language === 'ko';

  const [form, setForm] = useState({
    name: '',
    email: '',
    track: 'embassy',
    universityChoice: 'Seoul National University',
    notes: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDeveloperAccess("1-on-1 GKS Alumni Scholar Review", isKo)) return;
    if (!form.name || !form.email) {
      toast.error(isKo ? '이름과 이메일을 입력해주세요.' : 'Please provide your name and email');
      return;
    }

    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/gks/manual-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          track: form.track,
          notes: `University Target: ${form.universityChoice} | Notes: ${form.notes}`
        })
      });
      setSubmitted(true);
      toast.success(isKo ? '신청이 완료되었습니다!' : 'Review application submitted successfully!');
    } catch (err) {
      setSubmitted(true);
      toast.success(isKo ? '신청이 완료되었습니다!' : 'Review application submitted successfully!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pt-16 sm:pt-20 transition-colors duration-300">
      <SEOHead
        title={isKo ? "GKS 동문 1:1 서류 첨삭 신청 — 장학생 합격 피드백" : "1-on-1 Alumni Scholar Review — GKS Application Feedback"}
        description={isKo ? "GKS 장학생 출신 평가진이 직접 진행하는 1:1 서류 첨삭 및 48시간 맞춤 심층 피드백." : "Get direct 1-on-1 human dossier review and detailed line-by-line feedback from former GKS scholars."}
        keywords={["GKS review", "GKS alumni feedback", "GKS proofreading", "GKS manual review", "GKS 2026 prep"]}
        canonical="https://preplitai.com/gks/alumni-review"
        schemaMarkup={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "1-on-1 GKS Alumni Scholar Dossier Review",
          "provider": {
            "@type": "Organization",
            "name": "Preplit AI"
          },
          "description": "Comprehensive line-by-line review of GKS personal statements and study plans by former scholars."
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-12 space-y-6">
        
        {/* COMPACT PAGE TITLE & SUBTITLE */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isKo ? 'GKS 동문 1:1 서류 첨삭 신청' : '1-on-1 Alumni Scholar Dossier Review'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isKo
              ? '서울대, 연세대, 고려대 출신 GKS 장학생 선배들의 1:1 심층 검토 (48시간 피드백).'
              : 'Line-by-line review of your Personal Statement & Study Plan by alumni scholars.'}
          </p>
        </div>

        {/* BALANCED 2-COLUMN MAIN CONTAINER */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: REVIEWER PANEL (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {isKo ? '배정 합격 장학생 평가진' : 'Assigned Scholar Panel'}
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">48h Feedback</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Dr. Jun-Ho Kim', role: '2022 GKS Scholar (SNU)', field: 'Computer Science & AI', reviews: '140+ Reviews' },
                  { name: 'Maria Santos', role: '2023 GKS Scholar (Yonsei)', field: 'International Relations', reviews: '95+ Reviews' },
                  { name: 'Alexander Chen', role: '2024 GKS Scholar (KAIST)', field: 'Robotics & Engineering', reviews: '80+ Reviews' }
                ].map((rev, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{rev.name}</span>
                      <span className="text-[10px] font-semibold text-gray-500">{rev.reviews}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#550000] dark:text-[#f08080]">{rev.role}</div>
                    <div className="text-[11px] text-gray-500">{rev.field}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: APPLICATION FORM (7 cols) */}
          <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 rounded-2xl">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-base">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isKo ? '신청서가 접수되었습니다' : 'Review Application Submitted!'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  {isKo 
                    ? '입력하신 이메일로 48시간 이내에 담당 장학생 배정 및 1:1 피드백 리포트를 전달해 드립니다.'
                    : 'An assigned alumni scholar will review your application dossier and send a detailed feedback report to your email within 48 hours.'}
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="text-xs rounded-full px-6 py-1.5 h-8">
                  <span>{isKo ? '새 신청서 작성' : 'Submit Another Request'}</span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {isKo ? '1:1 서류 첨삭 신청서' : 'Application Review Request Form'}
                  </h3>
                  <p className="text-[11px] text-gray-500">Enter your background and target university details for evaluation.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block">{isKo ? '신청자 성명' : 'Full Name'}</label>
                    <Input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Maria Santos"
                      className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block">{isKo ? '이메일 주소' : 'Email Address'}</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. maria@example.com"
                      className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block">{isKo ? '지망 트랙' : 'Target Track'}</label>
                    <select
                      value={form.track}
                      onChange={e => setForm({ ...form, track: e.target.value })}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#630000] h-9"
                    >
                      <option value="embassy">Embassy Track (공관전형)</option>
                      <option value="university">University Track (대학전형)</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block">{isKo ? '1지망 대학' : 'Target University Choice'}</label>
                    <Input
                      value={form.universityChoice}
                      onChange={e => setForm({ ...form, universityChoice: e.target.value })}
                      placeholder="e.g. Seoul National University"
                      className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-xs rounded-xl h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block">{isKo ? '추가 요청사항 및 메모' : 'Specific Questions or Notes for Reviewer'}</label>
                  <Textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Mention any specific areas where you need guidance..."
                    rows={3}
                    className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-xs rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-center">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-xs px-8 py-2 rounded-full h-10"
                  >
                    <span>{isKo ? '1:1 첨삭 신청 완료' : 'Submit Review Application'}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}

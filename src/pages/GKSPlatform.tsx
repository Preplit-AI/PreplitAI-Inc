import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { GKSAdvisorChatbot } from '@/components/gks/GKSAdvisorChatbot';

export default function GKSPlatform() {
  const { language } = useLanguage();
  const isKo = language === 'ko';
  const navigate = useNavigate();
  const [showChatBot, setShowChatBot] = useState<boolean>(false);

  const gksSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "GKS2026 Prep Application Support & Guidance",
      provider: {
        "@type": "Organization",
        name: "PreplitAI",
        url: "https://preplitai.com"
      },
      areaServed: "Global",
      serviceType: "Scholarship Application Review & Academic Guidance",
      description: "AI-driven evaluation for Global Korea Scholarship (GKS/KGSP) Form 2 Personal Statement, Form 3 Study Plan, and Form 4 Recommendation Letters."
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://preplitai.com"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "GKS2026 Prep",
          item: "https://preplitai.com/gks"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <SEOHead
        title={isKo ? "GKS2026 Prep | Preplit AI 정부초청장학생 지원 가이드" : "GKS2026 Prep | Preplit AI Global Korea Scholarship Guidance"}
        description={isKo ? "GKS 2026 정부초청장학생 지원자를 위한 AI 서류 평가, 준비도 점수 측정, 전공 적합성 가이드 툴." : "Official NIIED criteria alignment, GKS Personal Statement, Study Plan & Recommendation AI evaluation engine."}
        keywords={["GKS2026 Prep", "GKS scholarship", "KGSP guidance", "GKS application review", "NIIED AI review", "Korean Government Scholarship"]}
        url="https://preplitai.com/gks"
        canonical="https://preplitai.com/gks"
        schemaMarkup={gksSchema}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center sm:text-left">
        
        {/* TOP BRAND BADGE */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200">
            <span>{isKo ? 'Preplit AI × GKS2026 Prep 지원 & 가이드 플랫폼' : 'Preplit AI × GKS2026 Prep Application Support & Guidance'}</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12]">
            {isKo ? (
              <>
                <span className="text-black dark:text-white">GKS2026 정부초청장학생 합격을 위한</span>
                <br />
                <span className="text-[#630000] dark:text-[#c84040]">맞춤형 AI 서류 평가 & 전략 가이드</span>
              </>
            ) : (
              <>
                <span className="text-black dark:text-white">GKS2026 Prep</span>
                <br />
                <span className="text-[#630000] dark:text-[#c84040]">AI Dossier Review & Strategic Guidance</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-normal">
            {isKo ? (
              '자기소개서(Form 2), 학업계획서(Form 3), 추천서(Form 4)를 NIIED 심사 기준에 맞춰 실시간 분석합니다. 지원 준비도 점수(Application Readiness Score)와 맞춤형 개선 리포트를 확인하세요.'
            ) : (
              'Evaluate your Personal Statement (Form 2), Study Plan (Form 3), and Recommendation Letters against official NIIED selection standards. Receive your Readiness Scorecard and line-by-line action plan.'
            )}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              onClick={() => navigate('/gks/dashboard')}
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>{isKo ? 'GKS2026 Prep 워크스페이스 시작' : 'Launch GKS2026 Prep Workbench'}</span>
            </Button>

            <Button
              onClick={() => {
                const el = document.getElementById('gks-features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-full transition-all duration-200"
            >
              <span>{isKo ? '주요 기능 둘러보기' : 'Explore Platform Features'}</span>
            </Button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { label: isKo ? '지원 가능 트랙' : 'Supported Tracks', val: 'Embassy & University', sub: 'UG / Master / PhD' },
            { label: isKo ? '분석 대상 서류' : 'Evaluated Forms', val: 'Form 2, 3, 4', sub: 'PDF, DOCX, Text' },
            { label: isKo ? '평가 진단 항목' : 'Diagnostic Pillars', val: '4 Key Metrics', sub: 'Readiness 0-100%' },
            { label: isKo ? '맞춤 가이드' : 'Actionable Fixes', val: '100% Tailored', sub: 'Line-by-line Action Plan' },
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-center">
              <div className="text-xl sm:text-2xl font-bold text-[#630000] dark:text-[#c84040]">{stat.val}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* TRACK COMPARISON SECTION */}
        <div id="gks-features" className="mt-28 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {isKo ? 'GKS 지원 트랙별 맞춤형 진단 시스템' : 'Tailored Guidance for Both GKS Application Tracks'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isKo ? '공관전형(Embassy Track)과 대학전형(University Track)의 서로 다른 심사 특성을 반영합니다.' : 'Align your application strategy with specific selection criteria for Embassy or University Track.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* EMBASSY TRACK CARD */}
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-gray-400 dark:hover:border-gray-700 transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Embassy Track (공관전형)</h3>
                <p className="text-xs text-[#630000] dark:text-[#c84040] font-medium mt-1">Up to 3 Target University Choices</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                {isKo ? (
                  '3개 지망 대학(Type A/B 조합)에 대한 다각도 적합성을 진단합니다. 균형 잡힌 학업 동기와 국익 기여 가능성을 중점 평가합니다.'
                ) : (
                  'Evaluates document alignment across 3 target universities (Type A/Type B combination). Focuses on narrative coherence and bilateral friendship potential.'
                )}
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span>{isKo ? '• 3개 지망 대학 및 전공별 전공 적합성 교차 검증' : '• Cross-validation across 3 university selections'}</span>
                </li>
                <li className="flex items-start">
                  <span>{isKo ? '• 대사관 1차 면접 및 서류 심사 고득점 포인트 제시' : '• Key points for Embassy 1st round review'}</span>
                </li>
              </ul>
            </div>

            {/* UNIVERSITY TRACK CARD */}
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-gray-400 dark:hover:border-gray-700 transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">University Track (대학전형)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">1 Focused University & Department Choice</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                {isKo ? (
                  '단일 지망 대학 및 연구실(Lab) 맞춤형 학업계획서 심층 진단. 해당 학과의 연구 방향 및 교수진 연계 가능성을 정밀하게 검토합니다.'
                ) : (
                  'Deep-dive diagnosis for a single targeted university department and research lab. Evaluates specific faculty alignment and lab feasibility.'
                )}
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span>{isKo ? '• 단일 목표 학과 및 연구실 타겟형 심층 분석' : '• Targeted department & lab research fit'}</span>
                </li>
                <li className="flex items-start">
                  <span>{isKo ? '• 대학 자체 입학위원회 학술적 기준 부합성 검증' : '• University selection committee academic alignment'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4 GUIDANCE PILLARS */}
        <div className="mt-28 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {isKo ? 'GKS2026 Prep 4대 핵심 진단 항목' : 'The 4 Diagnostic Pillars of GKS2026 Prep'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isKo ? '단순 문법 교정을 넘어 GKS 심사위원의 관점에서 서류 전체의 전략적 완결성을 분석합니다.' : 'Going far beyond proofreading to analyze strategic application coherence.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: isKo ? '스토리 일관성 (Narrative Fit)' : 'Narrative Fit',
                desc: isKo ? '자기소개서와 학업계획서 간의 동기 및 성장 과정의 일치성 검증' : 'Ensures seamless narrative unity between personal statement & study plan'
              },
              {
                title: isKo ? '학업 & 전공 적합성 (Academic Fit)' : 'Academic Fit',
                desc: isKo ? '지망 학과 수강 계획, 과제, 연구 목적의 학술적 타당성 검토' : 'Evaluates research depth and prerequisite academic background'
              },
              {
                title: isKo ? '한국 연계성 (Korea Strategic Fit)' : 'Korea Strategic Fit',
                desc: isKo ? '왜 다른 국가가 아닌 한국인가? NIIED 장학사업 취지 부합성 검증' : 'Assesses genuine academic justification for choosing South Korea'
              },
              {
                title: isKo ? '졸업 후 실현 가능성 (Feasibility)' : 'Post-Study Feasibility',
                desc: isKo ? '졸업 후 진로 및 양국 간 기여 방안의 구체성과 실현 가능성' : 'Checks clarity & feasibility of career outcomes and bilateral contribution'
              }
            ].map((pillar, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{pillar.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span>{isKo ? '자동 진단 포함' : 'Automated Diagnostic'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="mt-28 p-10 rounded-3xl bg-gray-950 border border-gray-800 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              {isKo ? '지금 바로 GKS2026 서류 진단을 받아보세요' : 'Ready to Elevate Your GKS2026 Application?'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isKo ? (
                '계정 가입이나 복잡한 절차 없이, 지금 바로 서류를 업로드하고 종합 분석 리포트를 확인하실 수 있습니다.'
              ) : (
                'Upload your draft documents now to receive your GKS Application Readiness Scorecard and line-by-line guidance.'
              )}
            </p>
            <Button 
              onClick={() => navigate('/gks/dashboard')}
              size="lg" 
              className="h-12 px-8 text-sm font-medium bg-white hover:bg-gray-100 text-black rounded-full shadow-lg transition-all duration-200"
            >
              <span>{isKo ? 'GKS2026 Prep 대시보드 입장' : 'Launch GKS2026 Prep Dashboard'}</span>
            </Button>
          </div>
        </div>

      </div>

      {/* FLOATING PREPLIT AI GKS ADVISOR TRIGGER BUTTON */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 rounded-full bg-[#630000] hover:bg-[#7a0000] text-white shadow-2xl font-bold text-xs transition-all hover:scale-105 flex items-center gap-2 border border-white/20"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Preplit AI GKS Advisor</span>
      </button>

      <GKSAdvisorChatbot
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
      />

      <Footer />
    </div>
  );
}

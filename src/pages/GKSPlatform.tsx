import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';

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
  }
];

export default function GKSPlatform() {
  const { language } = useLanguage();
  const isKo = language === 'ko';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      <SEOHead
        title={isKo ? "GKS2026 Prep | Preplit AI 정부초청장학생 지원 가이드" : "GKS2026 Prep | Preplit AI Global Korea Scholarship Guidance"}
        description={isKo ? "GKS 2026 정부초청장학생 지원자를 위한 AI 서류 평가 및 전략 가이드." : "AI-powered evaluation for GKS Personal Statement, Study Plan & Recommendation Letters aligned with official NIIED criteria."}
        keywords={["GKS2026 Prep", "GKS scholarship", "KGSP guidance", "GKS application review", "NIIED AI review", "Korean Government Scholarship"]}
        url="https://preplitai.com/gks"
        canonical="https://preplitai.com/gks"
        schemaMarkup={gksSchema}
      />

      {/* HERO */}
      <main className="flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="text-center max-w-2xl mx-auto space-y-7">

          <div className="inline-block px-3 py-1 rounded-full bg-[#630000]/10 dark:bg-[#c84040]/10 text-[#630000] dark:text-[#e07070] text-xs font-medium tracking-wide">
            {isKo ? 'GKS 2026 지원자 전용' : 'For GKS 2026 Applicants'}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 dark:text-white">
            {isKo ? (
              <>GKS 서류, AI로<br />완성하세요</>
            ) : (
              <>GKS2026 Prep<br />Workspace</>
            )}
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
            {isKo
              ? '자기소개서, 학업계획서, 추천서를 NIIED 기준에 맞춰 분석하고 맞춤형 개선 피드백을 받으세요.'
              : 'Upload your Personal Statement, Study Plan, and Recommendation Letters. Get a readiness score and line-by-line feedback aligned with NIIED criteria.'}
          </p>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/gks/dashboard')}
              size="lg"
              className="h-12 px-10 text-sm font-medium bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              {isKo ? 'GKS Prep 워크스페이스 열기 →' : 'Open GKS Prep Workspace →'}
            </Button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-600">
            {isKo ? '가입 불필요 · 즉시 사용 가능' : 'No sign-up required · Start immediately'}
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}

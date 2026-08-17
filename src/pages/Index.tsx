import { Hero } from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import { WorkspaceTeaserSection } from "@/components/home/WorkspaceTeaserSection";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const siteUrl = (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PreplitAI",
      url: "https://preplitai.com",
      logo: "https://preplitai.com/logo.png",
      founder: {
        "@type": "Person",
        name: "Khan Muhammad Ahsan",
        jobTitle: "Founder & Chief Executive Officer",
        worksFor: {
          "@type": "Organization",
          name: "PreplitAI",
        },
      },
      sameAs: [
        "https://twitter.com/preplitai",
        "https://www.linkedin.com/company/preplitai",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PreplitAI",
      url: "https://preplitai.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "PreplitAI",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description:
        "AI Study Companion workspace & GKS Scholarship prep platform with grounded chat, quizzes, flashcards & application review.",
      url: "https://preplitai.com",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-x-hidden text-[#111111] dark:text-[#eeeeee]">
      <SEOHead
        title={
          isKo
            ? "PreplitAI | 대학생을 위한 학습, 실전 연습, 시험 대비 슈퍼 워크스페이스"
            : "PreplitAI | A student’s super workspace for learning, practice, and review"
        }
        description={
          isKo
            ? "강의 슬라이드, 교재, 필기 노트를 나만의 인터랙티브 AI 튜터로 전환하세요. 출처 인용 챗봇, 플래시카드, 퀴즈, 팟캐스트, 출제 예상 족보."
            : "Upload lecture slides, notes, and textbooks. Master your syllabus with grounded AI chat, spaced flashcards, practice quizzes, audio podcasts, and exam predictions."
        }
        keywords={[
          "study timer",
          "focus workspace",
          "AI study companion",
          "Korean university students",
          "AI learning analytics",
          "AI flashcards",
          "expected exam questions",
        ]}
        url={canonical}
        canonical={canonical}
        schemaMarkup={schema}
      />

      {/* 1. Hero Section (A student’s super workspace for learning, practice, and review) */}
      <Hero />

      {/* 2. Step Cards Section (Images 2 and 3) */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* 3. Workspace Teaser / Core 6 Tools */}
      <div id="features">
        <WorkspaceTeaserSection />
      </div>

      {/* 4. Bottom Closing Banner (Matching Images 4 & 5) */}
      <section className="relative bg-[#0a0a0a] dark:bg-[#070707] py-24 sm:py-32 px-6 border-t border-white/[0.06] overflow-hidden">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 bg-[url('/cta.jpeg')] bg-cover bg-center opacity-25 pointer-events-none mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/95 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold tracking-[-0.03em] text-white mb-4 leading-tight">
            {isKo ? "지금 바로 스마트하게 학습을 시작하세요." : "Start studying smarter"}
            <span className="text-[#a82424] dark:text-[#f87171] block mt-1.5 font-bold">
              {isKo ? "몇 시간이 아닌, 단 몇 분 만에." : "in minutes, not hours."}
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-10 leading-relaxed font-normal">
            {isKo
              ? "수천 명의 학생들이 PreplitAI의 출처 인용 AI로 강의 자료를 더 빠르고 정확하게 마스터하고 있습니다."
              : "Join thousands of students who use PreplitAI to master their course materials faster with grounded AI."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Button
              asChild
              className="text-[14px] px-8 py-3.5 h-12 bg-white hover:bg-slate-100 text-[#111111] rounded-full font-bold transition-all duration-200 active:scale-[0.97] shadow-xl"
            >
              <a href="/preplitai-chat" className="flex items-center gap-2">
                <span>{isKo ? "무료 워크스페이스 시작" : "Launch Workspace Free"}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-[14px] px-7 py-3.5 h-12 border-white/20 bg-transparent hover:bg-white/10 text-white rounded-full font-medium transition-all duration-200 active:scale-[0.97]"
            >
              <a href="/pricing">
                {isKo ? "요금제 확인하기" : "View Subscription Plans"}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
};

export default Index;

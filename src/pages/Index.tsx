import { useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WorkspaceTeaserSection } from "@/components/home/WorkspaceTeaserSection";
import { LiveFocusSessions } from "@/components/home/LiveFocusSessions";
import { UnlockPotentialSection } from "@/components/home/UnlockPotentialSection";
import { ClosingCtaBanner } from "@/components/home/ClosingCtaBanner";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  // Force body background
  useEffect(() => {
    document.body.classList.remove("bg-slate-900", "bg-slate-950", "bg-[#0b0f17]", "bg-[#0f172a]");
    document.body.classList.add("bg-white", "text-slate-900");
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Preplit AI",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: isKo
      ? "강의자료, 논문, 교재를 업로드하여 출처 기반 질의응답, 연습문제 생성, 플래시카드, 팟캐스트 변환 등 완벽한 학습 시스템을 제공하는 대학생 전용 AI 스터디 워크스페이스."
      : "Turn any course syllabus or lecture slides into a calm, complete learning system: grounded AI chat, flashcards, adaptive quizzes, podcasts, and exam predictions.",
  };

  const canonical = "https://preplitai.com";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#550000] selection:text-white">
      <SEOHead
        title={
          isKo
            ? "Preplit AI — 대학생을 위한 AI 학습, 실전 연습, 시험 대비 슈퍼 워크스페이스"
            : "Preplit AI — A student’s super workspace for learning, practice, and review."
        }
        description={
          isKo
            ? "강의 슬라이드, 교재, 필기 노트를 업로드하여 출처 인용 AI 챗봇, 스마트 플래시카드, 맞춤 퀴즈, 시험 예측 도구로 학업을 마스터하세요."
            : "Transform lecture slides and course notes into grounded AI chat, smart flashcards, practice quizzes, and exam predictions."
        }
        keywords={[
          "Preplit AI",
          "study workspace",
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

      {/* Floating Top Navigation Bar */}
      <TopNav />

      {/* 1. Hero Section (A student’s super workspace for learning, practice, and review) */}
      <Hero />

      {/* 2. Numbers / 3-Card Stats Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* 3. Everything for your work and focus (5-Card Pastel Bento) */}
      <div id="features">
        <WorkspaceTeaserSection />
      </div>

      {/* 4. Live Focus Sessions Charts with users (Image 1) */}
      <LiveFocusSessions />

      {/* 5. Are Ready to unlock your full potential? (Image 2) */}
      <UnlockPotentialSection />

      {/* 6. Closing Sponsor / Workspace Banner (Image 3) */}
      <ClosingCtaBanner />

      {/* 7. Pure White Footer */}
      <Footer />
    </div>
  );
};

export default Index;

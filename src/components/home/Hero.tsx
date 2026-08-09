import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const universities = [
    "Seoul National University",
    "Korea University",
    "Yonsei University",
    "KAIST",
    "POSTECH",
    "Sungkyunkwan University",
    "Hanyang University",
    "Kyung Hee University",
  ];

  const halfTrack = [...universities, ...universities];
  const marqueeItems = [...halfTrack, ...halfTrack];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="relative z-10 w-full px-4 sm:px-6 pt-20 pb-8">
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left">
            {/* Main Headline */}
            {isKo ? (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.12] mb-5 tracking-tight">
                <span className="text-black dark:text-white">AI 교육의 </span>
                <span className="text-[#630000]">미래를</span>
                <br />
                <span className="text-[#630000]">만들어갑니다.</span>
              </h1>
            ) : (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] mb-5 tracking-tight">
                <span className="text-black dark:text-white">We're building the</span>
                <br />
                <span className="text-black dark:text-white">future of </span>
                <span className="text-[#630000]">AI</span>
                <br />
                <span className="text-[#630000]">education.</span>
              </h1>
            )}

            {/* Subheadline Punchline */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed font-normal">
              {isKo
                ? "모든 강의 슬라이드와 PDF를 1대1 AI 튜터로 — 출처 인용 챗봇부터 스마트 퀴즈, 플래시카드, 팟캐스트, 출제 예상 문제까지 한곳에서."
                : "Turn any lecture slide, PDF, or textbook into a bilingual AI tutor — grounded chat, smart quizzes, flashcards, podcasts, and predicted exam questions."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <Button 
                asChild
                className="text-[15px] px-7 py-3 h-12 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full font-medium transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 justify-center"
              >
                <a href="/preplitai-chat" className="flex items-center justify-center gap-2">
                  <span>{isKo ? '워크스페이스 시작하기' : 'Launch Workspace'}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/features';
                  }
                }}
                className="text-[15px] px-7 py-3 h-12 rounded-full font-medium border border-gray-300 dark:border-gray-700 bg-white text-black dark:bg-transparent dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 justify-center cursor-pointer"
              >
                <span>{isKo ? '기능 둘러보기' : 'Explore Features'}</span>
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              {isKo ? '무료 시작 · 카드 등록 필요 없음 · 즉시 체험 가능' : 'Free to start · Instant access to Chat Playground'}
            </p>
          </div>

          {/* Right Column - Video/Demo */}
          <div className="relative animate-fade-in animation-delay-400">
            <div className="aspect-video bg-black dark:bg-gray-900 rounded-xl overflow-hidden relative shadow-xl border border-gray-200 dark:border-gray-800">
              <video
                src="/videos/demo.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>

        {/* Trusted By Logos - Infinite Marquee */}
        <div className="mt-16 w-full overflow-hidden animate-fade-in animation-delay-800">
          <div className="animate-marquee flex w-max items-center gap-12 whitespace-nowrap">
            {marqueeItems.map((u, i) => (
              <div key={i} className="text-base font-semibold text-gray-600 dark:text-gray-400">{u}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

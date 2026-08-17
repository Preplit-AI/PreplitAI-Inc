import { Github, Twitter, Instagram, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-black/[0.06] dark:border-white/[0.08] text-[#111111] dark:text-[#eeeeee]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <a href="/" className="inline-flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="PreplitAI Logo" className="h-8 w-auto object-contain" />
                <span className="text-[18px] font-bold tracking-tight text-[#111111] dark:text-white">PreplitAI</span>
              </a>
              <p className="text-sm text-[#666666] dark:text-[#999999] max-w-sm leading-relaxed mb-6 font-normal">
                {isKo
                  ? "대학생을 위한 AI 기반 몰입 스터디 워크스페이스. 출처 인용 챗, 퀴즈, 플래시카드, 시험 예측 도구로 학습을 체계화하세요."
                  : "A complete learning workspace built for focused study, grounded AI chat, spaced flashcards, practice quizzes, and exam predictions."}
              </p>
            </div>
            {/* Social handles */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/preplitai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/preplitai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/ahsann826/PreplitAI-Inc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@preplitai.com"
                aria-label="Email Contact"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#555555] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-[#111111] dark:text-white uppercase tracking-widest mb-4">
              {isKo ? "제품" : "Product"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/features" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "9가지 AI 학습 도구" : "AI Study Tools"}
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "요금제" : "Pricing Plans"}
                </a>
              </li>
              <li>
                <a href="/preplitai-chat" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "학습 대시보드" : "Study Dashboard"}
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "학습 워크플로우" : "Workflow"}
                </a>
              </li>
            </ul>
          </div>

          {/* GKS Prep & Resources */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-[#111111] dark:text-white uppercase tracking-widest mb-4">
              {isKo ? "장학금 & 리소스" : "Resources"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/gks" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors font-medium">
                  {isKo ? "GKS 2026 장학금 플랫폼" : "GKS 2026 Scholarship Platform"}
                </a>
              </li>
              <li>
                <a href="/gks/scholar-materials" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "합격자 자기소개서/학업계획서" : "Scholar Materials Library"}
                </a>
              </li>
              <li>
                <a href="/gks/alumni-review" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "1:1 동문 첨삭 리뷰" : "1:1 Alumni Application Review"}
                </a>
              </li>
              <li>
                <a href="mailto:support@preplitai.com" className="text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-white transition-colors">
                  {isKo ? "고객 지원 문의" : "Support & Inquiries"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888888]">
          <p>
            © {new Date().getFullYear()} PreplitAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Built for academic excellence</span>
            <span>Seoul, Republic of Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
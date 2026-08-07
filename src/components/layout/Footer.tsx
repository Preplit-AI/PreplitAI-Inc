import { Github, Twitter, Instagram } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  return (
    <footer className="bg-gray-950">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <span className="text-[17px] font-semibold tracking-tight text-white">PreplitAI</span>
            </a>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
              {isKo
                ? "AI 기반 맞춤형 학습 워크스페이스. 대학생, 교육자 및 스터디 팀을 위해 빌드되었습니다."
                : "Transform your learning experience with AI-powered interactive study tools. Built for students, educators, and teams."}
            </p>
            <div className="flex items-center gap-2">
              <a href="https://www.instagram.com/preplitai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://x.com/preplitai" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com/ahsann826/PreplitAI-Inc" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4">
              {isKo ? '제품' : 'Product'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/features" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {isKo ? '기능' : 'Features'}
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {isKo ? '요금제' : 'Pricing'}
                </a>
              </li>
              <li>
                <a href="/preplitai-chat" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {isKo ? 'AI 학습 워크스페이스' : 'AI Workspace'}
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4">
              {isKo ? '회사 소개' : 'Company'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {isKo ? '소개' : 'About'}
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-gray-500 hover:text-white transition-colors font-medium text-gray-300 hover:text-white">
                  {isKo ? '블로그 및 학업 가이드' : 'Blog & Study Guides'}
                </a>
              </li>
              <li>
                <a href="/status" className="text-sm text-gray-500 hover:text-white transition-colors">
                  {isKo ? '서비스 상태' : 'Status'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-gray-600">
            © {new Date().getFullYear()} PreplitAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/about" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">
              {isKo ? '개인정보처리방침' : 'Privacy Policy'}
            </a>
            <a href="/about" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors">
              {isKo ? '이용약관' : 'Terms of Service'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-black/[0.06] dark:border-white/[0.08] text-[#111111] dark:text-[#eeeeee]">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand Info (Left Aligned on Mobile & Desktop) */}
          <div className="flex flex-col items-start text-left gap-2">
            <a href="/" className="inline-flex items-center">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-white hover:opacity-80 transition-opacity">
                PreplitAI
              </span>
            </a>
            <p className="text-xs text-[#666666] dark:text-[#999999] max-w-md font-normal leading-relaxed text-left">
              {isKo
                ? "집중 학습, 연습, 시험 대비를 한 곳에서 체계화하는 올인원 학업 워크스페이스."
                : "A complete learning workspace for focused study, practice, & exam prep all in one place."}
            </p>
          </div>

          {/* Contact Us Link */}
          <div className="flex items-center gap-6 self-start sm:self-auto">
            <a
              href="mailto:info@preplitai.com"
              className="text-xs font-semibold text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 -ml-3 sm:ml-0"
            >
              {isKo ? "문의하기 (Contact Us)" : "Contact Us"}
            </a>
          </div>
        </div>

        {/* Bottom bar (Left Aligned on Mobile) */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#888888] text-left">
          <p>© {new Date().getFullYear()} PreplitAI Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span>Built for academic excellence</span>
            <span>•</span>
            <span>Seoul, Republic of Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-black/[0.06] dark:border-white/[0.08] text-[#111111] dark:text-[#eeeeee]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <a href="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="PreplitAI Logo" className="h-7 w-auto object-contain" />
              <span className="text-[17px] font-bold tracking-tight text-[#111111] dark:text-white">
                PreplitAI
              </span>
            </a>
            <p className="text-xs text-[#666666] dark:text-[#999999] max-w-md font-normal leading-relaxed">
              {isKo
                ? "집중 학습, 연습, 시험 대비를 한 곳에서 체계화하는 올인원 학업 워크스페이스."
                : "A complete learning workspace for focused study, practice, & exam prep all in one place."}
            </p>
          </div>

          {/* Only Support Link */}
          <div className="flex items-center gap-6">
            <a
              href="mailto:support@preplitai.com"
              className="text-xs font-semibold text-[#666666] dark:text-[#999999] hover:text-[#550000] dark:hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800"
            >
              {isKo ? "고객 지원 (Support)" : "Support"}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#888888]">
          <p>© {new Date().getFullYear()} PreplitAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Built for academic excellence</span>
            <span>•</span>
            <span>Seoul, Republic of Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
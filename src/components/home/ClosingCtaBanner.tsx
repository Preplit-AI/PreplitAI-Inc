import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight } from "lucide-react";

export const ClosingCtaBanner = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="bg-[#fbfbfb] dark:bg-[#070707] px-4 py-10 md:py-14 border-t border-black/[0.04] dark:border-white/[0.04]">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/80 dark:border-white/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="relative isolate min-h-[360px] bg-[url('/cta.jpeg')] bg-cover bg-center px-6 py-8 sm:px-10 sm:py-10 md:min-h-[390px] md:px-12 flex items-center">
          {/* Subtle gradient overlay to make text pop on the scenic sky */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.85)_46%,rgba(255,255,255,0.3)_72%,rgba(255,255,255,0.05)_100%)] dark:bg-[linear-gradient(90deg,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.85)_46%,rgba(10,10,10,0.4)_72%,rgba(10,10,10,0.1)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black/10 to-transparent" />

          <div className="flex min-h-[280px] w-full flex-col justify-between gap-8 md:min-h-[300px] md:flex-row md:items-center">
            {/* Left Content */}
            <div className="max-w-[34rem]">
              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.1] mb-4">
                {isKo ? (
                  <>
                    최고의 학업 워크스페이스를
                    <br />
                    함께 완성해 나가요.
                  </>
                ) : (
                  <>
                    Help us build the
                    <br />
                    ultimate workspace.
                  </>
                )}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed">
                {isKo
                  ? "PreplitAI는 학생 중심의 집중 환경을 위해 군더더기 없이 제작되었습니다. 여러분의 지지는 서버 운영과 새로운 집중 도구 개발, 더 조용하고 강력한 웹을 만드는 데 큰 힘이 됩니다."
                  : "PreplitAI is indie-crafted and free of clutter. Your support keeps the servers running, funds new focus widgets, and helps us keep building a quieter web."}
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[210px]">
              {/* GitHub Sponsors Button */}
              <a
                href="https://github.com/ahsann826/PreplitAI-Inc"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 rounded-full bg-neutral-950 text-white font-semibold text-sm flex items-center justify-between hover:bg-neutral-850 transition-all shadow-md active:scale-95 group"
              >
                <span>GitHub Sponsors</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              {/* Buy Me a Coffee / Workspace Button */}
              <a
                href="/preplitai-chat"
                className="h-12 px-6 rounded-full border border-white/70 dark:border-white/20 bg-white/85 dark:bg-white/10 backdrop-blur-md text-neutral-900 dark:text-white font-semibold text-sm flex items-center justify-between hover:bg-white dark:hover:bg-white/20 transition-all shadow-xs active:scale-95 group"
              >
                <span>{isKo ? "무료 워크스페이스 시작" : "Buy Me a Coffee"}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const steps = [
    {
      number: "01",
      label: isKo ? "01. 학습 자료 업로드" : "01. Upload Material",
      headline: isKo ? "PDF, 슬라이드, 노트를 업로드하여\n나만의 스터디 스페이스를 만드세요." : "Upload your PDFs, slides & notes.\nCreate your study space.",
      image: "/step1-upload.png",
      alt: "File upload interface",
      accent: "bg-black",
    },
    {
      number: "02",
      label: isKo ? "02. AI 지식 베이스 구축" : "02. AI Knowledge Base",
      headline: isKo ? "AI가 업로드된 자료를 실시간으로 분석하고 출처를 구조화합니다." : "AI processes and indexes your material for perfect recall.",
      image: "/step2-ai.png",
      alt: "AI processing interface",
      accent: "bg-black",
    },
    {
      number: "03",
      label: isKo ? "03. 맞춤 학업 마스터" : "03. Interactive Mastery",
      headline: isKo ? "9가지 AI 전용 학업 도구로 학습하고 숙달도를 완벽하게 추적하세요." : "Study with 9 AI tools and track your mastery progress.",
      image: "/step3-video.png",
      alt: "Study interface",
      accent: "bg-black",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Header — minimal */}
        <div className="mb-14">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-[#630000] mb-3">
            {isKo ? '학습 워크플로우' : 'How it works'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white max-w-lg leading-tight">
            {isKo ? '문서 업로드부터 시험 완벽 대비까지 3단계.' : 'From documents to exam readiness in three steps.'}
          </h2>
        </div>

        {/* Bento Grid — Notion style */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Left column */}
          <div className="flex flex-col h-full gap-5">
            {/* Card 1 — Large spanning card */}
            <div className={`relative flex flex-col h-fit rounded-2xl overflow-hidden border border-white/10 ${steps[0].accent} group cursor-pointer`}>
              <div className="p-8">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full mb-4">
                  {steps[0].label}
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white leading-snug mb-0 whitespace-pre-line">
                  {steps[0].headline}
                </h3>
              </div>
              <div className="px-8 pt-8 flex items-end">
                <img
                  src={steps[0].image}
                  alt={steps[0].alt}
                  className="w-full rounded-t-xl shadow-lg border border-white/10 object-contain"
                />
              </div>
            </div>

            {/* Why PreplitAI — using provided image directly (Desktop) */}
            <div className="hidden md:block flex-1 rounded-2xl overflow-hidden min-h-[280px]">
              <img
                src="/why-preplitai.png"
                alt="Why PreplitAI — Because your notes deserve a stage"
                className="w-full h-full object-cover"
              />
            </div>

          </div>


          {/* Right column — stacked */}
          <div className="flex flex-col gap-5">

            {/* Card 2 */}
            <div className={`relative rounded-2xl overflow-hidden border border-white/10 ${steps[1].accent} group cursor-pointer flex-1`}>
              <div className="p-8 pb-0">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full mb-4">
                  {steps[1].label}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white leading-snug mb-5">
                  {steps[1].headline}
                </h3>
              </div>
              <div className="px-8">
                <img
                  src={steps[1].image}
                  alt={steps[1].alt}
                  className="w-full rounded-t-xl shadow-lg border border-white/10 object-cover"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className={`relative rounded-2xl overflow-hidden border border-white/10 ${steps[2].accent} group cursor-pointer flex-1`}>
              <div className="p-8 pb-0">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1 rounded-full mb-4">
                  {steps[2].label}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white leading-snug mb-5">
                  {steps[2].headline}
                </h3>
              </div>
              <div className="px-8">
                <img
                  src={steps[2].image}
                  alt={steps[2].alt}
                  className="w-full rounded-t-xl shadow-lg border border-white/10 object-cover"
                />
              </div>
            </div>

            {/* Why PreplitAI — using provided image directly (Mobile) */}
            <div className="block md:hidden rounded-2xl overflow-hidden min-h-[280px]">
              <img
                src="/why-preplitai.png"
                alt="Why PreplitAI — Because your notes deserve a stage"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

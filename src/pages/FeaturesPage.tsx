import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight } from "lucide-react";

/* ───────────────────────── Mockup shell ───────────────────────── */
const MockupCard = ({
  url,
  children,
  className = "",
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl bg-[#1a1a1a] overflow-hidden shadow-2xl ring-1 ring-white/5 ${className}`}
  >
    {/* Browser chrome */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-3 text-[11px] text-gray-500 font-mono truncate">
        {url}
      </span>
    </div>
    {/* Content */}
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

/* ───────────────────────── Numbered badge ─────────────────────── */
const Badge = ({ n, label }: { n: number; label: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <span className="w-6 h-6 rounded-full bg-[#3a1111] text-white text-[11px] font-bold flex items-center justify-center">
      {n}
    </span>
    <span className="text-[12px] font-bold tracking-[0.18em] uppercase text-[#550000]">
      {label}
    </span>
  </div>
);

/* ───────────────────────── Feature section ────────────────────── */
const FeatureSection = ({
  badge,
  heading,
  body,
  mockup,
  reverse = false,
}: {
  badge: React.ReactNode;
  heading: React.ReactNode;
  body: React.ReactNode;
  mockup: React.ReactNode;
  reverse?: boolean;
}) => (
  <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
    <div
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${
        reverse ? "md:[direction:rtl]" : ""
      }`}
    >
      {/* Text */}
      <div className={reverse ? "md:[direction:ltr]" : ""}>
        {badge}
        {heading}
        <div className="mt-6 space-y-4 text-[15px] sm:text-base leading-relaxed text-[#444] font-normal">
          {body}
        </div>
      </div>
      {/* Mockup */}
      <div className={reverse ? "md:[direction:ltr]" : ""}>{mockup}</div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════ */
/*                         FEATURES PAGE                          */
/* ═══════════════════════════════════════════════════════════════ */

const FeaturesPage = () => {
  const { language } = useLanguage();
  const isKo = language === "ko";

  const siteUrl =
    (import.meta as any).env?.VITE_SITE_URL || "https://preplitai.com";
  const canonical = `${siteUrl}/features`;

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
      <SEOHead
        title={
          isKo
            ? "PreplitAI 기능 — 9가지 핵심 AI 학업 도구"
            : "PreplitAI Features — Every AI Tool a Student Needs"
        }
        description={
          isKo
            ? "강의 슬라이드와 PDF를 올리면 출처 인용 AI 챗, 실시간 강의 노트, 3D 학습, 퀴즈, 출제 예상까지 한 워크스페이스에서 시작하세요."
            : "Explore Preplit's nine AI-powered study tools — all grounded in your own lecture slides, notes, and past papers."
        }
        url={canonical}
        canonical={canonical}
      />

      {/* ──────────────────────── HERO ──────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 text-center">
        {/* Label */}
        <p className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-[#550000] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#550000] inline-block" />
          {isKo ? "프렙릿 핵심 기능" : "THE PREPLIT FEATURE SET"}
        </p>

        {/* Headline */}
        <h1 className="text-[2.2rem] sm:text-5xl md:text-[3.5rem] font-bold leading-[1.12] tracking-tight mb-6">
          {isKo ? (
            <>
              학생에게 필요한 모든 AI 도구 —
              <br />
              <span className="font-editorial text-[#550000]">
                이미 수업에 맞춰져 있습니다.
              </span>
            </>
          ) : (
            <>
              Every AI tool a student needs —
              <br />
              <span className="font-editorial text-[#550000]">
                already grounded in your course.
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#666] max-w-2xl mx-auto leading-relaxed mb-10">
          {isKo
            ? "Preplit은 9가지 AI 학습 도구를 여러분의 강의 슬라이드, 노트, 기출문제를 중심으로 연결합니다. 여기서 만든 것은 다른 앱에 다시 설명할 필요가 없습니다."
            : "Preplit connects nine AI-powered tools around your own lecture slides, notes and past papers — so nothing you build here has to be re-explained to another app."}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <a
            href="/preplitai-chat"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {isKo ? "무료로 학습 시작" : "Start studying free"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="/preplitai-chat"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#f0ebe4] hover:bg-[#e8e2d9] text-[#1a1a1a] text-sm font-semibold transition-all"
          >
            {isKo ? "코스 워크스페이스 보기" : "See a course workspace"}
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {(isKo
            ? ["AI 챗", "렉처 버디", "3D 학습", "연습 퀴즈", "출제 예측", "분석"]
            : ["AI chat", "Lecture Buddy", "3D learning", "Practice quizzes", "Exam predictor", "Analytics"]
          ).map((pill) => (
            <span
              key={pill}
              className="px-4 py-2 rounded-full border border-[#d5d0ca] text-[13px] font-medium text-[#444] bg-white hover:bg-[#f9f7f4] transition-colors cursor-default"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* ─────────────── 1 · CAPTURE — Lecture Buddy ─────────────── */}
      <FeatureSection
        badge={<Badge n={1} label={isKo ? "캡처" : "CAPTURE"} />}
        heading={
          <h2 className="text-[1.75rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
            {isKo ? (
              <>
                강의에 앉아 있으세요.{" "}
                <span className="font-editorial text-[#550000]">
                  돈 주고 시키고 싶은 수준의 노트를 가지고 나오세요.
                </span>
              </>
            ) : (
              <>
                Sit in the lecture.{" "}
                <span className="font-editorial text-[#550000]">
                  Leave with notes you'd actually pay someone to write.
                </span>
              </>
            )}
          </h2>
        }
        body={
          <>
            <p>
              {isKo
                ? "AI 렉처 버디는 교수님이 강의하는 동안 듣고, 실시간으로 체계적인 노트를 만들어줍니다 — 핵심 개념, 정의, 설명에 쓰인 예시까지. 듣기와 필기를 번갈아 하느라 집중을 깨뜨리지 않아도 됩니다."
                : "AI Lecture Buddy listens while your professor teaches and structures what it hears into organized notes in real time — key concepts, definitions, and the examples used to explain them. You stay focused on the lecture instead of splitting your attention between listening and transcribing."}
            </p>
            <p>
              {isKo
                ? "수업이 끝나도 강의는 사라지지 않습니다. 코스 워크스페이스의 일부가 되어 AI 챗, 플래시카드, 퀴즈에 활용할 수 있게 됩니다."
                : "When class ends, the lecture doesn't disappear. It becomes part of your course workspace, ready for AI chat, flashcards and quizzes to draw on."}
            </p>
          </>
        }
        mockup={
          <MockupCard url="preplitai.com/workspace/lecture-buddy">
            {/* Live indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-sm font-semibold">
                  Organic Chemistry II — live
                </span>
              </div>
              <span className="text-gray-500 text-xs font-mono">47:12</span>
            </div>
            {/* Transcript quote */}
            <p className="text-[13px] text-gray-400 leading-relaxed mb-4 border-l-2 border-gray-700 pl-3">
              "...so when the nucleophile attacks the carbon, it happens in a
              single step — and that's what gives us the inversion of
              configuration at that center..."
            </p>
            {/* Concept bullets */}
            <div className="space-y-2.5">
              {[
                "SN2 — single concerted step, backside attack",
                "Result — inversion of configuration at the chiral center",
                "Compare — SN1 proceeds through a carbocation intermediate",
              ].map((note) => (
                <div
                  key={note}
                  className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-gray-300"
                >
                  {note}
                </div>
              ))}
            </div>
            {/* Stats row */}
            <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
              <div>
                <div className="text-white text-base font-bold">12</div>
                <div className="text-[11px] text-gray-500">
                  concepts structured
                </div>
              </div>
              <div>
                <div className="text-white text-base font-bold">3</div>
                <div className="text-[11px] text-gray-500">
                  flagged for review
                </div>
              </div>
              <div>
                <div className="text-[#28c840] text-base font-bold">Synced</div>
                <div className="text-[11px] text-gray-500">to workspace</div>
              </div>
            </div>
          </MockupCard>
        }
      />

      {/* ─────────────── 2 · LEARN — 3D Learning ─────────────── */}
      <FeatureSection
        reverse
        badge={<Badge n={2} label={isKo ? "학습" : "LEARN"} />}
        heading={
          <h2 className="text-[1.75rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
            {isKo ? (
              <>
                한 문단으로 설명하기 어려운 것들이 있습니다.{" "}
                <span className="font-editorial text-[#550000]">
                  그러니 읽지만 말고 — 돌려보세요.
                </span>
              </>
            ) : (
              <>
                Some things are hard to explain in a paragraph.{" "}
                <span className="font-editorial text-[#550000]">
                  So don't just read them — turn them around.
                </span>
              </>
            )}
          </h2>
        }
        body={
          <>
            <p>
              {isKo
                ? "Preplit의 3D 학습 모드는 정적인 다이어그램을 회전, 확대, 분해할 수 있는 모델로 바꿔줍니다. 공간적 과목에 특화된 라이브러리에서 가져옵니다 — 유기 화학, 해부학, 기계 시스템, 세포 생물학, 물리학."
                : "Preplit's 3D learning mode swaps static diagrams for models you can rotate, zoom and take apart, drawn from an expanding library built for spatial subjects — organic chemistry, anatomy, mechanical systems, cell biology, physics."}
            </p>
            <p>
              {isKo
                ? "어차피 같은 내용입니다. 어떤 개념은 페이지보다 손 안에서 더 잘 이해될 뿐입니다."
                : "It's the same material either way. Some concepts just make more sense in your hands than on a page."}
            </p>
          </>
        }
        mockup={
          <MockupCard url="preplitai.com/workspace/3d-learning">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-300 text-sm font-medium">
                3D viewer — SN2 transition state
              </span>
              <span className="text-gray-500 text-xs">Chemistry</span>
            </div>
            {/* 3D visual placeholder */}
            <div className="flex items-center justify-center py-10">
              <div className="relative">
                {/* Central atom */}
                <div className="w-8 h-8 rounded-full bg-[#7cb342] shadow-lg shadow-[#7cb342]/30 mx-auto" />
                {/* Bonds */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c62828]" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c62828]" />
                <div className="absolute top-1/2 -translate-y-1/2 -left-10 w-3 h-3 rounded-full bg-[#fdd835]" />
                <div className="absolute top-1/2 -translate-y-1/2 -right-10 w-3 h-3 rounded-full bg-[#fdd835]" />
                {/* Connecting lines */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-600" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-600" />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-6 w-6 h-px bg-gray-600" />
                <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-6 w-6 h-px bg-gray-600" />
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-5">
              {["↻", "⊕", "↺"].map((icon) => (
                <span
                  key={icon}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 text-sm"
                >
                  {icon}
                </span>
              ))}
            </div>
            {/* Subject tags */}
            <div className="flex gap-2">
              {["Organic chemistry", "Anatomy", "Mechanics"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[12px] text-gray-300 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </MockupCard>
        }
      />

      {/* ─────────────── 3 · PRACTICE — Quizzes ─────────────── */}
      <FeatureSection
        badge={<Badge n={3} label={isKo ? "연습" : "PRACTICE"} />}
        heading={
          <h2 className="text-[1.75rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
            {isKo ? (
              <>
                노트를 다시 읽는 것은{" "}
                <span className="font-editorial text-[#550000]">
                  질문을 받는 것과 같지 않습니다.
                </span>
              </>
            ) : (
              <>
                Reading your notes again{" "}
                <span className="font-editorial text-[#550000]">
                  isn't the same as being asked.
                </span>
              </>
            )}
          </h2>
        }
        body={
          <>
            <p>
              {isKo
                ? "모든 코스가 여러분의 자료로 만들어진 문제 은행이 됩니다 — 인터넷에서 가져온 범용 퀴즈가 아닙니다. Preplit은 슬라이드와 노트에서 연습 문제를 생성하고, 답을 채점하고, 실제로 아는 것과 모르는 것을 조용히 추적합니다."
                : "Every course becomes a question bank built from your own material, not a generic quiz pulled off the internet. Preplit generates practice questions from your slides and notes, checks your answers, and quietly keeps score of what you actually know."}
            </p>
            <p>
              {isKo
                ? "노트 정리를 끝내는 것과 시험 준비가 되는 것의 차이가 바로 이것입니다."
                : "That's the difference between finishing your notes and being ready for the exam."}
            </p>
          </>
        }
        mockup={
          <MockupCard url="preplitai.com/workspace/quizzes">
            {/* Quiz header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-white text-sm font-semibold">
                Data Structures & Algorithms
              </span>
              <span className="text-gray-500 text-xs">Question 12 / 20</span>
            </div>
            {/* Question */}
            <p className="text-gray-300 text-[14px] mb-5 leading-relaxed">
              Which traversal visits the root between the left and right
              subtrees?
            </p>
            {/* Options */}
            <div className="space-y-2.5">
              {[
                { text: "Pre-order traversal", selected: false },
                { text: "In-order traversal", selected: true },
                { text: "Post-order traversal", selected: false },
                { text: "Level-order traversal", selected: false },
              ].map((opt) => (
                <div
                  key={opt.text}
                  className={`px-4 py-3 rounded-xl text-[13px] font-medium flex items-center justify-between transition-all ${
                    opt.selected
                      ? "bg-[#2e5c1e] border border-[#3d7a28] text-white"
                      : "bg-white/[0.03] border border-white/[0.06] text-gray-400"
                  }`}
                >
                  <span>{opt.text}</span>
                  {opt.selected && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
              ))}
            </div>
            {/* Explanation */}
            <div className="mt-4 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] text-gray-500">
              Correct — in-order visits left, then root, then right
            </div>
          </MockupCard>
        }
      />

      {/* ─────────────── 4 · PREPARE — Exam Predictor ─────────────── */}
      <FeatureSection
        reverse
        badge={<Badge n={4} label={isKo ? "대비" : "PREPARE"} />}
        heading={
          <h2 className="text-[1.75rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
            {isKo ? (
              <>
                시험에 뭐가 나오는지 알려주지 않겠습니다.{" "}
                <span className="font-editorial text-[#550000]">
                  어디부터 공부해야 하는지 알려드립니다.
                </span>
              </>
            ) : (
              <>
                We won't tell you what's on the exam.{" "}
                <span className="font-editorial text-[#550000]">
                  We'll tell you what to study first.
                </span>
              </>
            )}
          </h2>
        }
        body={
          <>
            <p>
              {isKo
                ? "Preplit은 기출문제, 수업 자료, 이전 시험 패턴을 분석해서 가장 출제 가능성이 높은 주제를 찾아냅니다 — 보장이 아니라, 제한된 공부 시간을 어디에 쓸지 결정하는 출발점입니다."
                : "Preplit reads through your past papers, course materials and prior exam patterns to surface the topics most likely to matter — not a guarantee, but a starting point for how you spend a limited number of study hours."}
            </p>
            <p>
              {isKo
                ? "범용 교과서 커리큘럼이 아니라 교수님의 실제 출제 이력 기반입니다."
                : "Built from your professor's own history, not a generic syllabus."}
            </p>
          </>
        }
        mockup={
          <MockupCard url="preplitai.com/workspace/exam-predictor">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm font-semibold">
                Exam predictor
              </span>
              <span className="text-gray-500 text-xs">
                Based on 6 past papers
              </span>
            </div>
            {/* Priority bars */}
            <div className="space-y-5">
              {/* High priority */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-300 text-[13px] font-medium">
                    Graph traversal
                  </span>
                  <span className="text-red-400 text-[12px] font-semibold">
                    High priority
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "92%",
                      background:
                        "linear-gradient(90deg, #dc2626 0%, #f59e0b 100%)",
                    }}
                  />
                </div>
              </div>
              {/* Medium priority */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-300 text-[13px] font-medium">
                    Dynamic programming
                  </span>
                  <span className="text-yellow-400 text-[12px] font-semibold">
                    Medium priority
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "65%",
                      background:
                        "linear-gradient(90deg, #dc2626 0%, #f59e0b 100%)",
                    }}
                  />
                </div>
              </div>
              {/* Review recommended */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-300 text-[13px] font-medium">
                    Big-O analysis
                  </span>
                  <span className="text-gray-500 text-[12px] font-medium">
                    Review recommended
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-600"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>
            </div>
          </MockupCard>
        }
      />

      {/* ─────────────── 5 · TRACK — Analytics ─────────────── */}
      <FeatureSection
        badge={<Badge n={5} label={isKo ? "추적" : "TRACK"} />}
        heading={
          <h2 className="text-[1.75rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
            {isKo ? (
              <>
                공부는 뭔가를 돌려줘야 합니다.{" "}
                <span className="font-editorial text-[#550000]">
                  얼마나 오래 했는지가 아니라 — 얼마나 준비됐는지.
                </span>
              </>
            ) : (
              <>
                Studying should tell you something back.{" "}
                <span className="font-editorial text-[#550000]">
                  Not just how long — how ready.
                </span>
              </>
            )}
          </h2>
        }
        body={
          <>
            <p>
              {isKo
                ? "모든 코스 뒤에서 Preplit은 학습 시간, 마스터한 주제, 퀴즈 성적, 계속 틀리는 부분을 추적합니다 — 그리고 모든 것을 하나의 숫자로 만듭니다: 시험에 얼마나 준비됐는지."
                : "Behind every course, Preplit tracks study time, topics mastered, quiz performance and the areas you keep getting wrong — then turns all of it into one number: how ready you actually are for the exam."}
            </p>
            <p>
              {isKo
                ? "공부하고, 연습하고, 부족한 부분을 찾고, 복습하고, 다시 반복하는 순환 — 그것을 완성하는 것이 이 기능입니다."
                : "That's what closes the loop — study, practice, find the gap, review, and go again."}
            </p>
          </>
        }
        mockup={
          <MockupCard url="preplitai.com/workspace/analytics">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-white text-sm font-semibold">
                Data Structures & Algorithms
              </span>
              <span className="text-gray-500 text-xs">This week</span>
            </div>
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="text-white text-xl font-bold">78%</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  course progress
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="text-white text-xl font-bold">18/24</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  topics mastered
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="text-white text-xl font-bold">87%</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  practice score
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#2a1a0a] border border-[#3d2a15]">
                <div className="text-white text-xl font-bold">
                  84%{" "}
                  <span className="text-[#28c840] text-sm font-semibold">
                    ↑12%
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  exam readiness
                </div>
              </div>
            </div>
            {/* Weak area */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-gray-400 text-[13px]">
                Weak area — Dynamic programming
              </span>
              <span className="text-[12px] font-semibold text-[#c84040] bg-[#c84040]/10 px-2.5 py-1 rounded-full">
                Review recommended
              </span>
            </div>
          </MockupCard>
        }
      />

      {/* ─────────────── Closing Statement ─────────────── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-[2.8rem] font-bold tracking-tight leading-[1.15]">
          {isKo
            ? "그리고 이 모든 것이 서로 연결됩니다."
            : "And everything that connects around them."}
        </h2>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsViewProps {
  language?: string;
  hasData?: boolean;
}

// SVG radar chart for topic mastery
function RadarChart({ topics }: { topics: { name: string; score: number }[] }) {
  const cx = 160, cy = 160, r = 110;
  const n = topics.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });
  const polyPoints = topics.map((t, i) => {
    const p = point(i, (t.score / 100) * r);
    return p.x + "," + p.y;
  }).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto">
      {/* Grid rings */}
      {gridLevels.map((lvl, gi) => {
        const pts = topics.map((_, i) => {
          const p = point(i, lvl * r);
          return p.x + "," + p.y;
        }).join(" ");
        return <polygon key={gi} points={pts} fill="none" stroke="#e8e5e0" strokeWidth="1" />;
      })}
      {/* Axes */}
      {topics.map((_, i) => {
        const p = point(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e8e5e0" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={polyPoints} fill="#8B0000" fillOpacity="0.18" stroke="#8B0000" strokeWidth="2" strokeLinejoin="round" />
      {/* Data dots */}
      {topics.map((t, i) => {
        const p = point(i, (t.score / 100) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#8B0000" />;
      })}
      {/* Labels */}
      {topics.map((t, i) => {
        const p = point(i, r + 18);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="text-[11px]" fontSize="11" fill="#666" fontFamily="Inter, sans-serif">
            {t.name}
          </text>
        );
      })}
    </svg>
  );
}

// SVG bar chart for weekly study time
function BarChart({ data, current }: { data: { day: string; hours: number }[]; current: string }) {
  const maxH = Math.max(...data.map(d => d.hours), 1);
  const BAR_H = 80;
  return (
    <div className="flex items-end gap-2 h-24 px-1">
      {data.map((d) => {
        const h = (d.hours / maxH) * BAR_H;
        const isToday = d.day === current;
        return (
          <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={"w-full rounded-t-sm transition-all " + (isToday ? "bg-[#8B0000]" : "bg-[#e8c5c5]")}
              style={{ height: Math.max(h, 4) + "px" }}
            />
            <span className="text-[10px] text-[#888]">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsView({ language: langProp }: AnalyticsViewProps) {
  const { language } = useLanguage();
  const isKo = language === "ko" || langProp === "ko";

  const topics = [
    { name: isKo ? "반응 메커니즘" : "Mechanisms",     score: 80 },
    { name: isKo ? "열역학 개념" : "Thermo-\ndynamics", score: 65 },
    { name: isKo ? "입체화학" : "Stereo-\nchemistry", score: 42 },
    { name: isKo ? "분광학 분석" : "Spectro-\nscopy", score: 55 },
    { name: isKo ? "화합물 명명법" : "Nomen-\nclature", score: 70 },
  ];
  
  const weeklyData = [
    { day: isKo ? "월" : "Mon", hours: 1.5 },
    { day: isKo ? "화" : "Tue", hours: 2.5 },
    { day: isKo ? "수" : "Wed", hours: 1.0 },
    { day: isKo ? "목" : "Thu", hours: 2.2 },
    { day: isKo ? "금" : "Fri", hours: 1.8 },
    { day: isKo ? "토" : "Sat", hours: 3.5 },
    { day: isKo ? "일" : "Sun", hours: 2.0 },
  ];
  
  const reviewNext = [
    { topic: isKo ? "입체화학 (Stereochemistry)" : "Stereochemistry", pct: 42 },
    { topic: isKo ? "분광학 구조분석 (Spectroscopy)" : "Spectroscopy",    pct: 55 },
    { topic: isKo ? "열역학 반응 속도 (Thermodynamics)" : "Thermodynamics",  pct: 61 },
  ];

  const daysKo = ["일","월","화","수","목","금","토"];
  const daysEn = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = isKo ? daysKo[new Date().getDay()] : daysEn[new Date().getDay()];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f1] px-3.5 sm:px-6 md:px-10 py-5 sm:py-7 pb-20 lg:pb-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">
            {isKo ? "학습 성취도 분석" : "Learning Analytics"}
          </h1>
          <p className="text-[13px] text-[#888] mt-0.5">
            {isKo ? "유기화학 301 · 오늘 업데이트됨" : "Organic Chemistry 301 · updated today"}
          </p>
        </div>
        <div className="ws-card px-4 py-3 text-right shrink-0 hidden sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-0.5">
            {isKo ? "시험 준비도" : "Exam Readiness"}
          </p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[24px] font-bold text-[#111]">78%</span>
            <div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-green-500"><polyline points="2,12 6,6 10,9 14,3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p className="text-[10px] text-green-600 font-semibold">+8%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar chart card */}
        <div className="ws-card p-5">
          <p className="text-[13.5px] font-semibold text-[#111] mb-4">
            {isKo ? "단원별 이해도 (레이더)" : "Topic mastery"}
          </p>
          <RadarChart topics={topics} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Bar chart */}
          <div className="ws-card p-5">
            <p className="text-[13.5px] font-semibold text-[#111] mb-4">
              {isKo ? "이번 주 일별 학습 시간 (시간)" : "Study time this week"}
            </p>
            <BarChart data={weeklyData} current={today} />
          </div>

          {/* What to review next */}
          <div className="ws-card p-5">
            <p className="text-[13.5px] font-semibold text-[#111] mb-4">
              {isKo ? "우선 복습 추천 단원" : "What to review next"}
            </p>
            <div className="space-y-3.5">
              {reviewNext.map((item) => (
                <div key={item.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-[#111]">{item.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#888]">{item.pct}%</span>
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[#bbb]"><polyline points="5,3 11,8 5,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#f0ede8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8B0000] rounded-full" style={{ width: item.pct + "%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

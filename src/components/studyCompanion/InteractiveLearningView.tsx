import React, { useRef, useEffect, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Layers, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function InteractiveLearningView({ language: langProp }: { language?: string }) {
  const { language } = useLanguage();
  const isKo = language === "ko" || langProp === "ko";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 20, y: 30 });
  const [dragging, setDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeAtom, setActiveAtom] = useState<number | null>(null);

  // Toluene molecule: benzene ring + methyl group
  const atoms = [
    // Benzene ring (carbon)
    { x: 0,   y: -1.4, z: 0,   element: "C", label: "C1" },
    { x: 1.2, y: -0.7, z: 0,   element: "C", label: "C2" },
    { x: 1.2, y:  0.7, z: 0,   element: "C", label: "C3" },
    { x: 0,   y:  1.4, z: 0,   element: "C", label: "C4" },
    { x: -1.2,y:  0.7, z: 0,   element: "C", label: "C5" },
    { x: -1.2,y: -0.7, z: 0,   element: "C", label: "C6" },
    // Methyl group
    { x: 0,   y: -2.7, z: 0,   element: "C", label: "CH3" },
    // Hydrogens on ring
    { x: 2.1, y: -1.25,z: 0,   element: "H", label: "H" },
    { x: 2.1, y:  1.25,z: 0,   element: "H", label: "H" },
    { x: 0,   y:  2.5, z: 0,   element: "H", label: "H" },
    { x: -2.1,y:  1.25,z: 0,   element: "H", label: "H" },
    { x: -2.1,y: -1.25,z: 0,   element: "H", label: "H" },
    // Methyl hydrogens
    { x: 0.9, y: -3.3, z: 0,   element: "H", label: "H" },
    { x: -0.9,y: -3.3, z: 0,   element: "H", label: "H" },
    { x: 0,   y: -3.4, z: 0.9, element: "H", label: "H" },
  ];
  const bonds = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,0], // ring
    [0,6], // methyl
    [1,7],[2,8],[3,9],[4,10],[5,11], // H on ring
    [6,12],[6,13],[6,14], // methyl H
  ];

  const COLORS: Record<string, string> = { C: "#555", H: "#ddd" };
  const RADII: Record<string, number> = { C: 22, H: 12 };

  const project3D = (x: number, y: number, z: number, rx: number, ry: number, sc: number) => {
    const cosX = Math.cos((rx * Math.PI) / 180);
    const sinX = Math.sin((rx * Math.PI) / 180);
    const cosY = Math.cos((ry * Math.PI) / 180);
    const sinY = Math.sin((ry * Math.PI) / 180);
    // Rotate Y
    const x1 = cosY * x + sinY * z;
    const z1 = -sinY * x + cosY * z;
    // Rotate X
    const y2 = cosX * y - sinX * z1;
    const z2 = sinX * y + cosX * z1;
    const scale = 400 / (400 + z2 * 20);
    return { px: x1 * sc * scale, py: y2 * sc * scale, depth: z2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const sc = 55 * zoom;
    const cx = W / 2, cy = H / 2;
    const projected = atoms.map(a => ({ ...project3D(a.x, a.y, a.z, rotation.x, rotation.y, sc), ...a }));
    // Sort by depth
    const sorted = [...projected].sort((a, b) => a.depth - b.depth);
    // Draw bonds
    bonds.forEach(([i, j]) => {
      const a = projected[i], b = projected[j];
      ctx.beginPath();
      ctx.moveTo(cx + a.px, cy + a.py);
      ctx.lineTo(cx + b.px, cy + b.py);
      ctx.strokeStyle = "#bbb";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
    // Draw atoms
    sorted.forEach(a => {
      const r = RADII[a.element] * zoom;
      const isActive = a.label === atoms[activeAtom ?? -1]?.label;
      const grad = ctx.createRadialGradient(cx + a.px - r * 0.3, cy + a.py - r * 0.3, r * 0.1, cx + a.px, cy + a.py, r);
      const baseColor = COLORS[a.element] || "#aaa";
      grad.addColorStop(0, isActive ? "#8B0000" : lighten(baseColor));
      grad.addColorStop(1, isActive ? "#6d0000" : baseColor);
      ctx.beginPath();
      ctx.arc(cx + a.px, cy + a.py, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      if (a.element === "C") {
        ctx.fillStyle = "#fff";
        ctx.font = "bold " + Math.max(8, Math.round(10 * zoom)) + "px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("C", cx + a.px, cy + a.py);
      }
    });
    // Annotation dots
    [[0, "1"], [6, "2"]].forEach(([idx, label]) => {
      const a = projected[idx as number];
      const dotX = cx + a.px + 18 * zoom;
      const dotY = cy + a.py - 18 * zoom;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#8B0000";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label as string, dotX, dotY);
    });
  }, [rotation, zoom, activeAtom]);

  function lighten(hex: string) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((n >> 16) & 0xff) + 60);
    const g = Math.min(255, ((n >> 8) & 0xff) + 60);
    const b = Math.min(255, (n & 0xff) + 60);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setRotation(r => ({
      x: r.x + (e.clientY - lastMouse.y) * 0.5,
      y: r.y + (e.clientX - lastMouse.x) * 0.5,
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setDragging(false);

  // Touch support
  const touchStart = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    setRotation(r => ({ x: r.x + dy * 0.5, y: r.y + dx * 0.5 }));
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f1] px-3.5 md:px-6 py-5 md:py-7 pb-20 lg:pb-7">
      {/* Header */}
      <div className="mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8B0000] text-white text-[10px] font-bold uppercase tracking-widest mb-3">
          {isKo ? "대표 혁신 기능" : "Flagship Feature"}
        </span>
        <h1 className="text-[26px] font-bold text-[#111] tracking-tight">
          {isKo ? "3D 인터랙티브 학습" : "Interactive 3D Learning"}
        </h1>
        <p className="text-[13px] text-[#888] mt-0.5">
          {isKo ? "스톡 모델이 아닌, 내 수업 강의 노트 도판에서 자동 생성된 3D 분자 구조" : "Generated automatically from your own notes — not a stock model"}
        </p>
        <p className="text-[11px] font-semibold text-[#8B0000] uppercase tracking-wider mt-1">
          {isKo ? "4단원 12페이지 도판 기반 추출" : "Generated From Ch.4, Slide 12"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-3 mt-4">
        {/* Left: 2D sketch panel */}
        <div className="ws-card p-4">
          <p className="text-[12px] font-semibold text-[#888] mb-2">{isKo ? "4단원 12페이지" : "Ch.4, Slide 12"}</p>
          <div className="bg-[#f7f4f0] border border-[#e8e5e0] rounded-xl h-36 flex items-center justify-center mb-3">
            <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#888]">
              <polygon points="40,12 58,22 58,42 40,52 22,42 22,22" fill="none" stroke="#888" strokeWidth="2"/>
              <line x1="40" y1="52" x2="40" y2="68" stroke="#888" strokeWidth="2"/>
              <text x="40" y="78" textAnchor="middle" fontSize="8" fill="#888">{isKo ? "2D 골격 구조식" : "2D skeletal sketch"}</text>
            </svg>
          </div>
          <div className="flex items-center gap-2 bg-[#f5f4f1] rounded-lg px-3 py-1.5 mb-3">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[#8B0000]"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="8" y1="5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="11" y1="8" x2="5" y2="8" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span className="text-[11px] text-[#888]">{isKo ? "출처: 4단원 강의 슬라이드" : "Source: your Ch.4 slides"}</span>
          </div>
          <p className="text-[11.5px] text-[#666] leading-relaxed">
            {isKo
              ? "PreplitAI가 결합 기하 구조를 재구성하여 회전 및 조작 가능한 3D 모델을 자동 생성합니다."
              : "PreplitAI reconstructs bond geometry and renders an explorable 3D model automatically."}
          </p>
        </div>

        {/* Center: 3D viewer */}
        <div className="ws-card p-3 flex flex-col items-center">
          <div className="flex gap-2 mb-2 self-start">
            {[
              { Icon: RotateCcw, title: isKo ? "회전 초기화" : "Rotate", action: () => setRotation({ x: 20, y: 30 }) },
              { Icon: ZoomIn,    title: isKo ? "확대" : "Zoom In",  action: () => setZoom(z => Math.min(z + 0.2, 2.5)) },
              { Icon: ZoomOut,   title: isKo ? "축소" : "Zoom Out", action: () => setZoom(z => Math.max(z - 0.2, 0.4)) },
              { Icon: Layers,    title: isKo ? "레이어" : "Layers",   action: () => {} },
              { Icon: RefreshCw, title: isKo ? "리셋" : "Reset",    action: () => { setRotation({ x: 20, y: 30 }); setZoom(1); } },
            ].map(({ Icon, title, action }) => (
              <button key={title} onClick={action} title={title}
                className="w-7 h-7 rounded-lg border border-[#e8e5e0] bg-[#f7f4f0] hover:border-[#8B0000]/30 flex items-center justify-center text-[#666] hover:text-[#8B0000] transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            width={400} height={300}
            className="w-full rounded-xl cursor-grab active:cursor-grabbing bg-white border border-[#f0ede8]"
            style={{ maxHeight: 300 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          />
          <p className="text-[11px] text-[#aaa] mt-2">
            {isKo ? "드래그: 회전 · 스크롤: 확대/축소 · 원자 클릭: 상세 정보" : "Drag to rotate · Scroll to zoom · Click an atom"}
          </p>
        </div>

        {/* Right: Key facts */}
        <div className="ws-card p-4">
          <p className="text-[12px] font-semibold text-[#888] mb-1">{isKo ? "핵심 분자 정보" : "Key Facts"}</p>
          <h3 className="text-[18px] font-bold text-[#111]">Toluene (톨루엔)</h3>
          <p className="text-[12px] text-[#888] mb-4">C₇H₈ · methylbenzene</p>
          {[
            { label: isKo ? "몰 질량" : "Molar Mass",     value: "92.14 g/mol" },
            { label: isKo ? "작용기" : "Functional Group", value: isKo ? "방향족 고리 + 메틸기" : "Aromatic ring + methyl" },
            { label: isKo ? "고리 유형" : "Ring Type",       value: isKo ? "벤젠 유도체" : "Benzene derivative" },
          ].map(f => (
            <div key={f.label} className="mb-3">
              <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">{f.label}</p>
              <p className="text-[13px] font-semibold text-[#111]">{f.value}</p>
            </div>
          ))}
          <div className="bg-[#fdf0f0] border border-[#f5d0d0] rounded-xl p-3 mb-4">
            <p className="text-[11.5px] text-[#8B0000] leading-relaxed font-medium">
              {isKo
                ? "시험 출제 포인트: 한 교수님 4단원 과제 6개 문제 중 3개 치환 반응 예시에 해당 벤젠 고리가 출제되었습니다."
                : "Why it's on your midterm: Prof. Han's Ch.4 problem set uses this ring system in 3 of 6 substitution examples."}
            </p>
          </div>
          <p className="text-[10.5px] text-[#aaa] mb-4">📍 {isKo ? "출처: 4단원 강의 슬라이드 12p" : "Source: your Ch.4 slides, p.12"}</p>
          <div className="flex flex-col gap-2">
            <button className="w-full py-2 rounded-xl bg-[#8B0000] hover:bg-[#6d0000] text-white text-[13px] font-semibold transition-colors">
              {isKo ? "이 단원 퀴즈 풀기" : "Quiz me"}
            </button>
            <button className="w-full py-2 rounded-xl border border-[#e8e5e0] text-[#111] text-[13px] font-semibold hover:bg-[#f5f4f1] transition-colors">
              {isKo ? "암기 카드에 추가" : "Add to cards"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

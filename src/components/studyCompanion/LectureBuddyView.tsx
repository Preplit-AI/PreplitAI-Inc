import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Loader2, FileText, Clock, ChevronDown, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ViewState = "idle" | "consent" | "recording" | "processing" | "complete";

interface LectureNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  sections: { heading: string; content: string }[];
  transcript: string;
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface LectureBuddyViewProps {
  spaceId: string;
}

export function LectureBuddyView({ spaceId }: LectureBuddyViewProps) {
  const { language } = useLanguage();
  const { checkDeveloperAccess } = useAuth();
  const isKo = language === "ko";

  const [viewState, setViewState] = useState<ViewState>("idle");
  const [timer, setTimer] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [completedNotes, setCompletedNotes] = useState<LectureNote | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [pastRecordings, setPastRecordings] = useState<LectureNote[]>([]);
  const [viewingPast, setViewingPast] = useState<LectureNote | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleStartClick = () => {
    if (!checkDeveloperAccess(isKo ? "AI 강의 녹음" : "AI Lecture Buddy", isKo)) return;
    setViewState("consent");
  };

  const handleConsentConfirm = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000); // collect chunks every second

      setTimer(0);
      setViewState("recording");
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch {
      toast.error(isKo ? "마이크 접근 권한이 필요합니다." : "Microphone access is required.");
      setViewState("idle");
    }
  };

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    const recordedDuration = timer;
    setViewState("processing");
    setProcessingProgress(0);

    // Simulate async processing (matches podcast/video pattern)
    const stages = isKo
      ? ["오디오 업로드 중...", "음성 인식 중 (한국어/영어 코드 스위칭)...", "강의 노트 생성 중...", "RAG 파이프라인에 임베딩 중..."]
      : ["Uploading audio...", "Transcribing speech (Korean/English code-switching)...", "Generating structured notes...", "Embedding into RAG pipeline..."];

    let progress = 0;
    let stageIndex = 0;
    setProcessingStage(stages[0]);

    const interval = setInterval(() => {
      progress += Math.random() * 4 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,"0")}-${now.getDate().toString().padStart(2,"0")}`;
        const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

        const demoNote: LectureNote = {
          id: `lr_${Date.now()}`,
          title: isKo ? `강의 녹음 · ${dateStr}` : `Lecture Recording · ${dateStr}`,
          date: `${dateStr} ${timeStr}`,
          duration: formatTimer(recordedDuration),
          sections: isKo ? [
            { heading: "강의 개요", content: "본 강의에서는 유기화학의 핵심 반응 메커니즘을 다루었습니다. 교수님은 SN1과 SN2 반응의 차이점을 중심으로 설명하셨으며, 각 반응의 속도론적 특성을 비교하셨습니다." },
            { heading: "핵심 정의", content: "**친핵체 (Nucleophile)**: 전자 밀도가 높은 화학종으로, 전자가 부족한 탄소를 공격합니다.\n\n**이탈기 (Leaving Group)**: 결합 전자쌍을 가지고 떠나는 원자 또는 원자단입니다.\n\n**전이 상태 (Transition State)**: 반응물에서 생성물로 전환되는 과정에서의 최고 에너지 구조입니다." },
            { heading: "SN1 반응 메커니즘", content: "교수님은 SN1 반응이 2단계로 진행된다고 설명하셨습니다:\n1. 이탈기의 해리 (율속 단계)\n2. 친핵체의 공격\n\n> 반응 속도 = k[기질] (1차 반응)\n\n3차 탄소에서 가장 잘 일어나며, 극성 양성자성 용매에서 유리합니다." },
            { heading: "SN2 반응 메커니즘", content: "SN2 반응은 단일 단계 협동 메커니즘입니다:\n- 친핵체 공격과 이탈기 이탈이 동시에 발생\n- Walden 반전 (입체화학 반전) 발생\n\n> 반응 속도 = k[기질][친핵체] (2차 반응)\n\n1차 탄소에서 가장 잘 일어나며, 입체 장애가 적을수록 유리합니다." },
            { heading: "[불명확 구간]", content: "약 32:15~33:40 구간에서 오디오 품질이 낮아 정확한 내용을 파악하기 어렵습니다. 교수님이 E1 반응과의 경쟁에 대해 언급하신 것으로 보이나, 구체적인 내용은 확인이 필요합니다." },
            { heading: "시험 출제 힌트", content: "교수님은 \"SN1과 SN2의 비교는 반드시 시험에 나온다\"고 강조하셨습니다. 특히 용매 효과와 기질 구조에 따른 반응 경로 예측이 중요하다고 하셨습니다." },
          ] : [
            { heading: "Lecture Overview", content: "This lecture covered the core reaction mechanisms in organic chemistry. The professor focused on the differences between SN1 and SN2 reactions, comparing the kinetic characteristics of each reaction pathway." },
            { heading: "Key Definitions", content: "**Nucleophile**: A chemical species with high electron density that attacks electron-deficient carbon atoms.\n\n**Leaving Group**: An atom or group that departs with the bonding electron pair.\n\n**Transition State**: The highest-energy structure during the conversion from reactants to products." },
            { heading: "SN1 Reaction Mechanism", content: "The professor explained that SN1 proceeds in two steps:\n1. Dissociation of the leaving group (rate-determining step)\n2. Nucleophilic attack\n\n> Rate = k[substrate] (first-order kinetics)\n\nFavored at tertiary carbons and in polar protic solvents." },
            { heading: "SN2 Reaction Mechanism", content: "SN2 is a single-step concerted mechanism:\n- Nucleophilic attack and leaving group departure occur simultaneously\n- Results in Walden inversion (stereochemical inversion)\n\n> Rate = k[substrate][nucleophile] (second-order kinetics)\n\nFavored at primary carbons with minimal steric hindrance." },
            { heading: "[Inaudible Section]", content: "Audio quality was too low between approximately 32:15–33:40 to produce a reliable transcript. The professor appeared to mention competition with E1 reactions, but specific details could not be confirmed." },
            { heading: "Exam Hints", content: "The professor emphasized that \"comparing SN1 and SN2 will definitely be on the exam.\" Particular attention should be paid to solvent effects and predicting reaction pathways based on substrate structure." },
          ],
          transcript: isKo
            ? "교수님: 자, 오늘은 유기화학에서 가장 중요한 치환 반응에 대해 알아보겠습니다. SN1과 SN2, 이 두 가지 메커니즘을 확실히 이해하셔야 합니다. 먼저 nucleophile, 즉 친핵체의 정의부터 시작하겠습니다...\n\n[00:05:23] 그러면 SN1 반응은 어떤 특징이 있을까요? 첫째, unimolecular입니다. 반응 속도가 기질의 농도에만 의존합니다...\n\n[00:18:45] 이제 SN2로 넘어가겠습니다. SN2는 bimolecular reaction이고, concerted mechanism입니다. 한 단계에서 모든 것이 동시에 일어납니다...\n\n[00:32:15] [불명확 — 오디오 품질 저하]\n\n[00:33:40] ...그래서 이 부분은 시험에 반드시 나옵니다. SN1과 SN2의 비교표를 꼭 정리해두세요."
            : "Professor: Alright, today we're going to look at the most important substitution reactions in organic chemistry. You need to clearly understand these two mechanisms — SN1 and SN2. Let's start with the definition of a nucleophile...\n\n[00:05:23] So what characterizes an SN1 reaction? First, it's unimolecular. The reaction rate depends only on the concentration of the substrate...\n\n[00:18:45] Now let's move on to SN2. SN2 is a bimolecular reaction with a concerted mechanism. Everything happens simultaneously in one step...\n\n[00:32:15] [Inaudible — low audio quality]\n\n[00:33:40] ...so this part will definitely be on the exam. Make sure you have a comparison table of SN1 versus SN2 prepared.",
        };

        setCompletedNotes(demoNote);
        setPastRecordings(prev => [demoNote, ...prev]);
        setViewState("complete");
        toast.success(isKo ? "강의 노트가 생성되었습니다!" : "Lecture notes generated successfully!");
      }

      setProcessingProgress(progress);
      const newStageIndex = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1);
      if (newStageIndex !== stageIndex) {
        stageIndex = newStageIndex;
        setProcessingStage(stages[stageIndex]);
      }
    }, 200);
  }, [timer, isKo]);

  const resetToIdle = () => {
    setViewState("idle");
    setTimer(0);
    setProcessingProgress(0);
    setCompletedNotes(null);
    setShowTranscript(false);
    setExpandedSection(null);
    setViewingPast(null);
  };

  // ── IDLE STATE ──
  if (viewState === "idle" && !viewingPast) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#f5f4f1] px-4 sm:px-6 md:px-8 py-6">
        {/* Hero */}
        <div className="max-w-xl mx-auto text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#550000]/10 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-7 h-7 text-[#550000]" />
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111] tracking-tight mb-2">
            {isKo ? "AI 강의 녹음" : "AI Lecture Buddy"}
          </h1>
          <p className="text-[13.5px] text-[#888] leading-relaxed max-w-md mx-auto">
            {isKo
              ? "강의를 녹음하면 AI가 한국어/영어 혼합 음성을 인식하여 구조화된 강의 노트를 자동 생성합니다. 생성된 노트는 채팅, 퀴즈, 플래시카드에서 바로 활용됩니다."
              : "Record your lecture and AI will transcribe Korean/English code-switching audio into structured, grounded notes. Generated notes integrate instantly with chat, quizzes, and flashcards."}
          </p>
          <button
            onClick={handleStartClick}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#550000] hover:bg-[#3b0000] text-white rounded-2xl text-[14px] font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Mic className="w-4 h-4" />
            {isKo ? "강의 녹음 시작" : "Start Lecture Buddy"}
          </button>
        </div>

        {/* Past Recordings */}
        {pastRecordings.length > 0 && (
          <div className="max-w-2xl mx-auto w-full">
            <p className="text-[11.5px] font-bold text-[#888] uppercase tracking-wider mb-2">
              {isKo ? "이전 강의 녹음" : "Past Recordings"}
            </p>
            <div className="space-y-2">
              {pastRecordings.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setViewingPast(rec)}
                  className="ws-card w-full text-left p-4 hover:shadow-md hover:border-[#d0cbc4] transition-all flex items-center gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f7f4f0] border border-[#e8e5e0] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#550000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111] truncate">{rec.title}</p>
                    <p className="text-[11.5px] text-[#888]">{rec.date} · {rec.duration}</p>
                  </div>
                  <span className="text-[11px] font-medium text-[#550000] bg-[#550000]/5 px-2.5 py-1 rounded-full shrink-0">
                    {isKo ? "노트 보기" : "View Notes"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CONSENT MODAL ──
  if (viewState === "consent") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1] px-4">
        <div className="bg-white border border-[#e8e5e0] rounded-2xl w-full max-w-md shadow-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#111]">
                {isKo ? "녹음 동의 확인" : "Recording Consent Required"}
              </h2>
              <p className="text-[12.5px] text-[#888] mt-0.5">
                {isKo ? "녹음을 시작하기 전에 확인해주세요" : "Please confirm before recording begins"}
              </p>
            </div>
          </div>
          <div className="bg-[#f7f4f0] border border-[#e8e5e0] rounded-xl p-4 mb-5">
            <p className="text-[13px] text-[#444] leading-relaxed">
              {isKo
                ? "AI 강의 녹음은 기기 마이크로 오디오를 녹음합니다. 계속 진행하면 녹음되는 모든 관계자의 동의를 얻었으며, 관련 법률을 준수함을 확인하는 것입니다. 녹음된 원본 오디오는 텍스트 변환 완료 후 자동 삭제됩니다."
                : "AI Lecture Buddy will record audio from your device microphone. By continuing, you confirm that you have obtained consent from all parties being recorded, as required by applicable laws. Raw audio is automatically deleted after transcription completes."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewState("idle")}
              className="flex-1 py-2.5 border border-[#e8e5e0] rounded-xl text-[13px] font-semibold text-[#666] hover:bg-[#f5f4f1] transition-colors"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
            <button
              onClick={handleConsentConfirm}
              className="flex-1 py-2.5 bg-[#550000] hover:bg-[#3b0000] text-white rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              {isKo ? "확인 — 녹음 시작" : "I Confirm — Start Recording"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RECORDING STATE ──
  if (viewState === "recording") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1] px-4">
        <div className="text-center max-w-sm">
          {/* Pulsing dot + Timer */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-[12px] font-semibold text-red-600 uppercase tracking-wider">
                {isKo ? "녹음 중" : "Recording"}
              </span>
            </div>
            <p className="text-[48px] sm:text-[56px] font-mono font-bold text-[#111] tracking-tight tabular-nums">
              {formatTimer(timer)}
            </p>
          </div>

          {/* Waveform bars */}
          <div className="flex items-center justify-center gap-[3px] mb-8 h-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-[#550000]"
                style={{
                  height: `${12 + Math.random() * 28}px`,
                  animation: `pulse ${0.4 + Math.random() * 0.6}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Stop button */}
          <button
            onClick={handleStopRecording}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#111] hover:bg-black text-white rounded-2xl text-[14px] font-semibold transition-all hover:shadow-lg"
          >
            <Square className="w-4 h-4" fill="currentColor" />
            {isKo ? "녹음 종료" : "End Recording"}
          </button>
          <p className="text-[11.5px] text-[#999] mt-3">
            {isKo ? "최대 2시간까지 녹음 가능합니다" : "Sessions up to 2 hours supported"}
          </p>
        </div>
      </div>
    );
  }

  // ── PROCESSING STATE ──
  if (viewState === "processing") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1] px-4">
        <div className="text-center max-w-sm">
          <Loader2 className="w-10 h-10 text-[#550000] animate-spin mx-auto mb-5" />
          <h2 className="text-[18px] font-bold text-[#111] mb-2">
            {isKo ? "강의를 처리 중입니다" : "Processing your lecture"}
          </h2>
          <p className="text-[13px] text-[#888] mb-6">{processingStage}</p>
          <div className="w-full bg-[#e8e5e0] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#550000] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-[11.5px] text-[#bbb] mt-2">{Math.round(processingProgress)}%</p>
        </div>
      </div>
    );
  }

  // ── COMPLETE / NOTES VIEW ──
  const notesToShow = viewingPast || completedNotes;
  if ((viewState === "complete" || viewingPast) && notesToShow) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#f5f4f1] px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111] tracking-tight">{notesToShow.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[11.5px] text-[#888]">
                    <Clock className="w-3 h-3" /> {notesToShow.duration}
                  </span>
                  <span className="text-[11.5px] text-[#888]">{notesToShow.date}</span>
                </div>
              </div>
            </div>
            <button
              onClick={resetToIdle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#550000] bg-[#550000]/5 hover:bg-[#550000]/10 rounded-lg transition-colors"
            >
              {viewingPast ? (isKo ? "목록으로" : "Back") : (isKo ? "새 녹음" : "New Recording")}
            </button>
          </div>

          {/* Notes Sections */}
          <div className="space-y-2 mb-6">
            {notesToShow.sections.map((section, i) => {
              const isOpen = expandedSection === i;
              const isInaudible = section.heading.includes("[") && (section.heading.includes("불명확") || section.heading.includes("Inaudible"));
              return (
                <div key={i} className={`ws-card overflow-hidden ${isInaudible ? "border-amber-200 bg-amber-50/30" : ""}`}>
                  <button
                    onClick={() => setExpandedSection(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isInaudible && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span className={`text-[13.5px] font-semibold truncate ${isInaudible ? "text-amber-700" : "text-[#111]"}`}>
                        {section.heading}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[#bbb] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-4 pb-4 border-t border-[#e8e5e0]">
                      <div className="pt-3 text-[13px] text-[#444] leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transcript Toggle */}
          <div className="ws-card overflow-hidden">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-[13px] font-semibold text-[#888]">
                {isKo ? "원본 녹취록 보기" : "View Raw Transcript"}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 text-[#bbb] transition-transform duration-200 ${showTranscript ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${showTranscript ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 border-t border-[#e8e5e0]">
                <pre className="pt-3 text-[12.5px] text-[#666] leading-relaxed whitespace-pre-wrap font-sans">
                  {notesToShow.transcript}
                </pre>
              </div>
            </div>
          </div>

          {/* Citation Badge */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[12px] text-emerald-700 font-medium">
              {isKo
                ? "이 강의 노트는 RAG 파이프라인에 임베딩되었습니다. AI 채팅, 퀴즈, 플래시카드에서 \"강의 녹음\" 소스로 인용됩니다."
                : "These notes are embedded in the RAG pipeline. Chat, quizzes, and flashcards can now cite \"Lecture Recording\" as a source."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

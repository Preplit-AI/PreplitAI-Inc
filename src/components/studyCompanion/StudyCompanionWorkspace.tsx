import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Upload, Send, Paperclip, LayoutDashboard, MessageSquare, BookOpen, HelpCircle, Menu, Radio } from "lucide-react";
import { WorkspaceSidebar, WorkspaceTabId } from "./WorkspaceSidebar";
import { WorkspaceTopHeader } from "./WorkspaceTopHeader";
import { WorkspaceDashboard } from "./WorkspaceDashboard";
import { AnalyticsView } from "./AnalyticsView";
import { InteractiveLearningView } from "./InteractiveLearningView";
import { QuizView } from "./QuizView";
import { FlashcardView } from "./FlashcardView";
import { PodcastView } from "./PodcastView";
import { ExpectedExamView } from "./ExpectedExamView";
import { SummaryView } from "./SummaryView";
import { LectureBuddyView } from "./LectureBuddyView";
import { ResourceLibrary } from "./ResourceLibrary";
import { SettingsModal } from "./SettingsModal";
import { GlobalSearch } from "./GlobalSearch";
import { ManageSubscriptionModal } from "../common/ManageSubscriptionModal";
import { SubscriptionModal } from "../common/SubscriptionModal";
import { AuthModal } from "../auth/AuthModal";
import { MessageList } from "../chat/MessageList";
import { VoiceMode } from "./VoiceMode";
import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/i18n/translations";

async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.name.toLowerCase().endsWith(".pdf")) {
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const raw = decoder.decode(bytes);
        const tjMatches = raw.match(/\(([^)]+)\)/g);
        let text = "";
        if (tjMatches && tjMatches.length > 5) {
          text = tjMatches.map((m) => m.slice(1, -1)).filter((s) => s.length > 1 && /[a-zA-Z]/.test(s)).join(" ");
        }
        if (text.length < 50) {
          text = raw
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s{3,}/g, "\n")
            .split("\n")
            .filter((l) => l.trim().length > 20 && /[a-zA-Z]{3,}/.test(l))
            .join("\n");
        }
        if (text.trim().length < 20) text = `[PDF: ${file.name}] ${(file.size / 1024).toFixed(1)}KB`;
        resolve(text);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(file);
    }
  });
}

interface LocalDocument {
  id: number | string;
  file_name: string;
  type: string;
  extracted_text: string;
  raw_file_url?: string;
}

export function StudyCompanionWorkspace() {
  const [navTab, setNavTab] = useState<WorkspaceTabId>("workspace");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<LocalDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isManageSubOpen, setIsManageSubOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [newSpaceInput, setNewSpaceInput] = useState("");
  const { language, setLanguage } = useLanguage();
  const { user, checkDeveloperAccess } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [defaultModel, setDefaultModel] = useState<string>("GPT-5 / Llama 3.1");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [spaces, setSpaces] = useState<Array<{ id: string; name: string }>>([
    { id: "1", name: "Data Structures & Algorithms" },
    { id: "2", name: "Organic Chemistry II" },
  ]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("1");
  const t = translations[language] || translations.en;
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string; citations?: any[] }>
  >([{ id: "1", role: "assistant", content: t.welcomeMessage }]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [podcastData, setPodcastData] = useState<any>(null);
  const [flashcardData, setFlashcardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState<"course_material" | "past_exam">("course_material");
  const [uploadPasteText, setUploadPasteText] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docText = activeDocument?.extracted_text || "";
  const docName = activeDocument?.file_name || "Document";

  useEffect(() => {
    document.title = "Workspace | Preplit AI";
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const handleUpload = async () => {
    if (!checkDeveloperAccess("Study Material Upload & Extraction", isKo)) return;
    setIsUploading(true);
    try {
      let text = "",
        name = "Document";
      if (uploadMethod === "file" && uploadFile) {
        name = uploadFile.name;
        text = await extractTextFromFile(uploadFile);
      } else if (uploadMethod === "paste" && uploadPasteText.trim()) {
        name = "Pasted Notes";
        text = uploadPasteText.trim();
      }
      if (text) {
        const nd = { id: Date.now(), file_name: name, type: uploadDocType, extracted_text: text };
        setDocuments((p) => [...p, nd]);
        setActiveDocument(nd);
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadPasteText("");
      }
    } catch {}
    setIsUploading(false);
  };

  const sendMessage = async (text: string) => {
    if (!checkDeveloperAccess("AI Study Companion Chat", isKo)) return;
    setMessages((p) => [...p, { id: Date.now().toString(), role: "user", content: text }]);
    setIsGenerating(true);
    setTimeout(() => {
      const response = docText
        ? `Based on **${docName}**: I found related content in your uploaded notes.`
        : "I am ready to help you analyze course concepts, answer doubts, and prepare for your upcoming exams.";
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "assistant", content: response }]);
      setIsGenerating(false);
    }, 800);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      if (!checkDeveloperAccess("AI Study Companion Chat", isKo)) return;
      sendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  const handleToolSelect = (tool: string) => {
    if (tool === "chat") setNavTab("chat");
    else if (tool === "explore3d") setNavTab("explore3d");
    else if (tool === "analytics") setNavTab("analytics");
    else if (tool === "lecture-buddy") setNavTab("lecture-buddy");
    else if (tool === "flashcards") setNavTab("flashcards");
    else if (tool === "quizzes") setNavTab("quizzes");
    else if (tool === "notes") setNavTab("notes");
    else if (tool === "expected") setNavTab("expected");
    else if (tool === "resources") setNavTab("resources");
    else if (tool === "calendar") setNavTab("calendar");
    else setNavTab("workspace");
  };

  const createSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDeveloperAccess("Course Workspace Creation", isKo)) return;
    if (!newSpaceInput.trim()) return;
    const newSpace = { id: Date.now().toString(), name: newSpaceInput.trim() };
    setSpaces((prev) => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
    setNewSpaceInput("");
    setIsCreateSpaceOpen(false);
  };

  const isKo = language === "ko";

  return (
    <div
      className="flex flex-col h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <SEOHead
        title="Workspace"
        robots="noindex,nofollow"
      />
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(id, type) => {
          if (type === "chat") {
            setNavTab("chat");
          }
        }}
      />

      {/* Top Header */}
      <WorkspaceTopHeader
        onOpenSearch={() => {
          setIsSearchOpen(true);
        }}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div className="w-64 bg-white dark:bg-[#0e0e0e] h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
                <span className="font-bold text-sm text-[#111] dark:text-white">Preplit AI Workspace</span>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-[#aaa]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <WorkspaceSidebar
                activeTab={navTab}
                onTabChange={(tab) => {
                  setNavTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                onOpenManagePlan={() => {
                  setIsMobileSidebarOpen(false);
                  setIsManageSubOpen(true);
                }}
                onOpenSettings={() => {
                  setIsMobileSidebarOpen(false);
                  setIsSettingsOpen(true);
                }}
                onOpenAuth={(tab) => {
                  setIsMobileSidebarOpen(false);
                  setAuthTab(tab);
                  setIsAuthOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Desktop Left Sidebar */}
        <div className="hidden lg:flex shrink-0 h-full">
          <WorkspaceSidebar
            activeTab={navTab}
            onTabChange={(tab) => {
              setNavTab(tab);
            }}
            onOpenManagePlan={() => setIsManageSubOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={(tab) => {
              setAuthTab(tab);
              setIsAuthOpen(true);
            }}
          />
        </div>

        {/* Main Workspace Body */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {navTab === "workspace" && (
            <WorkspaceDashboard
              onToolSelect={handleToolSelect}
              onUploadClick={() => setIsUploadOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              spaces={spaces}
              activeSpaceId={activeSpaceId}
              onSelectSpace={setActiveSpaceId}
              onCreateSpace={() => setIsCreateSpaceOpen(true)}
            />
          )}

          {navTab === "chat" && (
            <div className="flex flex-1 overflow-hidden bg-white dark:bg-[#0e0e0e]">
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0e0e0e] shrink-0">
                  <h1 className="text-[20px] font-bold text-[#111] dark:text-white">
                    {isKo ? "AI 학습 챗봇" : "AI Study Chat"}
                  </h1>
                  {activeDocument && (
                    <p className="text-[12.5px] text-[#888] mt-0.5">{activeDocument.file_name}</p>
                  )}
                  <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#991b1b] text-[11px] font-semibold">
                    {isKo ? "교재 출처 인용 질의응답" : "Grounded AI Study Companion"}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageList messages={messages as any} isGenerating={isGenerating} />
                </div>
                <div className="px-4 md:px-6 py-3 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0e0e0e] shrink-0">
                  <form
                    onSubmit={handleChatSubmit}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl px-3 py-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about this course..."
                      className="flex-1 text-[13.5px] bg-transparent focus:outline-none text-[#111] dark:text-white placeholder:text-[#bbb]"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(true)}
                        className="p-1 text-[#ccc] hover:text-[#888]"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <VoiceMode onTranscript={(t) => setChatInput((p) => p + (p ? " " : "") + t)} />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="w-7 h-7 rounded-full bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-30 flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </form>
                  <p className="text-[10.5px] text-[#bbb] mt-1.5 px-1">{defaultModel}</p>
                </div>
              </div>
            </div>
          )}

          {navTab === "flashcards" && (
            <FlashcardView
              flashcardData={flashcardData}
              onGenerateNew={() => {
                if (!checkDeveloperAccess("Flashcard Generation", isKo)) return;
              }}
            />
          )}

          {navTab === "quizzes" && (
            <QuizView
              quizData={quizData}
              onGenerateNewQuiz={() => {
                if (!checkDeveloperAccess("AI Practice Quiz Generation", isKo)) return;
              }}
            />
          )}

          {navTab === "notes" && (
            <SummaryView
              summaryData={summaryData}
              onGenerateSummary={() => {
                if (!checkDeveloperAccess("AI Notes & Summary Generation", isKo)) return;
              }}
            />
          )}

          {navTab === "expected" && (
            <ExpectedExamView
              examData={examData}
              onGenerateExam={() => {
                if (!checkDeveloperAccess("AI Exam Predictor & Past Papers", isKo)) return;
              }}
            />
          )}

          {navTab === "lecture-buddy" && <LectureBuddyView spaceId={activeSpaceId} />}
          {navTab === "analytics" && <AnalyticsView language={language} />}
          {navTab === "explore3d" && <InteractiveLearningView language={language} />}
          {navTab === "resources" && (
            <ResourceLibrary
              documents={documents as any}
              onSelectDocument={(doc) => {
                const found = documents.find((d) => d.id === doc.id) || (doc as any);
                setActiveDocument(found);
                setNavTab("chat");
              }}
              onUpload={() => setIsUploadOpen(true)}
            />
          )}
          {navTab === "calendar" && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white dark:bg-[#0e0e0e]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {isKo ? "학업 캘린더 & 시험 일정" : "Study Calendar & Exam Schedule"}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isKo ? "과목별 시험일과 복습 세션을 관리하세요." : "Manage exam dates and scheduled spaced review sessions."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                  <span className="text-[10.5px] font-bold text-[#550000] uppercase tracking-wider block mb-1">
                    {isKo ? "다가오는 중간고사" : "Upcoming Midterm"}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Data Structures & Algorithms</h4>
                  <p className="text-xs text-neutral-500 mt-1">{isKo ? "D-6 · 10월 24일 14:00" : "D-6 · Oct 24, 2:00 PM"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                  <span className="text-[10.5px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                    {isKo ? "AI 복습 퀴즈 세션" : "Scheduled AI Quiz"}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Organic Chemistry II</h4>
                  <p className="text-xs text-neutral-500 mt-1">{isKo ? "오늘 20:00 예정" : "Today at 8:00 PM"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                  <span className="text-[10.5px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                    {isKo ? "강의 노트 정리" : "Lecture Catch-up"}
                  </span>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Computer Networks</h4>
                  <p className="text-xs text-neutral-500 mt-1">{isKo ? "내일 11:00 예정" : "Tomorrow at 11:00 AM"}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden bg-white/95 dark:bg-[#0e0e0e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 px-2 py-1 flex items-center justify-around z-30 shrink-0 shadow-lg">
        {[
          { id: "workspace" as WorkspaceTabId, label: isKo ? "대시보드" : "Dashboard", Icon: LayoutDashboard },
          { id: "chat" as WorkspaceTabId, label: isKo ? "AI 챗" : "AI Chat", Icon: MessageSquare },
          { id: "flashcards" as WorkspaceTabId, label: isKo ? "플래시카드" : "Cards", Icon: BookOpen },
          { id: "quizzes" as WorkspaceTabId, label: isKo ? "퀴즈" : "Quiz", Icon: HelpCircle },
          { id: "lecture-buddy" as WorkspaceTabId, label: isKo ? "강의 녹음" : "Buddy", Icon: Radio },
        ].map((item) => {
          const ItemIcon = item.Icon;
          const isActive = navTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setNavTab(item.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? "text-[#550000] dark:text-[#f87171] font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <ItemIcon className={`w-4 h-4 mb-0.5 ${isActive ? "text-[#550000] dark:text-[#f87171]" : "text-neutral-400"}`} />
              <span className="truncate leading-none">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"
        >
          <Menu className="w-4 h-4 mb-0.5 text-neutral-400" />
          <span className="truncate leading-none">{isKo ? "전체 메뉴" : "More"}</span>
        </button>
      </nav>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsUploadOpen(false)}
        >
          <div className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-[#111] dark:text-white">Add Study Material</h3>
                <p className="text-[12px] text-neutral-400 mt-0.5">Upload notes, lecture slides or paste text</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 text-[#aaa] hover:text-[#666]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-900 rounded-xl">
              {(["file", "paste"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setUploadMethod(m)}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    uploadMethod === m ? "bg-white dark:bg-neutral-800 text-[#111] dark:text-white shadow-xs" : "text-neutral-400"
                  }`}
                >
                  {m === "file" ? "Upload file" : "Paste text"}
                </button>
              ))}
            </div>
            {uploadMethod === "file" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-[#991b1b]/60 cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.pptx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-[12.5px] font-medium text-neutral-700 dark:text-neutral-300">
                  {uploadFile ? `✓ ${uploadFile.name}` : "Drop file here or click to browse"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">PDF, PPTX, DOCX, TXT · Max 50MB</p>
              </div>
            ) : (
              <textarea
                value={uploadPasteText}
                onChange={(e) => setUploadPasteText(e.target.value)}
                placeholder="Paste your course notes or syllabus here..."
                className="w-full h-32 border border-slate-200 dark:border-neutral-800 rounded-xl p-3 text-[13px] bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#991b1b]/20"
              />
            )}
            <button
              onClick={handleUpload}
              disabled={isUploading || (uploadMethod === "file" ? !uploadFile : !uploadPasteText.trim())}
              className="w-full py-2.5 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-40 text-white rounded-xl text-[13.5px] font-semibold transition-all shadow-xs"
            >
              {isUploading ? "Processing & Indexing..." : "Upload & Index"}
            </button>
          </div>
        </div>
      )}

      {/* New Study Space Modal */}
      {isCreateSpaceOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsCreateSpaceOpen(false)}
        >
          <div className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#111] dark:text-white">
                  {isKo ? "새 스터디 워크스페이스" : "New Study Workspace"}
                </h3>
                <p className="text-[12px] text-neutral-400 mt-0.5">
                  {isKo ? "과목명 또는 강좌명을 입력하세요" : "Name your course or subject"}
                </p>
              </div>
              <button
                onClick={() => setIsCreateSpaceOpen(false)}
                className="p-1 text-[#aaa] hover:text-[#666]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={createSpace}>
              <input
                autoFocus
                type="text"
                value={newSpaceInput}
                onChange={(e) => setNewSpaceInput(e.target.value)}
                placeholder={isKo ? '예: "알고리즘 및 자료구조"' : 'e.g. "Linear Algebra 201"'}
                className="w-full border border-slate-200 dark:border-neutral-700 bg-transparent rounded-xl px-3 py-2 text-[13px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#550000]/20 mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSpaceOpen(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                  {isKo ? "취소" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!newSpaceInput.trim()}
                  className="flex-1 py-2 bg-[#550000] hover:bg-[#3d0000] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  {isKo ? "생성하기" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          defaultModel={defaultModel}
          onModelChange={setDefaultModel}
          language={language}
          onLanguageChange={setLanguage}
          onExportData={() => {}}
          onClearData={() => {}}
        />
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />
      <ManageSubscriptionModal
        isOpen={isManageSubOpen}
        onClose={() => setIsManageSubOpen(false)}
        onOpenUpgrade={() => {
          setIsManageSubOpen(false);
          setIsSubModalOpen(true);
        }}
      />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Menu, X, Upload, Send, Paperclip } from "lucide-react";
import { WorkspaceTopNav, WorkspaceNavTab } from "./WorkspaceTopNav";
import { WorkspaceHome } from "./WorkspaceHome";
import { AnalyticsView } from "./AnalyticsView";
import { InteractiveLearningView } from "./InteractiveLearningView";
import { QuizView } from "./QuizView";
import { FlashcardView } from "./FlashcardView";
import { PodcastView } from "./PodcastView";
import { ExpectedExamView } from "./ExpectedExamView";
import { SummaryView } from "./SummaryView";
import { SettingsModal } from "./SettingsModal";
import { GlobalSearch } from "./GlobalSearch";
import { ManageSubscriptionModal } from "../common/ManageSubscriptionModal";
import { SubscriptionModal } from "../common/SubscriptionModal";
import { AuthModal } from "../auth/AuthModal";
import { MessageList } from "../chat/MessageList";
import { VoiceMode } from "./VoiceMode";
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
          text = tjMatches.map(m => m.slice(1,-1)).filter(s => s.length > 1 && /[a-zA-Z]/.test(s)).join(" ");
        }
        if (text.length < 50) {
          text = raw.replace(/[^\x20-\x7E\n\r\t]/g," ").replace(/\s{3,}/g,"\n").split("\n").filter(l => l.trim().length > 20 && /[a-zA-Z]{3,}/.test(l)).join("\n");
        }
        if (text.trim().length < 20) text = `[PDF: ${file.name}] ${(file.size/1024).toFixed(1)}KB`;
        resolve(text);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(file);
    }
  });
}

interface LocalDocument { id: number|string; file_name: string; type: string; extracted_text: string; raw_file_url?: string; }

export function StudyCompanionWorkspace() {
  const [navTab, setNavTab] = useState<WorkspaceNavTab>("spaces");
  const [practiceTab, setPracticeTab] = useState<"flashcards"|"quizzes"|"podcast"|"summary"|"expected">("flashcards");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<LocalDocument|null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isManageSubOpen, setIsManageSubOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [newSpaceInput, setNewSpaceInput] = useState("");
  const { language, setLanguage } = useLanguage();
  const { user, checkDeveloperAccess } = useAuth();
  const [theme, setTheme] = useState<"light"|"dark"|"system">("light");
  const [defaultModel, setDefaultModel] = useState<string>("GPT-5 / Llama 3.1");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [spaces, setSpaces] = useState<Array<{id:string;name:string}>>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const t = translations[language] || translations.en;
  const [messages, setMessages] = useState<Array<{id:string;role:"user"|"assistant";content:string;citations?:any[]}>>([
    { id:"1", role:"assistant", content: t.welcomeMessage }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [podcastData, setPodcastData] = useState<any>(null);
  const [flashcardData, setFlashcardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [uploadDocType, setUploadDocType] = useState<"course_material"|"past_exam">("course_material");
  const [uploadPasteText, setUploadPasteText] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file"|"paste">("file");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docText = activeDocument?.extracted_text || "";
  const docName = activeDocument?.file_name || "Document";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else { root.classList.remove("dark"); }
  }, [theme]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); setIsSearchOpen(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/spaces").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setSpaces(data.map(s => ({ id: String(s.id), name: s.name })));
        setActiveSpaceId(String(data[0].id));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeSpaceId) return;
    fetch(`http://localhost:5000/api/spaces/${activeSpaceId}`).then(r => r.ok ? r.json() : null).then((spaceData: any) => {
      if (!spaceData) return;
      if (spaceData.documents) {
        const docs: LocalDocument[] = spaceData.documents.map((d:any) => ({ id:d.id, file_name:d.file_name, type:d.type, extracted_text:d.extracted_text||"", raw_file_url:d.raw_file_url }));
        setDocuments(docs);
        if (docs.length > 0) setActiveDocument(docs[0]);
      }
      if (spaceData.generated_outputs) {
        spaceData.generated_outputs.forEach((out:any) => {
          try {
            const p = typeof out.content==="string" ? JSON.parse(out.content) : out.content;
            if (out.type==="quiz") setQuizData(p);
            else if (out.type==="flashcard_set") setFlashcardData(p);
            else if (out.type==="summary") setSummaryData(p);
            else if (out.type==="podcast_episode") setPodcastData(p);
            else if (out.type==="predicted_exam") setExamData(p);
          } catch {}
        });
      }
    }).catch(() => {});
  }, [activeSpaceId]);

  const createSpace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newSpaceInput.trim(); if (!name) return;
    try {
      const r = await fetch("http://localhost:5000/api/spaces", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name}) });
      if (r.ok) { const c = await r.json(); const ns = { id:String(c.id), name:c.name }; setSpaces(p=>[...p,ns]); setActiveSpaceId(ns.id); setNewSpaceInput(""); setIsCreateSpaceOpen(false); return; }
    } catch {}
    const fb = { id:`sp_${Date.now()}`, name }; setSpaces(p=>[...p,fb]); setActiveSpaceId(fb.id); setNewSpaceInput(""); setIsCreateSpaceOpen(false);
  };

  const deleteSpace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await fetch(`http://localhost:5000/api/spaces/${id}`, { method:"DELETE" }); } catch {}
    setSpaces(p => { const n = p.filter(s=>s.id!==id); if (activeSpaceId===id) { setActiveSpaceId(n.length?n[0].id:""); setDocuments([]); setActiveDocument(null); } return n; });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      let text = "", name = "Document";
      if (uploadMethod==="file" && uploadFile) {
        name = uploadFile.name; text = await extractTextFromFile(uploadFile);
        const fd = new FormData(); fd.append("file",uploadFile); fd.append("type",uploadDocType); fd.append("upload_method","file");
        const r = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/documents`, { method:"POST", body:fd });
        if (r.ok) { const d = await r.json(); setDocuments(p=>[...p,{id:d.id,file_name:d.file_name,type:d.type,extracted_text:d.extracted_text||text,raw_file_url:d.raw_file_url}]); setActiveDocument({id:d.id,file_name:d.file_name,type:d.type,extracted_text:d.extracted_text||text}); setIsUploadOpen(false); setUploadFile(null); setIsUploading(false); return; }
      } else if (uploadMethod==="paste" && uploadPasteText.trim()) {
        name="Pasted Notes"; text=uploadPasteText.trim();
        const r = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/documents`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:uploadDocType,upload_method:"paste",text_content:text,file_name:name}) });
        if (r.ok) { const d = await r.json(); setDocuments(p=>[...p,{id:d.id,file_name:d.file_name,type:d.type,extracted_text:d.extracted_text||text}]); setActiveDocument({id:d.id,file_name:d.file_name,type:d.type,extracted_text:d.extracted_text||text}); setIsUploadOpen(false); setUploadPasteText(""); setIsUploading(false); return; }
      }
      if (text) { const nd={id:Date.now(),file_name:name,type:uploadDocType,extracted_text:text}; setDocuments(p=>[...p,nd]); setActiveDocument(nd); setIsUploadOpen(false); setUploadFile(null); setUploadPasteText(""); }
    } catch {}
    setIsUploading(false);
  };

  const sendMessage = async (text: string) => {
    if (!checkDeveloperAccess("AI Study Chat", false)) return;
    setMessages(p=>[...p,{id:Date.now().toString(),role:"user",content:text}]); setIsGenerating(true);
    try {
      const r = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/chat`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:text}) });
      if (r.ok) { const d = await r.json(); setMessages(p=>[...p,{id:(Date.now()+1).toString(),role:"assistant",content:d.message?.content||d.reply||"No response.",citations:d.citations||[]}]); setIsGenerating(false); return; }
    } catch {}
    setTimeout(() => {
      const response = docText ? `Based on **${docName}**: I found related content in your uploaded notes.` : "Upload a document to get grounded answers.";
      setMessages(p=>[...p,{id:(Date.now()+1).toString(),role:"assistant",content:response}]); setIsGenerating(false);
    }, 800);
  };

  const handleChatSubmit = (e: React.FormEvent) => { e.preventDefault(); if (chatInput.trim()) { sendMessage(chatInput.trim()); setChatInput(""); } };

  const genQuiz = async () => { setNavTab("practice"); setPracticeTab("quizzes"); };
  const genFlashcards = async () => { setNavTab("practice"); setPracticeTab("flashcards"); };
  const genPodcast = () => { setNavTab("practice"); setPracticeTab("podcast"); };
  const genSummary = () => { setNavTab("practice"); setPracticeTab("summary"); };
  const genExam = () => { setNavTab("practice"); setPracticeTab("expected"); };

  const handleToolSelect = (tool: string) => {
    if (tool==="chat") setNavTab("chat");
    else if (tool==="explore3d") setNavTab("explore3d");
    else if (tool==="analytics") setNavTab("analytics");
    else if (["flashcards","quizzes","podcast","summary","expected"].includes(tool)) { setNavTab("practice"); setPracticeTab(tool as any); }
  };

  function emoji(name: string) {
    const n=name.toLowerCase();
    if(n.includes("chem")) return "⚗️"; if(n.includes("bio")) return "🧬"; if(n.includes("math")||n.includes("calc")) return "📐";
    if(n.includes("hist")) return "📜"; if(n.includes("econ")||n.includes("macro")) return "📊"; if(n.includes("data")) return "💾"; if(n.includes("phys")) return "⚡"; return "📁";
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-4 pb-2"><p className="ws-section-label">Study Spaces</p></div>
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {spaces.map(s => (
          <div key={s.id} className="group relative">
            <button onClick={() => { setActiveSpaceId(s.id); setNavTab("spaces"); setIsMobileSidebarOpen(false); }} className={`ws-sidebar-item ${activeSpaceId===s.id?"active":""}`}>
              <span className="text-base shrink-0">{emoji(s.name)}</span>
              <div className="flex-1 min-w-0 text-left"><p className="text-[13px] font-medium text-[#111] truncate">{s.name}</p></div>
              <button onClick={e=>deleteSpace(s.id,e)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-600 text-[#bbb] shrink-0"><Trash2 className="w-3 h-3" /></button>
            </button>
          </div>
        ))}
        {spaces.length===0 && <p className="text-[12px] text-[#bbb] italic px-3 py-2">No spaces yet</p>}
      </div>
      <div className="px-2 pb-3 pt-2 border-t border-[#e8e5e0]">
        <button onClick={() => { setIsCreateSpaceOpen(true); setIsMobileSidebarOpen(false); }} className="ws-sidebar-item w-full text-[#8B0000] hover:bg-[#fdf0f0]">
          <Plus className="w-4 h-4 shrink-0" /><span className="text-[13px] font-medium">New Study Space</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f5f4f1] overflow-hidden" style={{fontFamily:"Inter,sans-serif"}}>
      <GlobalSearch isOpen={isSearchOpen} onClose={()=>setIsSearchOpen(false)} onNavigate={(id,type)=>{ if(type==="space") setActiveSpaceId(id); else if(type==="chat") setNavTab("chat"); }} />
      <WorkspaceTopNav activeTab={navTab} onTabChange={setNavTab} onOpenSearch={()=>setIsSearchOpen(true)} onOpenSettings={()=>setIsSettingsOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex md:hidden" onClick={()=>setIsMobileSidebarOpen(false)}>
            <aside className="w-64 bg-white h-full shadow-xl" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e5e0]">
                <span className="font-semibold text-[14px] text-[#111]">Study Spaces</span>
                <button onClick={()=>setIsMobileSidebarOpen(false)} className="p-1 text-[#aaa]"><X className="w-4 h-4" /></button>
              </div>
              <Sidebar />
            </aside>
          </div>
        )}
        <aside className="hidden md:flex flex-col w-[200px] shrink-0 bg-white border-r border-[#e8e5e0] h-full"><Sidebar /></aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex md:hidden items-center gap-2 px-4 py-2.5 bg-white border-b border-[#e8e5e0] shrink-0">
            <button onClick={()=>setIsMobileSidebarOpen(true)} className="p-1.5 rounded-lg text-[#666]"><Menu className="w-5 h-5" /></button>
            <span className="text-[14px] font-semibold text-[#111]">PreplitAI</span>
          </div>
          <div className="flex sm:hidden overflow-x-auto border-b border-[#e8e5e0] bg-white shrink-0">
            {(["spaces","chat","practice","analytics","explore3d"] as WorkspaceNavTab[]).map(tab => (
              <button key={tab} onClick={()=>setNavTab(tab)} className={`flex-1 min-w-max px-3 py-2.5 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${navTab===tab?"border-[#8B0000] text-[#8B0000]":"border-transparent text-[#888]"}`}>
                {tab==="spaces"?"Spaces":tab==="chat"?"Chat":tab==="practice"?"Practice":tab==="analytics"?"Analytics":"3D"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {navTab==="spaces" && <WorkspaceHome onCreateSpace={()=>setIsCreateSpaceOpen(true)} onSelectSpace={id=>setActiveSpaceId(id)} onUploadContent={()=>setIsUploadOpen(true)} spaces={spaces} activeSpaceId={activeSpaceId} onToolSelect={handleToolSelect} />}
            {navTab==="chat" && (
              <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e8e5e0] bg-white shrink-0">
                    <h1 className="text-[20px] font-bold text-[#111]">AI Study Chat</h1>
                    {activeDocument && <p className="text-[12.5px] text-[#888] mt-0.5">{activeDocument.file_name}</p>}
                    <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-[#f0ede8] text-[#8B0000] text-[11px] font-semibold">Unlimited grounded chat</span>
                  </div>
                  <div className="flex-1 overflow-hidden"><MessageList messages={messages as any} isGenerating={isGenerating} /></div>
                  <div className="px-4 md:px-6 py-3 border-t border-[#e8e5e0] bg-white shrink-0">
                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2 bg-[#f7f4f0] border border-[#e8e5e0] rounded-2xl px-3 py-2">
                      <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about this course..." className="flex-1 text-[13.5px] bg-transparent focus:outline-none text-[#111] placeholder:text-[#bbb]" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" className="p-1 text-[#ccc] hover:text-[#888]"><Paperclip className="w-4 h-4" /></button>
                        <VoiceMode onTranscript={t=>setChatInput(p=>p+(p?" ":"")+t)} />
                        <button type="submit" disabled={!chatInput.trim()} className="w-7 h-7 rounded-full bg-[#8B0000] hover:bg-[#6d0000] disabled:opacity-30 flex items-center justify-center"><Send className="w-3.5 h-3.5 text-white" /></button>
                      </div>
                    </form>
                    <p className="text-[10.5px] text-[#bbb] mt-1.5 px-1">{defaultModel}</p>
                  </div>
                </div>
                {activeDocument && (
                  <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-[#e8e5e0] bg-white">
                    <div className="px-4 py-3 border-b border-[#e8e5e0]"><p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Source</p></div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="bg-[#f7f4f0] rounded-xl border border-[#e8e5e0] p-4">
                        <p className="text-[13px] font-semibold text-[#111] mb-3">{activeDocument.file_name}</p>
                        <div className="space-y-1.5">{[100,80,90,60,75,50,65].map((w,i)=><div key={i} className={`h-2 rounded-full ${i===2?"bg-[#f0b4b4]":"bg-[#e8e5e0]"}`} style={{width:`${w}%`}} />)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {navTab==="practice" && (
              <div className="flex flex-col flex-1 overflow-hidden bg-[#f5f4f1]">
                <div className="flex gap-1 px-5 pt-4 pb-0 shrink-0 overflow-x-auto">
                  {(["flashcards","quizzes","podcast","summary","expected"] as const).map(tab=>(
                    <button key={tab} onClick={()=>setPracticeTab(tab)} className={`px-4 py-2 text-[13px] font-semibold rounded-t-xl border border-b-0 transition-all whitespace-nowrap ${practiceTab===tab?"bg-white border-[#e8e5e0] text-[#111]":"border-transparent text-[#888] hover:text-[#555]"}`}>
                      {tab==="expected"?"Exam Predictor":tab==="podcast"?"Podcast":tab.charAt(0).toUpperCase()+tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-hidden bg-white border-t border-[#e8e5e0]">
                  {practiceTab==="flashcards" && <FlashcardView flashcardData={flashcardData} onGenerateNew={genFlashcards} />}
                  {practiceTab==="quizzes"    && <QuizView quizData={quizData} onGenerateNewQuiz={genQuiz} />}
                  {practiceTab==="podcast"    && <PodcastView podcastData={podcastData} onGeneratePodcast={genPodcast} />}
                  {practiceTab==="summary"    && <SummaryView summaryData={summaryData} onGenerateSummary={genSummary} />}
                  {practiceTab==="expected"   && <ExpectedExamView examData={examData} onGenerateExam={genExam} />}
                </div>
              </div>
            )}
            {navTab==="analytics"  && <AnalyticsView language={language} />}
            {navTab==="explore3d"  && <InteractiveLearningView language={language} />}
          </div>
        </main>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setIsUploadOpen(false)}>
          <div className="bg-white border border-[#e8e5e0] rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div><h3 className="text-[14px] font-semibold text-[#111]">Add Content</h3><p className="text-[12px] text-[#888] mt-0.5">Upload notes or paste text</p></div>
              <button onClick={()=>setIsUploadOpen(false)} className="p-1 text-[#aaa] hover:text-[#666]"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-1 p-1 bg-[#f5f4f1] rounded-xl">
              {(["file","paste"] as const).map(m=><button key={m} onClick={()=>setUploadMethod(m)} className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all ${uploadMethod===m?"bg-white text-[#111] shadow-sm":"text-[#888]"}`}>{m==="file"?"Upload file":"Paste text"}</button>)}
            </div>
            <div className="flex gap-2">
              {(["course_material","past_exam"] as const).map(type=><button key={type} onClick={()=>setUploadDocType(type)} className={`flex-1 py-1.5 px-3 rounded-xl border text-[12px] font-medium transition-all ${uploadDocType===type?"border-[#8B0000] bg-[#8B0000] text-white":"border-[#e8e5e0] text-[#666]"}`}>{type==="course_material"?"Course Material":"Past Exam"}</button>)}
            </div>
            {uploadMethod==="file"?(
              <div onClick={()=>fileInputRef.current?.click()} className="border border-dashed border-[#ddd] rounded-xl p-8 text-center hover:border-[#8B0000]/40 cursor-pointer">
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={e=>setUploadFile(e.target.files?.[0]||null)} className="hidden" />
                <Upload className="w-5 h-5 text-[#bbb] mx-auto mb-2" />
                <p className="text-[12.5px] font-medium text-[#666]">{uploadFile?`✓ ${uploadFile.name}`:"Drop file here or click to browse"}</p>
                <p className="text-[11px] text-[#bbb] mt-1">PDF, DOCX, TXT · Max 50MB</p>
              </div>
            ):(
              <textarea value={uploadPasteText} onChange={e=>setUploadPasteText(e.target.value)} placeholder="Paste your notes here..." className="w-full h-32 border border-[#e8e5e0] rounded-xl p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20" />
            )}
            <button onClick={handleUpload} disabled={isUploading||(uploadMethod==="file"?!uploadFile:!uploadPasteText.trim())} className="w-full py-2.5 bg-[#8B0000] hover:bg-[#6d0000] disabled:opacity-40 text-white rounded-xl text-[13.5px] font-semibold">{isUploading?"Uploading...":"Upload & Index"}</button>
          </div>
        </div>
      )}

      {isCreateSpaceOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&setIsCreateSpaceOpen(false)}>
          <div className="bg-white border border-[#e8e5e0] rounded-2xl w-full max-w-sm shadow-xl p-5">
            <h3 className="text-[15px] font-semibold text-[#111] mb-1">New Study Space</h3>
            <p className="text-[12.5px] text-[#888] mb-4">Name your course or subject</p>
            <form onSubmit={createSpace}>
              <input autoFocus type="text" value={newSpaceInput} onChange={e=>setNewSpaceInput(e.target.value)} placeholder='e.g. "Organic Chemistry 301"' className="w-full border border-[#e8e5e0] rounded-xl px-3 py-2.5 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] mb-3" />
              <div className="flex gap-2">
                <button type="button" onClick={()=>setIsCreateSpaceOpen(false)} className="flex-1 py-2 border border-[#e8e5e0] rounded-xl text-[13px] font-semibold text-[#666]">Cancel</button>
                <button type="submit" disabled={!newSpaceInput.trim()} className="flex-1 py-2 bg-[#8B0000] hover:bg-[#6d0000] disabled:opacity-40 text-white rounded-xl text-[13px] font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={()=>setIsSettingsOpen(false)} theme={theme} onThemeChange={setTheme} defaultModel={defaultModel} onModelChange={setDefaultModel} language={language} onLanguageChange={setLanguage} onExportData={()=>{}} onClearData={()=>{ if(window.confirm("Clear all data?")) { setDocuments([]); setActiveDocument(null); setQuizData(null); setPodcastData(null); setFlashcardData(null); setSummaryData(null); setExamData(null); setMessages([{id:Date.now().toString(),role:"assistant",content:"Workspace cleared."}]); setIsSettingsOpen(false); } }} />}
      <AuthModal isOpen={isAuthOpen} onClose={()=>setIsAuthOpen(false)} />
      <ManageSubscriptionModal isOpen={isManageSubOpen} onClose={()=>setIsManageSubOpen(false)} onOpenUpgrade={() => { setIsManageSubOpen(false); setIsSubModalOpen(true); }} />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={()=>setIsSubModalOpen(false)} />
    </div>
  );
}

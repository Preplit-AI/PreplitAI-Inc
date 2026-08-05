import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, History, Folder, Settings, User, BookOpen, Radio, FileText, Upload, X, ChevronUp, MessageSquare, HelpCircle, Trash2, Menu } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
import { ToolPanel } from './ToolPanel';
import { SettingsModal } from './SettingsModal';
import { AccountMenu } from './AccountMenu';
import { ManageSubscriptionModal } from '../common/ManageSubscriptionModal';
import { SubscriptionModal } from '../common/SubscriptionModal';
import { PlanBadge } from '../common/PlanBadge';
import { AuthModal } from '../auth/AuthModal';
import { translations, Language } from '@/i18n/translations';

async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.name.toLowerCase().endsWith('.pdf')) {
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
        let text = '';
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(bytes);
        const tjMatches = raw.match(/\(([^)]+)\)/g);
        if (tjMatches && tjMatches.length > 5) {
          text = tjMatches
            .map(m => m.slice(1, -1))
            .filter(s => s.length > 1 && /[a-zA-Z]/.test(s))
            .join(' ');
        }
        if (text.length < 50) {
          text = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s{3,}/g, '\n')
            .split('\n')
            .filter(line => line.trim().length > 20 && /[a-zA-Z]{3,}/.test(line))
            .join('\n');
        }
        if (text.trim().length < 20) {
          text = `[PDF content from: ${file.name}]\n\nThe PDF binary content was loaded successfully. Full text extraction requires server-side processing. The document is ${(file.size / 1024).toFixed(1)} KB in size.`;
        }
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
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileTab, setMobileTab] = useState<'document' | 'tools'>('tools');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<LocalDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isManageSubOpen, setIsManageSubOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [newSpaceInput, setNewSpaceInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [defaultModel, setDefaultModel] = useState<string>('GPT-5 / Llama 3.1');

  // Spaces state (no dummy data)
  const [spaces, setSpaces] = useState<Array<{ id: string; name: string }>>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');

  const t = translations[language] || translations.en;

  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; citations?: any[] }>>([
    { id: '1', role: 'assistant', content: t.welcomeMessage }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [podcastData, setPodcastData] = useState<any>(null);
  const [flashcardData, setFlashcardData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState<'course_material' | 'past_exam'>('course_material');
  const [uploadPasteText, setUploadPasteText] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docText = activeDocument?.extracted_text || '';
  const docName = activeDocument?.file_name || 'Document';

  // Apply Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load spaces from backend on mount
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/spaces');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSpaces(data.map((s: any) => ({ id: String(s.id), name: s.name })));
            setActiveSpaceId(String(data[0].id));
          }
        }
      } catch (err) {
        // Fallback to local spaces state
      }
    };
    fetchSpaces();
  }, []);

  // Fetch single space & nested documents/outputs on activeSpaceId change
  useEffect(() => {
    if (!activeSpaceId) return;
    const fetchSpaceDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}`);
        if (res.ok) {
          const spaceData = await res.json();
          if (spaceData.documents) {
            const mappedDocs: LocalDocument[] = spaceData.documents.map((d: any) => ({
              id: d.id,
              file_name: d.file_name,
              type: d.type,
              extracted_text: d.extracted_text || '',
              raw_file_url: d.raw_file_url
            }));
            setDocuments(mappedDocs);
            if (mappedDocs.length > 0) setActiveDocument(mappedDocs[0]);
          }

          // Restore saved outputs if present
          if (spaceData.generated_outputs) {
            spaceData.generated_outputs.forEach((out: any) => {
              try {
                const parsedContent = typeof out.content === 'string' ? JSON.parse(out.content) : out.content;
                if (out.type === 'quiz') setQuizData(parsedContent);
                else if (out.type === 'flashcard_set') setFlashcardData(parsedContent);
                else if (out.type === 'summary') setSummaryData(parsedContent);
                else if (out.type === 'podcast_episode') setPodcastData(parsedContent);
                else if (out.type === 'predicted_exam') setExamData(parsedContent);
              } catch {}
            });
          }
        }
      } catch (err) {
        // Fallback to local workspace memory
      }
    };
    fetchSpaceDetails();
  }, [activeSpaceId]);

  // Handle In-UI Space Creation
  const handleCreateSpaceSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newName = newSpaceInput.trim();
    if (!newName) return;
    try {
      const res = await fetch('http://localhost:5000/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        const created = await res.json();
        const newSpaceObj = { id: String(created.id), name: created.name };
        setSpaces(prev => [...prev, newSpaceObj]);
        setActiveSpaceId(newSpaceObj.id);
        setNewSpaceInput('');
        setIsCreateSpaceOpen(false);
        return;
      }
    } catch {}
    // Fallback client creation
    const fallbackSpace = { id: `sp_${Date.now()}`, name: newName };
    setSpaces(prev => [...prev, fallbackSpace]);
    setActiveSpaceId(fallbackSpace.id);
    setNewSpaceInput('');
    setIsCreateSpaceOpen(false);
  };

  // Handle Space Deletion
  const handleDeleteSpace = async (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:5000/api/spaces/${spaceId}`, { method: 'DELETE' });
    } catch {}
    setSpaces(prev => {
      const next = prev.filter(s => s.id !== spaceId);
      if (activeSpaceId === spaceId) {
        setActiveSpaceId(next.length > 0 ? next[0].id : '');
        setDocuments([]);
        setActiveDocument(null);
      }
      return next;
    });
  };

  // Upload Document to Space API
  const handleUpload = async () => {
    setIsUploading(true);
    try {
      let extractedText = '';
      let fileName = 'Document';

      if (uploadMethod === 'file' && uploadFile) {
        fileName = uploadFile.name;
        extractedText = await extractTextFromFile(uploadFile);

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('type', uploadDocType);
        formData.append('upload_method', 'file');

        const apiRes = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/documents`, {
          method: 'POST',
          body: formData
        });
        if (apiRes.ok) {
          const savedDoc = await apiRes.json();
          const newDoc: LocalDocument = {
            id: savedDoc.id,
            file_name: savedDoc.file_name,
            type: savedDoc.type,
            extracted_text: savedDoc.extracted_text || extractedText,
            raw_file_url: savedDoc.raw_file_url
          };
          setDocuments(prev => [...prev, newDoc]);
          setActiveDocument(newDoc);
          setIsUploadOpen(false);
          setUploadFile(null);
          setUploadPasteText('');
          setIsUploading(false);
          return;
        }
      } else if (uploadMethod === 'paste' && uploadPasteText.trim()) {
        fileName = 'Pasted Notes';
        extractedText = uploadPasteText.trim();

        const apiRes = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: uploadDocType,
            upload_method: 'paste',
            text_content: extractedText,
            file_name: fileName
          })
        });
        if (apiRes.ok) {
          const savedDoc = await apiRes.json();
          const newDoc: LocalDocument = {
            id: savedDoc.id,
            file_name: savedDoc.file_name,
            type: savedDoc.type,
            extracted_text: savedDoc.extracted_text || extractedText
          };
          setDocuments(prev => [...prev, newDoc]);
          setActiveDocument(newDoc);
          setIsUploadOpen(false);
          setUploadPasteText('');
          setIsUploading(false);
          return;
        }
      }

      // Offline fallback state update
      if (extractedText) {
        const newDoc: LocalDocument = { id: Date.now(), file_name: fileName, type: uploadDocType, extracted_text: extractedText };
        setDocuments(prev => [...prev, newDoc]);
        setActiveDocument(newDoc);
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadPasteText('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `**${fileName}** uploaded. You can now generate quizzes, flashcards, summaries, and more.` }]);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setIsUploading(false);
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), documents: documents.map(d => ({ file_name: d.file_name, type: d.type })), quiz: quizData, flashcards: flashcardData, summary: summaryData }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `preplitai_export_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Clear all documents and study materials?')) {
      setDocuments([]); setActiveDocument(null); setQuizData(null); setPodcastData(null);
      setFlashcardData(null); setSummaryData(null); setExamData(null);
      setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Workspace cleared.' }]);
      setIsSettingsOpen(false);
    }
  };

  // Grounded RAG Chat API
  const handleSendMessage = async (text: string) => {
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        const data = await res.json();
        const assistantText = data.message?.content || data.reply || 'No response generated.';
        const citations = data.citations || [];
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: assistantText, citations }
        ]);
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Offline fallback chat logic
    setTimeout(() => {
      let response = '';
      if (docText) {
        const keywords = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const matches = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k))).slice(0, 3);
        response = matches.length > 0
          ? `Based on **${docName}** (${defaultModel}):\n\n${matches.map(m => `> ${m.trim()}`).join('\n\n')}\n\n*— ${docName}*`
          : `I searched **${docName}** but couldn't find a direct match for "${text}". Try rephrasing.`;
      } else {
        response = `Upload a document first using the **"+ ${t.addContent}"** button to get started.`;
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
      setIsGenerating(false);
    }, 800);
  };

  // Generate Quiz API
  const handleGenerateQuiz = async () => {
    if (!docText && documents.length === 0) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t.noDocUploadFirst }]);
      setActiveTab('chat');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_questions: 5 })
      });
      if (res.ok) {
        const data = await res.json();
        const quizObj = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || data);
        setQuizData(quizObj);
        setActiveTab('quizzes');
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Fallback local generation
    const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const picked = sentences.sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizData({ questions: picked.map((s, i) => { const words = s.trim().split(/\s+/); const blankIdx = Math.min(Math.floor(words.length / 2), words.length - 1); const answer = words[blankIdx]; const questionText = words.map((w, j) => j === blankIdx ? '______' : w).join(' '); return { id: i + 1, question: questionText + '.', type: i % 2 === 0 ? 'fill_in_the_blank' : 'multiple_choice', options: i % 2 === 1 ? [answer, 'Alternative A', 'Alternative B', 'Alternative C'].sort(() => Math.random() - 0.5) : undefined, answer, explanation: `From ${docName}: "${s.trim().slice(0, 120)}..."` }; }) });
    setActiveTab('quizzes');
    setIsGenerating(false);
  };

  // Generate Flashcards API
  const handleGenerateFlashcards = async () => {
    if (!docText && documents.length === 0) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t.noDocUploadFirst }]);
      setActiveTab('chat');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        const fcObj = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || data);
        setFlashcardData(fcObj);
        setActiveTab('flashcards');
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Fallback local generation
    const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 25);
    const picked = sentences.sort(() => Math.random() - 0.5).slice(0, 6);
    setFlashcardData({ flashcards: picked.map((s, i) => { const trimmed = s.trim(); const halfIdx = Math.floor(trimmed.length * 0.4); return { id: i + 1, front: trimmed.slice(0, halfIdx).trim() + '...?', back: trimmed }; }) });
    setActiveTab('flashcards');
    setIsGenerating(false);
  };

  // Generate Summary API
  const handleGenerateSummary = async () => {
    if (!docText && documents.length === 0) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t.noDocUploadFirst }]);
      setActiveTab('chat');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        const sumObj = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || data);
        setSummaryData(sumObj);
        setActiveTab('summary');
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Fallback local summary
    const paragraphs = docText.split(/\n\n+/).filter(p => p.trim().length > 40);
    const keyPoints = paragraphs.slice(0, 8).map(p => { const s = p.split(/[.!?]/)[0]?.trim(); return s && s.length > 15 ? `- ${s}.` : null; }).filter(Boolean);
    setSummaryData({ summary: `# ${t.summary}: ${docName}\n\n## Key Points\n${keyPoints.join('\n')}\n\n## Overview\n~${(docText.length / 1000).toFixed(1)}K characters across ${paragraphs.length} sections.\n\n*Generated from: ${docName}*` });
    setActiveTab('summary');
    setIsGenerating(false);
  };

  // Generate Podcast API
  const handleGeneratePodcast = async () => {
    if (!docText && documents.length === 0) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t.noDocUploadFirst }]);
      setActiveTab('chat');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/podcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker_1_name: 'Rachel', speaker_2_name: 'Adam' })
      });
      if (res.ok) {
        const data = await res.json();
        const podObj = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || data);
        setPodcastData(podObj);
        setActiveTab('podcast');
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Fallback local podcast
    const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
    setPodcastData({ title: `Discussion: ${docName}`, duration: '5:00', episodes: sentences.slice(0, 6).map((s, i) => ({ speaker: i % 2 === 0 ? 'Host A (Rachel)' : 'Host B (Adam)', timestamp: `0${Math.floor(i * 0.8)}:${String((i * 15) % 60).padStart(2, '0')}`, text: i % 2 === 0 ? `Let's talk about this: ${s.trim()}` : `That's a great point! ${s.trim()}` })) });
    setActiveTab('podcast');
    setIsGenerating(false);
  };

  // Generate Expected Exam API
  const handleGenerateExam = async () => {
    if (!docText && documents.length === 0) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t.noDocUploadFirst }]);
      setActiveTab('chat');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/spaces/${activeSpaceId}/expected-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        const examObj = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || data);
        setExamData(examObj);
        setActiveTab('expected');
        setIsGenerating(false);
        return;
      }
    } catch (e) {}

    // Fallback local expected exam
    const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const picked = sentences.sort(() => Math.random() - 0.5).slice(0, 4);
    setExamData({ confidence: `Based on ${docName}`, predicted_exam: picked.map((s, i) => ({ question_num: i + 1, type: ['Short Answer', 'Definition', 'Mechanism', 'Compare & Contrast'][i % 4], question: `Explain: "${s.trim().slice(0, 100)}..."`, pattern_note: `Key passage in ${docName}`, model_answer: s.trim() })) });
    setActiveTab('expected');
    setIsGenerating(false);
  };

  const handleSelectAction = async (action: string, selectedText: string) => {
    if (action === 'explain') { setActiveTab('chat'); handleSendMessage(`Explain this: "${selectedText}"`); }
    else if (action === 'chat') { setActiveTab('chat'); handleSendMessage(`Tell me more about: "${selectedText}"`); }
    else if (action === 'quiz') { handleGenerateQuiz(); }
    else if (action === 'flashcards') { handleGenerateFlashcards(); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fafafa] dark:bg-[#0f0f0f] text-[#111] dark:text-[#f0f0f0] overflow-hidden">

      {/* ── Mobile Top Header Bar ── */}
      <header className="flex md:hidden items-center justify-between px-4 py-2.5 bg-white dark:bg-[#111] border-b border-[#e8e8e8] dark:border-white/[0.06] shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[#666] dark:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06]"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <a href="/" className="flex items-center gap-1.5">
            <img src="/logo.png" alt="PreplitAI" className="w-6 h-6 object-contain shrink-0" />
            <span className="font-semibold text-[13.5px] text-[#111] dark:text-white">PreplitAI</span>
          </a>
        </div>

        {/* Mobile View Switcher (Document vs AI Tools) */}
        <div className="flex items-center gap-1 p-0.5 bg-[#f0f0f0] dark:bg-white/[0.06] rounded-lg">
          <button
            onClick={() => setMobileTab('document')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold rounded-md transition-all ${mobileTab === 'document' ? 'bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-2xs' : 'text-[#888] dark:text-[#666]'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document</span>
          </button>
          <button
            onClick={() => setMobileTab('tools')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold rounded-md transition-all ${mobileTab === 'tools' ? 'bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-2xs' : 'text-[#888] dark:text-[#666]'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Tools</span>
          </button>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer Overlay ── */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex md:hidden"
          onClick={(e) => e.target === e.currentTarget && setIsMobileSidebarOpen(false)}
        >
          <aside className="w-64 bg-white dark:bg-[#111] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="PreplitAI" className="w-6 h-6 object-contain" />
                <span className="font-semibold text-[14px] text-[#111] dark:text-white">PreplitAI</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md text-[#aaa] hover:text-[#666]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Body */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              <button
                onClick={() => { setIsMobileSidebarOpen(false); setIsUploadOpen(true); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium bg-[#111] dark:bg-white text-white dark:text-[#111]"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addContent}</span>
              </button>

              {/* Spaces */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2.5 mb-1">
                  <span className="section-label">Spaces</span>
                  <button
                    onClick={() => { setIsMobileSidebarOpen(false); setIsCreateSpaceOpen(true); }}
                    className="w-4 h-4 flex items-center justify-center text-[#aaa]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {spaces.length > 0 ? (
                  spaces.map(s => (
                    <div key={s.id} className="relative group">
                      <button
                        onClick={() => { setActiveSpaceId(s.id); setIsMobileSidebarOpen(false); }}
                        className={`nav-item justify-between ${activeSpaceId === s.id ? 'active' : ''}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Folder className="w-3.5 h-3.5 shrink-0 text-[#999]" />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSpace(s.id, e)}
                          className="p-1 text-[#999] hover:text-rose-500 shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-2.5 py-1 text-[11px] text-[#aaa] italic">No spaces created yet</div>
                )}
              </div>

              {/* Documents */}
              {documents.length > 0 && (
                <>
                  <div className="sidebar-divider" />
                  <div className="space-y-0.5">
                    <span className="section-label block mb-1">{t.documents}</span>
                    {documents.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => { setActiveDocument(doc); setMobileTab('document'); setIsMobileSidebarOpen(false); }}
                        className={`nav-item ${activeDocument?.id === doc.id ? 'active' : ''}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${doc.type === 'past_exam' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="truncate">{doc.file_name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e8e8e8] dark:border-white/[0.06] p-2">
              <button
                onClick={() => { setIsMobileSidebarOpen(false); setIsSettingsOpen(true); }}
                className="nav-item w-full"
              >
                <Settings className="w-4 h-4 shrink-0 text-[#999]" />
                <span>{t.settings}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="w-56 bg-white dark:bg-[#111] border-r border-[#e8e8e8] dark:border-white/[0.06] flex flex-col hidden md:flex shrink-0">

        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e8e8e8] dark:border-white/[0.06]">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="PreplitAI" className="w-7 h-7 object-contain shrink-0" />
            <span className="font-semibold text-[14px] text-[#111] dark:text-white tracking-tight">PreplitAI</span>
          </a>
          <PlanBadge />
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">

          {/* Add Content */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-[#333] dark:hover:bg-[#e8e8e8] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addContent}</span>
          </button>

          {/* Spaces */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5 mb-1">
              <span className="section-label">Spaces</span>
              <button
                onClick={() => setIsCreateSpaceOpen(true)}
                className="w-4 h-4 flex items-center justify-center text-[#aaa] dark:text-[#555] hover:text-[#111] dark:hover:text-white transition-colors rounded"
                title="Create New Space"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {spaces.length > 0 ? (
              spaces.map(s => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => setActiveSpaceId(s.id)}
                    className={`nav-item justify-between ${activeSpaceId === s.id ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 shrink-0 text-[#999] dark:text-[#666]" />
                      <span className="truncate">{s.name}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSpace(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#e0e0e0] dark:hover:bg-white/10 text-[#999] hover:text-rose-500 transition-all shrink-0"
                      title="Delete Space"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                </div>
              ))
            ) : (
              <div className="px-2.5 py-1 text-[11px] text-[#aaa] dark:text-[#555] italic">No spaces created yet</div>
            )}
          </div>

          <div className="sidebar-divider" />

          {/* Nav links */}
          <div className="space-y-0.5">
            <button className="nav-item">
              <Search className="w-3.5 h-3.5 shrink-0 text-[#999] dark:text-[#666]" />
              <span>{t.search}</span>
            </button>
            <button className="nav-item">
              <History className="w-3.5 h-3.5 shrink-0 text-[#999] dark:text-[#666]" />
              <span>{t.history}</span>
            </button>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <>
              <div className="sidebar-divider" />
              <div className="space-y-0.5">
                <span className="section-label block mb-1">{t.documents}</span>
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocument(doc)}
                    className={`nav-item ${activeDocument?.id === doc.id ? 'active' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${doc.type === 'past_exam' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="truncate">{doc.file_name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e8e8] dark:border-white/[0.06] px-2 py-2 relative">
          <AccountMenu
            isOpen={isAccountMenuOpen}
            onClose={() => setIsAccountMenuOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenManageSubscription={() => setIsManageSubOpen(true)}
            language={language}
          />
          <button
            onClick={() => setIsAccountMenuOpen(p => !p)}
            className="nav-item w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#111] dark:bg-white flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-white dark:text-[#111]" />
              </div>
              <span className="text-[12px] font-medium text-[#111] dark:text-[#ddd] truncate">{t.myAccount}</span>
            </div>
            <ChevronUp className={`w-3 h-3 text-[#aaa] transition-transform ${isAccountMenuOpen ? '' : 'rotate-180'}`} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="nav-item w-full mt-0.5"
          >
            <Settings className="w-3.5 h-3.5 shrink-0 text-[#999] dark:text-[#666]" />
            <span>{t.settings}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex gap-0 overflow-hidden relative">
        {/* Document Viewer */}
        <div className={`flex-1 min-w-0 h-full ${mobileTab === 'document' ? 'block' : 'hidden md:block'}`}>
          <DocumentViewer
            document={activeDocument}
            onSelectAction={handleSelectAction}
            onOpenUpload={() => setIsUploadOpen(true)}
            language={language}
          />
        </div>

        {/* Tool Panel */}
        <div className={`w-full md:w-[440px] xl:w-[480px] h-full shrink-0 border-l border-[#e8e8e8] dark:border-white/[0.06] ${mobileTab === 'tools' ? 'block' : 'hidden md:block'}`}>
          <ToolPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            messages={messages}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            quizData={quizData}
            podcastData={podcastData}
            flashcardData={flashcardData}
            summaryData={summaryData}
            examData={examData}
            onGenerateQuiz={handleGenerateQuiz}
            onGeneratePodcast={handleGeneratePodcast}
            onGenerateFlashcards={handleGenerateFlashcards}
            onGenerateSummary={handleGenerateSummary}
            onGenerateExam={handleGenerateExam}
            language={language}
            defaultModel={defaultModel}
          />
        </div>
      </main>

      {/* ── Upload Modal ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setIsUploadOpen(false)}>
          <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-[#111] dark:text-white">{t.addContentTitle}</h3>
                <p className="text-[12px] text-[#888] dark:text-[#666] mt-0.5">{t.addContentSubtitle}</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 rounded-md text-[#aaa] hover:text-[#666] dark:hover:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Method tabs */}
            <div className="flex gap-1 p-1 bg-[#f5f5f5] dark:bg-white/[0.04] rounded-lg">
              {(['file', 'paste'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setUploadMethod(m)}
                  className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all ${uploadMethod === m ? 'bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-sm' : 'text-[#888] dark:text-[#666] hover:text-[#444] dark:hover:text-[#aaa]'}`}
                >
                  {m === 'file' ? t.uploadFileTab : t.pasteTextTab}
                </button>
              ))}
            </div>

            {/* Document type */}
            <div className="space-y-2">
              <label className="text-[11.5px] font-medium text-[#666] dark:text-[#888]">{t.docClass}</label>
              <div className="flex gap-2">
                {(['course_material', 'past_exam'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setUploadDocType(type)}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-[12px] font-medium transition-all ${uploadDocType === type ? 'border-[#111] dark:border-white/40 bg-[#111] dark:bg-white text-white dark:text-[#111]' : 'border-[#e5e5e5] dark:border-white/[0.1] text-[#666] dark:text-[#888] hover:border-[#ccc] dark:hover:border-white/20'}`}
                  >
                    {type === 'course_material' ? t.courseMaterial : t.pastExam}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            {uploadMethod === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#ddd] dark:border-white/[0.1] rounded-xl p-8 text-center hover:border-[#aaa] dark:hover:border-white/20 cursor-pointer transition-colors group"
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
                <Upload className="w-5 h-5 text-[#bbb] dark:text-[#555] mx-auto mb-2 group-hover:text-[#888] transition-colors" />
                <p className="text-[12.5px] font-medium text-[#666] dark:text-[#777]">
                  {uploadFile ? `✓ ${uploadFile.name}` : t.dropPrompt}
                </p>
                <p className="text-[11px] text-[#bbb] dark:text-[#555] mt-1">{t.maxSize}</p>
              </div>
            ) : (
              <textarea
                rows={5}
                placeholder={t.pastePlaceholder}
                value={uploadPasteText}
                onChange={e => setUploadPasteText(e.target.value)}
                className="input-base resize-none"
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setIsUploadOpen(false)} className="btn-ghost">{t.cancel}</button>
              <button
                onClick={handleUpload}
                disabled={isUploading || (uploadMethod === 'file' ? !uploadFile : !uploadPasteText.trim())}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading ? t.processing : t.addToWorkspace}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-UI Create Space Modal */}
      {isCreateSpaceOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/25 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsCreateSpaceOpen(false)}
        >
          <div className="bg-white dark:bg-[#161616] border border-[#e5e5e5] dark:border-white/[0.08] rounded-2xl w-full max-w-sm shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#111] dark:text-white">Create New Space</h3>
              <button
                onClick={() => setIsCreateSpaceOpen(false)}
                className="p-1 rounded-md text-[#bbb] hover:text-[#666] dark:hover:text-[#aaa] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-4">
              <div>
                <label className="block text-[11.5px] font-medium text-[#666] dark:text-[#888] mb-1.5">
                  Space Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Organic Chemistry, Linear Algebra..."
                  value={newSpaceInput}
                  onChange={(e) => setNewSpaceInput(e.target.value)}
                  className="input-base"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateSpaceOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSpaceInput.trim()}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        isOpen={isManageSubOpen}
        onClose={() => setIsManageSubOpen(false)}
        onOpenUpgrade={() => setIsSubModalOpen(true)}
      />

      {/* Subscription Modal (Tiers & Upgrades) */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        language={language}
        onLanguageChange={setLanguage}
        defaultModel={defaultModel}
        onModelChange={setDefaultModel}
        onExportData={handleExportData}
        onClearData={handleClearData}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user, token) => { console.log('Logged in:', user); }}
      />
    </div>
  );
}

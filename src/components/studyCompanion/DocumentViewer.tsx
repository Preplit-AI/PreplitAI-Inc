import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, Download, Maximize2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Sparkles, MessageSquare, HelpCircle, BookOpen, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translations, Language } from '@/i18n/translations';

interface DocumentViewerProps {
  document: {
    id: number;
    file_name: string;
    raw_file_url?: string;
    extracted_text?: string;
    type?: string;
  } | null;
  onSelectAction?: (action: string, selectedText: string) => void;
  onOpenUpload?: () => void;
  language?: Language;
}

export function DocumentViewer({ document, onSelectAction, onOpenUpload, language = 'en' }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(19);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  // Handle text selection in document viewer
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setSelectionPosition({
          top: rect.top - containerRect.top - 45,
          left: Math.max(10, rect.left - containerRect.left + rect.width / 2 - 140)
        });
      }
    } else {
      setSelectionPosition(null);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectionPosition(null);
      }
    };
    window.document.addEventListener('mousedown', handleDocumentClick);
    return () => window.document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const triggerAction = (action: string) => {
    if (onSelectAction && selectedText) {
      onSelectAction(action, selectedText);
    }
    setSelectionPosition(null);
  };

  const toggleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isReadingAloud) {
        window.speechSynthesis.cancel();
        setIsReadingAloud(false);
      } else {
        const textToRead = selectedText || document?.extracted_text?.slice(0, 500) || "";
        if (!textToRead) return;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.onend = () => setIsReadingAloud(false);
        window.speechSynthesis.speak(utterance);
        setIsReadingAloud(true);
      }
    }
  };

  const textContent = document?.extracted_text || null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden relative" ref={containerRef}>
      {/* Document Header Controls */}
      {textContent && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8e8e8] dark:border-white/[0.06] bg-white dark:bg-[#111]">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] text-[#aaa] dark:text-[#555] hover:text-[#666] dark:hover:text-[#999] transition-colors" title={t.searchDoc}>
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleReadAloud}
              className={`p-1.5 rounded-md transition-colors ${isReadingAloud ? 'bg-[#f0f0f0] dark:bg-white/[0.08] text-[#111] dark:text-white' : 'text-[#aaa] dark:text-[#555] hover:text-[#666] dark:hover:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06]'}`}
              title={isReadingAloud ? t.stopReading : t.readAloud}
            >
              {isReadingAloud ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="text-[#bbb] dark:text-[#444] hover:text-[#666] dark:hover:text-[#999] disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[12px] font-medium text-[#888] dark:text-[#666] tabular-nums">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="text-[#bbb] dark:text-[#444] hover:text-[#666] dark:hover:text-[#999] disabled:opacity-30 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] text-[#aaa] dark:text-[#555] hover:text-[#666] dark:hover:text-[#999] transition-colors" title={t.downloadPdf}>
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-white/[0.06] text-[#aaa] dark:text-[#555] hover:text-[#666] dark:hover:text-[#999] transition-colors" title={t.expandView}>
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Document Content View */}
      {textContent ? (
        <div
          className="flex-1 overflow-y-auto px-8 py-6 selection:bg-[#111]/10 dark:selection:bg-white/10"
          onMouseUp={handleMouseUp}
          style={{ fontSize: `${(zoomLevel / 100) * 13}px` }}
        >
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#ebebeb] dark:border-white/[0.06]">
              <span className="text-[11px] font-semibold text-[#999] dark:text-[#555] uppercase tracking-widest">{document?.file_name}</span>
              <span className="text-[11px] text-[#bbb] dark:text-[#444] tabular-nums">p. {currentPage}</span>
            </div>
            <div className="whitespace-pre-line leading-[1.75] text-[#222] dark:text-[#ccc]">
              {textContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-white/[0.05] flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-[#bbb] dark:text-[#444]" />
          </div>
          <h3 className="text-[14px] font-semibold text-[#111] dark:text-white mb-1">{t.noDocOpened}</h3>
          <p className="text-[12.5px] text-[#999] dark:text-[#666] max-w-[240px] leading-relaxed mb-5">{t.uploadPrompt}</p>
          <button
            onClick={onOpenUpload}
            className="btn-primary"
          >
            {t.uploadDocBtn}
          </button>
        </div>
      )}

      {/* Floating Text Selection Action Bar */}
      {selectionPosition && (
        <div
          className="absolute z-50 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-white/[0.1] rounded-lg shadow-lg px-1 py-1 flex items-center gap-0.5"
          style={{ top: `${selectionPosition.top}px`, left: `${selectionPosition.left}px` }}
        >
          {[
            { action: 'explain', label: t.explain, icon: Sparkles },
            { action: 'chat', label: t.chatAction, icon: MessageSquare },
            { action: 'quiz', label: t.quizAction, icon: HelpCircle },
            { action: 'flashcards', label: t.flashcards, icon: BookOpen },
          ].map(({ action, label, icon: Icon }) => (
            <button
              key={action}
              onClick={() => triggerAction(action)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-[#666] dark:text-[#888] hover:text-[#111] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/[0.07] transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { MessageSquare, BookOpen, HelpCircle, Radio, FileText, Send, Paperclip, Mic, ChevronRight, BarChart2, Zap, Sparkles } from 'lucide-react';
import { QuizView } from './QuizView';
import { PodcastView } from './PodcastView';
import { FlashcardView } from './FlashcardView';
import { SummaryView } from './SummaryView';
import { ExpectedExamView } from './ExpectedExamView';
import { AnalyticsView } from './AnalyticsView';
import { InteractiveLearningView } from './InteractiveLearningView';
import { VoiceMode } from './VoiceMode';
import { MessageList } from '../chat/MessageList';
import { translations, Language } from '@/i18n/translations';

interface ToolPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
  isGenerating: boolean;
  onSendMessage: (msg: string) => void;
  quizData?: any;
  podcastData?: any;
  flashcardData?: any;
  summaryData?: any;
  examData?: any;
  onGenerateQuiz?: () => void;
  onGeneratePodcast?: () => void;
  onGenerateFlashcards?: () => void;
  onGenerateSummary?: () => void;
  onGenerateExam?: () => void;
  language?: Language;
  defaultModel?: string;
}

export function ToolPanel({
  activeTab, onTabChange, messages, isGenerating, onSendMessage,
  quizData, podcastData, flashcardData, summaryData, examData,
  onGenerateQuiz, onGeneratePodcast, onGenerateFlashcards, onGenerateSummary, onGenerateExam,
  language = 'en', defaultModel = 'GPT-5'
}: ToolPanelProps) {
  const [inputText, setInputText] = useState('');
  const t = translations[language] || translations.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) { onSendMessage(inputText.trim()); setInputText(''); }
  };

  const tabs = [
    { id: 'chat',        label: t.chat,        icon: MessageSquare },
    { id: 'flashcards',  label: t.flashcards,  icon: BookOpen },
    { id: 'quizzes',     label: t.quizzes,     icon: HelpCircle },
    { id: 'interactive', label: 'Interactive', icon: Zap },
    { id: 'podcast',     label: t.podcast,     icon: Radio },
    { id: 'summary',     label: t.summary,     icon: FileText },
    { id: 'expected',    label: t.expected || 'Expected', icon: Sparkles },
    { id: 'analytics',   label: 'Analytics',   icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111]">

      {/* Tab bar — non-scrollable, all 8 features visible */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-0.5 px-2 pt-2 pb-0 border-b border-[#e8e8e8] dark:border-white/[0.06] w-full bg-white dark:bg-[#111] shrink-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-0.5 text-[11px] font-medium border-b-2 transition-all w-full truncate ${
                isActive
                  ? 'border-[#111] dark:border-white text-[#111] dark:text-white bg-[#f7f7f7] dark:bg-white/[0.04]'
                  : 'border-transparent text-[#888] dark:text-[#666] hover:text-[#333] dark:hover:text-[#aaa]'
              }`}
              title={tab.label}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full overflow-y-auto">
            <MessageList messages={messages as any} isGenerating={isGenerating} />
          </div>
        )}
        {activeTab === 'quizzes'    && <QuizView quizData={quizData} onGenerateNewQuiz={onGenerateQuiz} />}
        {activeTab === 'podcast'    && <PodcastView podcastData={podcastData} onGeneratePodcast={onGeneratePodcast} />}
        {activeTab === 'flashcards' && <FlashcardView flashcardData={flashcardData} onGenerateNew={onGenerateFlashcards} />}
        {activeTab === 'interactive' && <InteractiveLearningView language={language} />}
        {activeTab === 'summary'    && <SummaryView summaryData={summaryData} onGenerateSummary={onGenerateSummary} />}
        {activeTab === 'expected'   && <ExpectedExamView examData={examData} onGenerateExam={onGenerateExam} />}
        {activeTab === 'analytics'  && <AnalyticsView language={language} />}
      </div>

      {/* Chat input */}
      <div className="p-3 border-t border-[#e8e8e8] dark:border-white/[0.06]">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 bg-[#f9f9f9] dark:bg-white/[0.04] border border-[#e5e5e5] dark:border-white/[0.08] rounded-xl px-3 py-2.5"
        >
          <input
            type="text"
            placeholder={t.inputPlaceholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 text-[13px] text-[#111] dark:text-[#f0f0f0] placeholder:text-[#bbb] dark:placeholder:text-[#555] bg-transparent focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="p-1 rounded-md text-[#ccc] dark:text-[#444] hover:text-[#888] dark:hover:text-[#888] transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <VoiceMode onTranscript={(text) => setInputText(prev => prev + (prev ? ' ' : '') + text)} />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-6 h-6 rounded-lg bg-[#111] dark:bg-white flex items-center justify-center disabled:opacity-30 hover:bg-[#333] dark:hover:bg-[#e8e8e8] transition-colors"
            >
              <Send className="w-3 h-3 text-white dark:text-[#111]" />
            </button>
          </div>
        </form>
        <p className="text-[10.5px] text-[#bbb] dark:text-[#444] mt-1.5 px-0.5">{defaultModel}</p>
      </div>
    </div>
  );
}

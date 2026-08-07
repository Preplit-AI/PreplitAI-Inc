import React from 'react';
import { Plus, Upload, BrainCircuit, BookOpen, Radio, Sparkles, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Space {
  id: string;
  name: string;
  documentCount?: number;
  lastAccessed?: string;
}

interface WorkspaceHomeProps {
  onCreateSpace: () => void;
  onSelectSpace: (spaceId: string) => void;
  onUploadContent: () => void;
  spaces: Space[];
}

export function WorkspaceHome({ onCreateSpace, onSelectSpace, onUploadContent, spaces }: WorkspaceHomeProps) {
  const { language } = useLanguage();
  const isKo = language === 'ko';
  const displaySpaces = spaces;

  const quickActions = [
    { icon: BrainCircuit, label: isKo ? '퀴즈 시작' : 'Start a Quiz', desc: isKo ? '실력 테스트' : 'Test your knowledge' },
    { icon: BookOpen, label: isKo ? '플래시카드 복습' : 'Review Flashcards', desc: isKo ? '간격 반복 학습' : 'Spaced repetition' },
    { icon: Radio, label: isKo ? '팟캐스트 듣기' : 'Listen to Podcast', desc: isKo ? '이동 중 청취 학습' : 'Learn on the go' },
    { icon: Sparkles, label: isKo ? '예상문제 예측' : 'Predict Exam', desc: isKo ? '기출 변형 문제 생성' : 'Generate mock questions' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#0f0f0f] text-[#111] dark:text-[#f0f0f0] p-6 md:p-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="space-y-6 pt-6">
          <div className="space-y-2">
            <h2 className="text-[15px] font-medium text-[#666] dark:text-[#999]">
              {isKo ? '환영합니다' : 'Welcome back'}
            </h2>
            <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight">
              {isKo ? '오늘 어떤 내용을 학습하시겠습니까?' : 'What do you want to learn today?'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={onCreateSpace} className="gap-2 bg-[#111] text-white hover:bg-[#333] dark:bg-white dark:text-[#111] dark:hover:bg-[#e8e8e8] rounded-xl px-5 py-5 h-11">
              <Plus className="w-4 h-4" />
              <span className="text-[13.5px] font-medium">{isKo ? '새 스페이스 생성' : 'Create New Space'}</span>
            </Button>
            <Button onClick={onUploadContent} variant="outline" className="gap-2 rounded-xl px-5 py-5 h-11 border-[#e8e8e8] dark:border-white/[0.1] bg-white dark:bg-[#111]">
              <Upload className="w-4 h-4" />
              <span className="text-[13.5px] font-medium">{isKo ? '콘텐츠 업로드' : 'Upload Content'}</span>
            </Button>
          </div>
        </div>

        {/* Recent Spaces Section */}
        <div className="space-y-4">
          <h3 className="text-[13px] font-semibold tracking-wide uppercase text-[#888] dark:text-[#666]">
            {isKo ? '최근 스페이스' : 'Recent Spaces'}
          </h3>
          {displaySpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displaySpaces.slice(0, 3).map(space => (
                <button
                  key={space.id}
                  onClick={() => onSelectSpace(space.id)}
                  className="flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-[#111] border border-[#e8e8e8] dark:border-white/[0.06] hover:border-[#ccc] dark:hover:border-white/[0.2] hover:shadow-sm transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-white/[0.05] flex items-center justify-center mb-4">
                    <Folder className="w-5 h-5 text-[#666] dark:text-[#999]" />
                  </div>
                  <h4 className="text-[15px] font-semibold mb-1 truncate w-full">{space.name}</h4>
                  <div className="flex items-center gap-2 text-[12.5px] text-[#888] dark:text-[#666]">
                    <span>{space.documentCount ?? 0} {isKo ? '개 문서' : 'documents'}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#111] border border-dashed border-[#e8e8e8] dark:border-white/[0.08] rounded-2xl">
              <Folder className="w-8 h-8 text-[#aaa] dark:text-[#555] mx-auto mb-2" />
              <p className="text-[13.5px] font-medium text-[#666] dark:text-[#aaa]">
                {isKo ? '생성된 스페이스가 없습니다' : 'No spaces created yet'}
              </p>
              <p className="text-[12px] text-[#999] dark:text-[#666] mt-1">
                {isKo ? '첫 번째 스페이스를 생성하여 학습을 시작해보세요' : 'Create your first study space to get started'}
              </p>
              <Button onClick={onCreateSpace} size="sm" className="mt-4 rounded-xl bg-[#111] text-white dark:bg-white dark:text-[#111]">
                <Plus className="w-4 h-4 mr-1.5" /> {isKo ? '스페이스 생성' : 'Create Space'}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions Section — Fits cleanly with no cutoffs */}
        <div className="space-y-4 pb-8">
          <h3 className="text-[13px] font-semibold tracking-wide uppercase text-[#888] dark:text-[#666]">
            {isKo ? '빠른 실행' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="flex flex-col items-center justify-center p-4 min-h-[110px] rounded-2xl bg-white dark:bg-[#111] border border-[#e8e8e8] dark:border-white/[0.06] hover:border-[#ccc] dark:hover:border-white/[0.2] transition-all group text-center"
              >
                <action.icon className="w-5 h-5 mb-2 text-[#555] dark:text-[#aaa] group-hover:text-[#111] dark:group-hover:text-white transition-colors shrink-0" />
                <span className="text-[13px] font-semibold text-[#111] dark:text-white leading-tight">{action.label}</span>
                <span className="text-[11px] text-[#888] dark:text-[#777] mt-1 leading-normal max-w-full px-1">{action.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

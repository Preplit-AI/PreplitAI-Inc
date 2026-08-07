import React from 'react';
import { BookOpen, ArrowRight, Sparkles, Clock, User, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Blog() {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const posts = [
    {
      id: 'gks-scholar-study-guide',
      title: isKo
        ? 'GKS 장학생 및 외국인 유학생을 위한 전공 수업 AI 학습 가이드'
        : 'The Ultimate AI Study Guide for GKS Scholars & International Students in Korea',
      excerpt: isKo
        ? '한국 대학 강의 슬라이드와 한국어 전공 용어를 AI 스터디 스페이스로 빠르게 극복하고 A+를 받는 5가지 검증된 전략.'
        : '5 battle-tested strategies to master Korean-language lecture slides, technical terminology, and ace midterms with grounded AI tutoring.',
      category: isKo ? '학업 전략' : 'Study Strategy',
      readTime: '6 min read',
      author: 'PreplitAI Research Team',
      date: 'Aug 2026',
      featured: true,
    },
    {
      id: 'active-recall-vs-passive-reading',
      title: isKo
        ? '왜 단순 읽기는 실패하는가: 능동적 인출(Active Recall)과 AI 퀴즈의 과학'
        : 'Why Re-Reading Fails: The Cognitive Science of Active Recall & AI Assessment',
      excerpt: isKo
        ? '교재를 반복해서 읽는 착시 효과를 깨고, 간격 반복(SRS)과 AI 맞춤 퀴즈로 인지 기억 정착률을 80% 이상 높이는 방법.'
        : 'Break free from the illusion of competence. Discover how spaced repetition and qualitative AI feedback boost retention by 80%.',
      category: isKo ? '인지과학' : 'Learning Science',
      readTime: '8 min read',
      author: 'EdTech Cognitive Lab',
      date: 'Aug 2026',
      featured: false,
    },
    {
      id: 'how-to-predict-midterm-questions',
      title: isKo
        ? '족보와 기출문제 분석으로 2026년 중간고사 출제 예상 문제 예측하기'
        : 'How to Predict University Exam Questions Using Past Midterms (Jokbo) & AI',
      excerpt: isKo
        ? '교수의 기출 패턴과 슬라이드 강조 포인트를 AI 분석으로 패턴화하여 실전 시험 문제 유형을 적중시키는 프레임워크.'
        : 'Learn how AI pattern detection maps professor emphasis areas across semesters to build targeted mock exams.',
      category: isKo ? '시험 대비' : 'Exam Preparation',
      readTime: '5 min read',
      author: 'PreplitAI Academic Lead',
      date: 'Jul 2026',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col">
      {/* Hero Header */}
      <section className="pt-28 pb-16 px-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#111]/50">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#630000]/10 dark:bg-[#ff9999]/10 text-[#630000] dark:text-[#ff9999] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isKo ? 'PreplitAI 학업 인사이트 & 가이드' : 'PreplitAI Academic Insights'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {isKo ? '스마트 학습 & 인지과학 블로그' : 'Blog & Learning Strategy Guides'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {isKo
              ? '한국 대학생과 외국인 유학생을 위한 최신 AI 학업법, 시험 예측 가이드, 그리고 학습 인지과학 인사이트를 만나보세요.'
              : 'Explore the latest AI study strategies, exam prediction frameworks, and cognitive learning science research built for university students.'}
          </p>
        </div>
      </section>

      {/* Main Blog Post Feed */}
      <section className="py-16 px-6 max-w-5xl mx-auto flex-1 w-full space-y-12">
        {/* Featured Post */}
        {posts.filter(p => p.featured).map(post => (
          <div key={post.id} className="relative rounded-3xl bg-gray-950 text-white p-8 sm:p-10 overflow-hidden shadow-2xl border border-gray-800 group">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#c84040]">
                <span className="px-3 py-1 rounded-full bg-[#c84040]/15 uppercase tracking-wider">{post.category}</span>
                <span>•</span>
                <span className="text-gray-400">{post.readTime}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight group-hover:text-gray-200 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-400 text-base leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
              <div className="pt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span>{post.author}</span> · <span>{post.date}</span>
                </div>
                <Button asChild className="rounded-full bg-white text-black hover:bg-gray-100 font-semibold text-xs px-5 h-9">
                  <a href="/preplitai-chat" className="flex items-center gap-1.5">
                    <span>{isKo ? '가이드 읽고 시작하기' : 'Read & Try Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {posts.filter(p => !p.featured).map(post => (
            <div key={post.id} className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] hover:border-gray-400 dark:hover:border-gray-600 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-[#630000] dark:text-[#ff9999]">{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold leading-snug group-hover:text-[#630000] dark:group-hover:text-[#ff9999] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-6 flex items-center justify-between text-xs text-gray-500">
                <span>{post.date}</span>
                <a href="/preplitai-chat" className="font-semibold text-black dark:text-white flex items-center gap-1 group-hover:underline">
                  <span>{isKo ? '더 보기' : 'Read Article'}</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

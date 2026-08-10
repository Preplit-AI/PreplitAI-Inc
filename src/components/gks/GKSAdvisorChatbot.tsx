import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_BASE_URL } from '@/constants/config';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GKSAdvisorChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GKSAdvisorChatbot({ isOpen, onClose }: GKSAdvisorChatbotProps) {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: isKo
        ? '안녕하세요. Preplit AI GKS2026 어드바이저입니다.\n\n공관전형과 대학전형의 차이, TOPIK/IELTS 점수, 아포스티유 공증, 자기소개서(Form 2) 작성법 등에 대해 자유롭게 문의하세요.'
        : 'Hello. I am your Preplit AI GKS2026 Advisor.\n\nAsk any question regarding application tracks, TOPIK/IELTS scores, Apostille authentication, or Form 2 & 3 essay strategies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/gks/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: 'asst-' + Date.now(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'asst-' + Date.now(),
            role: 'assistant',
            content: isKo
              ? 'GKS2026 주요 안내:\n• 공관전형: 3개 지망 대학 선택 (Type A 2개 + Type B 1개 이상 권장)\n• 대학전형: 단일 1개 목표 학과 direct 지원\n• 어학 가산점: TOPIK 3급 이상 또는 IELTS 6.5+ 보유 시 가산점 부여\n• 필수 제출 서류는 공증(Apostille 또는 영사확인)이 필수입니다.'
              : 'GKS2026 Key Selection Guidance:\n• Embassy Track: Choose up to 3 universities (at least 1 Type B university required).\n• University Track: Apply directly to 1 target department.\n• Language Bonus: TOPIK Level 3+ or IELTS 6.5+ grants evaluation preference points.\n• Graduation and transcript certificates must be Apostilled or Consular Authenticated.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: isKo
            ? 'GKS2026 주요 안내:\n• 공관전형: 3개 지망 대학 선택 (Type A 2개 + Type B 1개 이상 권장)\n• 대학전형: 단일 1개 목표 학과 direct 지원\n• 어학 가산점: TOPIK 3급 이상 또는 IELTS 6.5+ 보유 시 가산점 부여\n• 필수 제출 서류는 공증(Apostille 또는 영사확인)이 필수입니다.'
            : 'GKS2026 Key Selection Guidance:\n• Embassy Track: Choose up to 3 universities (at least 1 Type B university required).\n• University Track: Apply directly to 1 target department.\n• Language Bonus: TOPIK Level 3+ or IELTS 6.5+ grants evaluation preference points.\n• Graduation and transcript certificates must be Apostilled or Consular Authenticated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isKo ? '복사되었습니다.' : 'Copied');
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        content: isKo
          ? '대화가 초기화되었습니다. 질문을 입력해 주세요.'
          : 'Conversation reset. Ask any question about GKS 2026.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[380px] h-[520px] flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
      
      {/* PURE BLACK HEADER BAR WITH OFFICIAL PREPLITAI LOGO */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="PreplitAI" className="w-6 h-6 object-contain" style={{filter:'brightness(0) invert(1)'}} />
          </span>
          <div>
            <span className="font-bold text-[13px] tracking-tight text-white block leading-tight">PreplitAI Advisor</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              GKS 2026 Expert
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button
            onClick={handleClearHistory}
            className="hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MINIMAL CHIPS */}
      <div className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 px-3 py-2 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
        {[
          { label: 'Embassy vs University' },
          { label: 'TOPIK & IELTS' },
          { label: 'Form 2 (PS)' },
          { label: 'Apostille' }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.label)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-[10px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-white dark:bg-[#0a0a0a] text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                  : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>

              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopyText(msg.content)}
                  className="mt-1.5 text-[9px] font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 block text-right"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-black dark:border-t-white animate-spin" />
            <span>PreplitAI Advisor is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-2.5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={isKo ? '질문을 입력하세요...' : 'Ask a question...'}
            disabled={loading}
            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs rounded-full h-8 px-3"
          />
          <Button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-xs rounded-full h-8 px-3.5 shrink-0"
          >
            <span>{isKo ? '전송' : 'Send'}</span>
          </Button>
        </form>
      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder, FileText, MessageSquare, ChevronRight, X } from 'lucide-react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (id: string, type: string) => void;
}

const MOCK_DATA = [
  { id: '1', title: 'Biology 101', type: 'space', subtitle: 'Space', icon: Folder },
  { id: '2', title: 'Introduction to Algorithms', type: 'space', subtitle: 'Space', icon: Folder },
  { id: '3', title: 'Cellular Respiration Notes', type: 'document', subtitle: 'Biology 101', icon: FileText },
  { id: '4', title: 'Midterm Practice Quiz', type: 'document', subtitle: 'Biology 101', icon: FileText },
  { id: '5', title: 'Dijkstra Algorithm Summary', type: 'document', subtitle: 'Introduction to Algorithms', icon: FileText },
  { id: '6', title: 'Sorting Algorithms Cheat Sheet', type: 'document', subtitle: 'Introduction to Algorithms', icon: FileText },
  { id: '7', title: 'Chat about Photosynthesis', type: 'chat', subtitle: 'Recent Chat', icon: MessageSquare },
  { id: '8', title: 'Chat about Dynamic Programming', type: 'chat', subtitle: 'Recent Chat', icon: MessageSquare },
];

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = MOCK_DATA.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults.length > 0) {
          const selected = filteredResults[selectedIndex];
          onNavigate?.(selected.id, selected.type);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-xl shadow-2xl border border-gray-200 dark:border-white/[0.06] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-white/[0.06]">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spaces, documents, or recent chats..."
            className="flex-1 bg-transparent border-none outline-none px-3 text-base text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === '' && filteredResults.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              Search across all your study materials
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate?.(item.id, item.type);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</span>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400">
                      {item.type}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-gray-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02]">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02]">↵</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02]">esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FileText, Video, Link as LinkIcon, Mic, MoreVertical, Plus, ListFilter, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Document {
  id: string | number;
  file_name: string;
  type: string;
}

interface ResourceLibraryProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  onUpload: () => void;
}

export function ResourceLibrary({ documents, onSelectDocument, onUpload }: ResourceLibraryProps) {
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'type'>('recent');

  const getFileIcon = (fileName: string, type: string) => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('youtube') || type === 'youtube') return Video;
    if (nameLower.endsWith('.mp3') || nameLower.endsWith('.wav') || type === 'audio') return Mic;
    if (nameLower.startsWith('http')) return LinkIcon;
    return FileText;
  };

  // Mock metadata for UI
  const getMockMetadata = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) || 0 : id;
    const isVideo = numId % 3 === 0;
    return {
      date: `Oct ${Math.max(1, (numId % 30) + 1)}, 2024`,
      size: isVideo ? '15:24 duration' : `${(numId % 10) + 2} pages`,
      badgeType: isVideo ? 'Video' : 'Document'
    };
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortOption === 'name') return a.file_name.localeCompare(b.file_name);
    if (sortOption === 'type') return a.type.localeCompare(b.type);
    return 0; // Default to recent (assumes original array is chronological)
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafafa] dark:bg-[#0f0f0f] text-[#111] dark:text-[#f0f0f0]">
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#e8e8e8] dark:border-white/[0.06] bg-white dark:bg-[#111]">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold">Resources</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-white/[0.1] text-[12px] font-medium text-[#666] dark:text-[#aaa]">
            {documents.length} files
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e8e8e8] dark:border-white/[0.1] bg-[#fafafa] dark:bg-[#1a1a1a]">
            <ArrowDownUp className="w-3.5 h-3.5 text-[#888]" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-[13px] font-medium outline-none text-[#555] dark:text-[#aaa]"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
          </div>
          <Button onClick={onUpload} className="gap-1.5 rounded-xl bg-[#111] text-white hover:bg-[#333] dark:bg-white dark:text-[#111] dark:hover:bg-[#e8e8e8] px-4 py-1.5 h-auto">
            <Plus className="w-4 h-4" />
            <span className="text-[13px] font-medium">Add Content</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#f0f0f0] dark:bg-white/[0.05] flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-[#999] dark:text-[#666]" />
            </div>
            <h3 className="text-[16px] font-semibold mb-2">No resources yet</h3>
            <p className="text-[13.5px] text-[#666] dark:text-[#999] mb-6">
              Upload documents, import YouTube links, or paste text to start building your study space.
            </p>
            <Button onClick={onUpload} className="bg-[#111] text-white hover:bg-[#333] dark:bg-white dark:text-[#111] rounded-xl px-5 py-5 w-full">
              Upload your first document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedDocuments.map((doc) => {
              const Icon = getFileIcon(doc.file_name, doc.type);
              const meta = getMockMetadata(doc.id);
              
              return (
                <button
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-[#111] border border-[#e8e8e8] dark:border-white/[0.06] hover:border-[#ccc] dark:hover:border-white/[0.2] hover:shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-white/[0.05] flex items-center justify-center group-hover:bg-[#111] dark:group-hover:bg-white transition-colors">
                      <Icon className="w-5 h-5 text-[#666] dark:text-[#999] group-hover:text-white dark:group-hover:text-[#111] transition-colors" />
                    </div>
                    <button className="p-1.5 text-[#aaa] hover:text-[#111] dark:hover:text-white rounded-md hover:bg-[#f5f5f5] dark:hover:bg-white/[0.1] transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-[14px] font-semibold leading-snug mb-1.5 line-clamp-2" title={doc.file_name}>
                    {doc.file_name}
                  </h4>
                  <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#f5f5f5] dark:bg-white/[0.05] text-[11px] font-medium text-[#666] dark:text-[#aaa]">
                      {meta.badgeType}
                    </span>
                    <span className="text-[11.5px] text-[#999] dark:text-[#666]">{meta.date}</span>
                    <span className="text-[11.5px] text-[#999] dark:text-[#666]">•</span>
                    <span className="text-[11.5px] text-[#999] dark:text-[#666]">{meta.size}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

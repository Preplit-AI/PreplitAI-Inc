import React, { useState } from 'react';
import { List, AlignLeft, Search, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onAskAboutVideo?: (question: string) => void;
}

export function VideoPlayer({ videoUrl, title = 'YouTube Video', onAskAboutVideo }: VideoPlayerProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'chapters'>('transcript');
  const [chatInput, setChatInput] = useState('');

  // Extract video ID for iframe
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ'; // Fallback
  };
  const videoId = extractVideoId(videoUrl);

  // Mock data
  const transcript = [
    { time: '00:00', text: "Welcome everyone to our introductory lecture on cellular biology. Today we'll be discussing the fundamental unit of life." },
    { time: '01:15', text: "Let's start by looking at the cell membrane. It's a semi-permeable lipid bilayer that regulates what enters and exits." },
    { time: '03:42', text: "Moving on to the nucleus, this is often called the control center of the cell because it houses the genetic material." },
    { time: '06:20', text: "The mitochondria, as many of you know from high school biology, is the powerhouse of the cell, generating ATP through cellular respiration." },
    { time: '10:05', text: "Finally, let's contrast animal cells with plant cells, focusing specifically on chloroplasts and the rigid cell wall." }
  ];

  const chapters = [
    { time: '00:00', title: 'Introduction', desc: 'Overview of cell theory and basic structures.' },
    { time: '01:15', title: 'Cell Membrane', desc: 'Lipid bilayer and transport mechanisms.' },
    { time: '03:42', title: 'The Nucleus', desc: 'DNA storage and transcription processes.' },
    { time: '06:20', title: 'Mitochondria', desc: 'Energy production and ATP synthesis.' },
    { time: '10:05', title: 'Plant vs Animal Cells', desc: 'Key structural differences.' }
  ];

  const handleSeek = (time: string) => {
    console.log(`Seek to ${time}`);
    // In a real implementation, this would communicate with the YouTube IFrame API
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && onAskAboutVideo) {
      onAskAboutVideo(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden">
      {/* Video Embed */}
      <div className="w-full aspect-video bg-black shrink-0 relative">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e8e8] dark:border-white/[0.06] shrink-0">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors ${activeTab === 'transcript' ? 'text-[#111] dark:text-white border-b-2 border-[#111] dark:border-white' : 'text-[#888] hover:text-[#555] dark:text-[#666] dark:hover:text-[#999]'}`}
        >
          <AlignLeft className="w-4 h-4" />
          Transcript
        </button>
        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors ${activeTab === 'chapters' ? 'text-[#111] dark:text-white border-b-2 border-[#111] dark:border-white' : 'text-[#888] hover:text-[#555] dark:text-[#666] dark:hover:text-[#999]'}`}
        >
          <List className="w-4 h-4" />
          Chapters
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'transcript' ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {transcript.map((item, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => handleSeek(item.time)}>
                <div className="shrink-0 pt-0.5">
                  <span className="px-2 py-1 rounded bg-[#f5f5f5] dark:bg-white/[0.05] text-[11px] font-mono text-[#666] dark:text-[#aaa] group-hover:bg-[#e0e0e0] dark:group-hover:bg-white/[0.1] transition-colors">
                    {item.time}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-[#333] dark:text-[#ccc] group-hover:text-[#111] dark:group-hover:text-white transition-colors">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {chapters.map((chapter, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl border border-transparent hover:border-[#e8e8e8] dark:hover:border-white/[0.06] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] cursor-pointer transition-all" onClick={() => handleSeek(chapter.time)}>
                <div className="shrink-0 flex flex-col items-center gap-1 w-12 pt-1">
                  <Clock className="w-4 h-4 text-[#888]" />
                  <span className="text-[11px] font-mono text-[#888]">{chapter.time}</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-[#111] dark:text-white mb-1">{chapter.title}</h4>
                  <p className="text-[12.5px] text-[#666] dark:text-[#999] leading-snug">{chapter.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-[#e8e8e8] dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#111]">
        <form onSubmit={handleChatSubmit} className="max-w-2xl mx-auto relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-[#999] pointer-events-none" />
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question about this video..."
            className="w-full bg-[#f5f5f5] dark:bg-white/[0.05] border border-transparent focus:border-[#ccc] dark:focus:border-white/[0.2] rounded-xl pl-10 pr-12 py-3 text-[13px] outline-none transition-all placeholder:text-[#999]"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="absolute right-2 p-2 rounded-lg text-[#111] dark:text-white hover:bg-[#e0e0e0] dark:hover:bg-white/[0.1] disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

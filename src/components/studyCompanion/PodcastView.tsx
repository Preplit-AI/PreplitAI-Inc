import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Download, Eye, Sparkles, Compass, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpisodeLine {
  speaker: string;
  timestamp: string;
  text: string;
}

interface PodcastViewProps {
  podcastData?: {
    title?: string;
    duration?: string;
    episodes?: EpisodeLine[];
  } | null;
  onGeneratePodcast?: () => void;
}

export function PodcastView({ podcastData, onGeneratePodcast }: PodcastViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const activeLineRef = useRef<HTMLDivElement>(null);

  const episodes = podcastData?.episodes || [];

  if (episodes.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white p-8 items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-800 flex items-center justify-center shadow-2xs">
          <Radio className="w-6 h-6" />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-sm">No Audio Podcast Generated</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Generate an engaging two-speaker audio discussion of your course material powered by ElevenLabs neural voices.
          </p>
        </div>
        <Button 
          onClick={onGeneratePodcast}
          className="mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium text-xs px-6 py-2.5 shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-white" /> Generate Podcast Episode
        </Button>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(t => (t < duration ? t + 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  useEffect(() => {
    if (autoScroll && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6">
      {/* Podcast Audio Player Header */}
      <div className="space-y-4 border-b border-gray-100 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{podcastData?.title || "The Genetic Code and Translation"}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{formatTime(currentTime)} / {formatTime(duration)}</p>
          </div>
          <button 
            onClick={onGeneratePodcast}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Download Podcast"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="relative">
          <input 
            type="range" 
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B01232]"
          />
        </div>

        {/* Audio Controls (Matching Screenshot 2) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentTime(t => Math.max(0, t - 10))} className="text-gray-500 hover:text-gray-800">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-transform active:scale-95 shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={() => setCurrentTime(t => Math.min(duration, t + 10))} className="text-gray-500 hover:text-gray-800">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <select 
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-gray-700 font-semibold"
            >
              <option value="0.8x">0.8x</option>
              <option value="1x">1x</option>
              <option value="1.25x">1.25x</option>
              <option value="1.5x">1.5x</option>
            </select>
            <Volume2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-800" />
          </div>
        </div>

        {/* Options Toggles */}
        <div className="flex items-center justify-between pt-2 text-xs text-gray-500 font-medium border-t border-gray-100">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1.5 hover:text-gray-800"
          >
            <Eye className="w-3.5 h-3.5" />
            {showTranscript ? "Hide Transcript" : "Show Transcript"}
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 ${autoScroll ? 'text-emerald-700 font-semibold' : 'hover:text-gray-800'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto Scroll
            </button>
            <button className="flex items-center gap-1.5 hover:text-gray-800">
              <Compass className="w-3.5 h-3.5" />
              Track Sources
            </button>
          </div>
        </div>
      </div>

      {/* Scrolling Interactive Transcript */}
      {showTranscript && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {episodes.map((ep, idx) => {
            const isCurrent = idx === 1; // Highlight active line
            return (
              <div 
                key={idx}
                ref={isCurrent ? activeLineRef : null}
                className={`p-3.5 rounded-2xl transition-all ${
                  isCurrent 
                    ? 'bg-gray-100/90 border border-gray-200 shadow-2xs' 
                    : 'hover:bg-gray-50/70'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                  <span className={ep.speaker === 'Laomedeia' ? 'text-[#B01232]' : 'text-blue-700'}>{ep.speaker}</span>
                  <span className="text-gray-400 font-normal font-mono">{ep.timestamp}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-sans">
                  {ep.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Mic } from 'lucide-react';

interface VoiceModeProps {
  onTranscript: (text: string) => void;
  isSupported?: boolean;
}

export function VoiceMode({ onTranscript, isSupported = true }: VoiceModeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRecording = useCallback(() => {
    if (!isSupported) {
      setError('Voice input not supported in this browser');
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setError(null);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          onTranscript(text);
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setError('Error recognizing speech');
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        try {
          recognition.start();
        } catch (e) {
          console.error(e);
          setIsRecording(false);
        }
      } else {
        // Mock fallback
        setTimeout(() => {
          onTranscript("This is a simulated voice input.");
          setIsRecording(false);
        }, 2000);
      }
    }
  }, [isRecording, isSupported, onTranscript]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={toggleRecording}
        title={isRecording ? 'Listening...' : 'Tap to speak'}
        className={`p-1 rounded-md transition-all flex items-center justify-center ${
          isRecording 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' 
            : 'text-[#ccc] dark:text-[#444] hover:text-[#888] dark:hover:text-[#888] hover:bg-gray-100 dark:hover:bg-white/[0.04]'
        }`}
      >
        <Mic className="w-3.5 h-3.5" />
      </button>
      
      {isRecording && (
        <span className="absolute -top-8 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          Listening...
        </span>
      )}
      
      {error && !isRecording && (
        <span className="absolute -top-8 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {error}
        </span>
      )}
    </div>
  );
}

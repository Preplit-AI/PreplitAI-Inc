import React, { useState } from 'react';
import { Upload, Link, Type, Mic, FileText, X, Sparkles, CheckCircle2, Play, Square, PlayCircle, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadModalProps {
  spaceId: number;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function UploadModal({ spaceId, isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [method, setMethod] = useState<'file' | 'link' | 'paste' | 'record'>('file');
  const [docType, setDocType] = useState<'course_material' | 'past_exam'>('course_material');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordedBlob(null);
      
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      setError('Microphone access denied or not supported');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerInterval) clearInterval(timerInterval);
    }
  };

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder, isRecording, timerInterval]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('upload_method', method);
      formData.append('type', docType);

      if (method === 'file' && file) {
        formData.append('file', file);
      } else if (method === 'paste') {
        formData.append('text_content', textContent);
      } else if (method === 'link') {
        formData.append('text_content', textContent);
        if (textContent.includes('youtube.com') || textContent.includes('youtu.be')) {
          formData.set('type', 'youtube');
        }
      } else if (method === 'record' && recordedBlob) {
        formData.append('file', recordedBlob, 'recording.webm');
      }

      const res = await fetch(`http://localhost:5000/api/spaces/${spaceId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Upload failed');
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Add Content to Space</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select upload method and tag content type</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Content Add Method Cards (Matching PART 3.1) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            type="button"
            onClick={() => setMethod('file')}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              method === 'file' ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-2xs font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Upload className={`w-5 h-5 mb-2 ${method === 'file' ? 'text-gray-900' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold text-xs">Upload File</div>
              <div className="text-2xs text-gray-500">PDF, Word, Images</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setMethod('link')}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              method === 'link' ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-2xs font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Link className={`w-5 h-5 mb-2 ${method === 'link' ? 'text-gray-900' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold text-xs">Import Link</div>
              <div className="text-2xs text-gray-500">YouTube, Website</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setMethod('paste')}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              method === 'paste' ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-2xs font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Type className={`w-5 h-5 mb-2 ${method === 'paste' ? 'text-gray-900' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold text-xs">Paste Text</div>
              <div className="text-2xs text-gray-500">Direct notes entry</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setMethod('record')}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              method === 'record' ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-2xs font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Mic className={`w-5 h-5 mb-2 ${method === 'record' ? 'text-gray-900' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold text-xs">Record Lecture</div>
              <div className="text-2xs text-gray-500">Live Whisper transcript</div>
            </div>
          </button>
        </div>

        {/* Mandatory Document Tagging Section (PART 2.2 & PART 3.1) */}
        <div className="space-y-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
          <label className="text-xs font-semibold text-amber-900 flex items-center justify-between">
            <span>Mandatory Tag: Document Classification</span>
            <span className="text-2xs text-amber-700 font-normal">*Required for Expected Questions</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDocType('course_material')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                docType === 'course_material' 
                  ? 'border-emerald-500 bg-white text-emerald-900 shadow-2xs font-semibold' 
                  : 'border-gray-200 bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Course Material
            </button>
            <button
              type="button"
              onClick={() => setDocType('past_exam')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                docType === 'past_exam' 
                  ? 'border-amber-500 bg-white text-amber-900 shadow-2xs font-semibold' 
                  : 'border-gray-200 bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Past Exam (Jokbo)
            </button>
          </div>
        </div>

        {/* Input Controls depending on method */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'file' && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors">
              <input 
                type="file" 
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">
                  {file ? file.name : "Click to choose PDF or lecture slides"}
                </span>
                <span className="text-2xs text-gray-400">PDF, TXT up to 10MB</span>
              </label>
            </div>
          )}

          {method === 'paste' && (
            <textarea
              rows={4}
              placeholder="Paste notes text directly..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          )}

          {method === 'link' && (
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {textContent && !textContent.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/) && (
                <p className="text-2xs text-amber-600">Please enter a valid YouTube URL</p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          {method === 'record' && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl">
              {!recordedBlob ? (
                <>
                  <div className="mb-4 text-2xl font-mono text-gray-700">{formatDuration(recordingDuration)}</div>
                  {isRecording && (
                    <div className="flex items-end gap-1 mb-6 h-8">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-red-500 rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.max(20, Math.random() * 100)}%`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {isRecording ? (
                    <button 
                      type="button" 
                      onClick={stopRecording}
                      className="w-16 h-16 bg-red-50 text-red-600 border border-red-200 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Square className="w-6 h-6 fill-current" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startRecording}
                      className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                  <p className="mt-4 text-xs text-gray-500">
                    {isRecording ? "Recording in progress..." : "Click to start recording"}
                  </p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Audio Recording</p>
                        <p className="text-xs text-gray-500">Duration: {formatDuration(recordingDuration)}</p>
                      </div>
                    </div>
                    <button type="button" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <PlayCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <Button type="button" variant="outline" onClick={() => { setRecordedBlob(null); setRecordingDuration(0); }} className="text-xs">
                      Record Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-gray-200">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || (method === 'file' && !file) || (method === 'record' && !recordedBlob) || (method === 'link' && (!textContent || !textContent.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)))}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isUploading ? "Processing..." : (method === 'record' && recordedBlob) ? "Upload & Transcribe" : (method === 'link' ? "Import" : "Add to Space")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

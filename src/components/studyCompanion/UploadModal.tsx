import React, { useState } from 'react';
import { Upload, Link, Type, Mic, FileText, X, Sparkles, CheckCircle2 } from 'lucide-react';
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
      } else if (method === 'paste' || method === 'link') {
        formData.append('text_content', textContent);
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

          {(method === 'paste' || method === 'link') && (
            <textarea
              rows={4}
              placeholder={method === 'paste' ? "Paste notes text directly..." : "Paste YouTube URL or website link..."}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-gray-200">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || (method === 'file' && !file)}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isUploading ? "Processing..." : "Add to Space"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

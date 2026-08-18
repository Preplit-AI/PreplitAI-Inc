import React from 'react';
import { FileText, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SummaryViewProps {
  summaryData?: { summary?: string } | null;
  onGenerateSummary?: () => void;
}

export function SummaryView({ summaryData, onGenerateSummary }: SummaryViewProps) {
  const [copied, setCopied] = React.useState(false);

  const text = summaryData?.summary || null;

  if (!text) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-8 items-center justify-center text-center space-y-4">
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">No Chapter Summary Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Generate a concise, structured summary condensing key concepts and definitions from your document.
          </p>
        </div>
        <Button 
          onClick={onGenerateSummary}
          className="mt-2 bg-[#550000] hover:bg-[#3d0000] text-white rounded-xl font-medium text-xs px-6 py-2.5 shadow-sm"
        >
          Generate Summary
        </Button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" /> Chapter Summary
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xs flex items-center gap-1 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <Button onClick={onGenerateSummary} size="sm" variant="outline" className="rounded-xl border-gray-200 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 prose prose-sm text-gray-700 leading-relaxed font-sans space-y-4">
        <div className="whitespace-pre-line">
          {text}
        </div>
      </div>
    </div>
  );
}

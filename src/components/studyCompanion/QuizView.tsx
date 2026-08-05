import React, { useState } from 'react';
import { Check, HelpCircle, Sparkles, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface QuizViewProps {
  quizData?: { questions: Question[] } | null;
  onGenerateNewQuiz?: () => void;
}

export function QuizView({ quizData, onGenerateNewQuiz }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [hintText, setHintText] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = quizData?.questions || [];

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white p-8 items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-2xs">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-sm">No Quiz Generated Yet</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Generate an interactive practice quiz directly grounded in your uploaded course materials.
          </p>
        </div>
        <Button 
          onClick={onGenerateNewQuiz}
          className="mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium text-xs px-6 py-2.5 shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-white" /> Generate Quiz
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    setHintText(null);
    setIsSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleHint = (type: string) => {
    if (type === 'hint') {
      setHintText("💡 Hint: Think of Aminoacyl, Peptidyl, and Exit.");
    } else if (type === 'walkthrough') {
      setHintText("🔍 Walkthrough: During translation elongation, incoming aminoacyl-tRNA enters at A site, forms peptide bond at P site, and leaves via E site.");
    } else if (type === 'simple') {
      setHintText("✨ Simplified: The 3 letter names are A site, P site, and E site.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6">
      {/* Quiz Header & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <button onClick={onGenerateNewQuiz} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs">
            <RefreshCw className="w-3 h-3" /> New Quiz
          </button>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Box */}
      <div className="flex-1 space-y-6">
        <div className="text-base md:text-lg font-medium text-gray-800 leading-relaxed">
          {currentQuestion.question}
        </div>

        {/* Input Area */}
        {currentQuestion.type === 'fill_in_the_blank' ? (
          <div className="flex items-center gap-3">
            <input 
              type="text"
              placeholder="Type your answer here..."
              value={userInputs[currentQuestion.id] || ''}
              onChange={(e) => setUserInputs({ ...userInputs, [currentQuestion.id]: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => setUserInputs({ ...userInputs, [currentQuestion.id]: opt })}
                className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                  userInputs[currentQuestion.id] === opt 
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons: Submit / Don't Know */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => { setIsSubmitted(true); setHintText(`Correct Answer: ${currentQuestion.answer}`); }}
            className="rounded-xl border-gray-200 hover:bg-gray-100 text-gray-600 font-medium"
          >
            Don't know
          </Button>
          <Button 
            onClick={() => { setIsSubmitted(true); }}
            className="rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-medium px-6"
          >
            Submit
          </Button>
        </div>

        {/* Explanation / Result Banner */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2 animate-in fade-in duration-200">
            <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" /> Explanation
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed">{currentQuestion.explanation}</p>
            {currentIndex < questions.length - 1 && (
              <Button onClick={handleNext} size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
                Next Question <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Hint Box */}
        {hintText && !isSubmitted && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-in fade-in duration-150">
            {hintText}
          </div>
        )}

        {/* Supporting Action Pills (Matching Screenshot 1) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-gray-100">
          <button 
            onClick={() => handleHint('hint')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs transition-all"
          >
            <span className="text-gray-400 font-serif">↳</span> Give me a hint
          </button>
          <button 
            onClick={() => handleHint('walkthrough')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs transition-all"
          >
            <span className="text-gray-400 font-serif">↳</span> Walk me through it
          </button>
          <button 
            onClick={() => handleHint('simple')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs transition-all"
          >
            <span className="text-gray-400 font-serif">↳</span> Keep it simple
          </button>
        </div>
      </div>
    </div>
  );
}

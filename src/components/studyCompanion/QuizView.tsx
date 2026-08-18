import React, { useState } from 'react';
import { Check, HelpCircle, Sparkles, RefreshCw, ArrowRight, XCircle, ChevronDown, ChevronUp, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: number;
  question: string;
  type: string; // 'multiple_choice' | 'fill_in_the_blank' | 'short_answer'
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
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const questions = quizData?.questions || [];

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-8 items-center justify-center text-center space-y-4">
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">No Quiz Generated Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Generate an interactive practice quiz directly grounded in your uploaded course materials.
          </p>
        </div>
        <Button 
          onClick={onGenerateNewQuiz}
          className="mt-2 bg-[#550000] hover:bg-[#3d0000] text-white rounded-xl font-medium text-xs px-6 py-2.5 shadow-sm"
        >
          Generate Quiz
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || questions[0];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    setHintText(null);
    setIsSubmitted(false);
    setShowModelAnswer(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsQuizCompleted(true);
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

  if (isQuizCompleted) {
    // Mock summary calculation
    const score = 85; 
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-6 space-y-6 justify-center items-center overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-lg flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Quiz Completed</h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-medium text-lg">
              Score: {score}%
            </div>
          </div>

          <div className="w-full border-t border-gray-100 dark:border-white/[0.06] pt-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Breakdown</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-white/[0.02]">
                  <span className="text-gray-500 dark:text-gray-400">Multiple Choice</span>
                  <span className="font-medium text-gray-900 dark:text-white">3/3</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-white/[0.02]">
                  <span className="text-gray-500 dark:text-gray-400">Fill in Blank</span>
                  <span className="font-medium text-gray-900 dark:text-white">1/2</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-gray-50 dark:bg-white/[0.02] col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Short Answer</span>
                  <span className="font-medium text-gray-900 dark:text-white">1/1 (Partial)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Weak Topics to Review</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <XCircle className="w-4 h-4 text-red-500" /> Protein Synthesis Mechanisms
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <Button onClick={onGenerateNewQuiz} className="w-full rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium">
              Take Another Quiz
            </Button>
            <Button variant="outline" onClick={() => { setIsQuizCompleted(false); setCurrentIndex(0); setUserInputs({}); }} className="w-full rounded-xl border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300">
              Retake This Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] p-6 space-y-6 overflow-y-auto">
      {/* Quiz Header & Progress */}
      <div className="space-y-2 shrink-0">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <button onClick={onGenerateNewQuiz} className="flex items-center gap-1 text-emerald-700 dark:text-emerald-500 hover:opacity-80 text-xs">
            <RefreshCw className="w-3 h-3" /> New Quiz
          </button>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Box */}
      <div className="flex-1 space-y-6 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400">
            {currentQuestion.type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        ) : currentQuestion.type === 'short_answer' ? (
          <div className="flex flex-col gap-3">
            <textarea 
              rows={4}
              placeholder="Write your explanation here..."
              value={userInputs[currentQuestion.id] || ''}
              onChange={(e) => setUserInputs({ ...userInputs, [currentQuestion.id]: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none"
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
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 shadow-2xs'
                    : 'border-gray-200 dark:border-white/[0.1] hover:border-gray-300 dark:hover:border-white/[0.2] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons: Submit / Don't Know */}
        {!isSubmitted && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => { setIsSubmitted(true); setHintText(`Correct Answer: ${currentQuestion.answer}`); }}
              className="rounded-xl border-gray-200 dark:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-300 font-medium"
            >
              Don't know
            </Button>
            <Button 
              onClick={() => { setIsSubmitted(true); }}
              disabled={!userInputs[currentQuestion.id] && currentQuestion.type !== 'multiple_choice'}
              className="rounded-xl bg-gray-700 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium px-6"
            >
              Submit
            </Button>
          </div>
        )}

        {/* Feedback / Explanation Banner */}
        {isSubmitted && currentQuestion.type === 'short_answer' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Qualitative Feedback Card */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  Partially Correct
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">AI Feedback</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> What you demonstrated
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Good understanding of the primary mechanism.</li>
                    <li>Correctly identified the key components involved.</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> What was missing
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Missed mentioning the final step of the pathway.</li>
                    <li>Could be more precise with terminology.</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
                <button 
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Model Answer
                  {showModelAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showModelAnswer && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-white/[0.04]">
                    {currentQuestion.answer}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-medium">
              Continue to Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}

        {isSubmitted && currentQuestion.type !== 'short_answer' && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-100 text-sm space-y-3 animate-in fade-in duration-200">
            <div className="font-semibold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
              <Check className="w-4 h-4" /> Explanation
            </div>
            <p className="text-sm text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed">{currentQuestion.explanation}</p>
            <Button onClick={handleNext} size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Hint Box */}
        {hintText && !isSubmitted && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-100 text-xs leading-relaxed animate-in fade-in duration-150">
            {hintText}
          </div>
        )}

        {/* Supporting Action Pills */}
        {!isSubmitted && (
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button 
              onClick={() => handleHint('hint')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.1] hover:border-gray-300 dark:hover:border-white/[0.2] bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-xs font-medium text-gray-700 dark:text-gray-300 shadow-2xs transition-all"
            >
              <span className="text-gray-400 font-serif">↳</span> Give me a hint
            </button>
            <button 
              onClick={() => handleHint('walkthrough')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.1] hover:border-gray-300 dark:hover:border-white/[0.2] bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-xs font-medium text-gray-700 dark:text-gray-300 shadow-2xs transition-all"
            >
              <span className="text-gray-400 font-serif">↳</span> Walk me through it
            </button>
            <button 
              onClick={() => handleHint('simple')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.1] hover:border-gray-300 dark:hover:border-white/[0.2] bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-xs font-medium text-gray-700 dark:text-gray-300 shadow-2xs transition-all"
            >
              <span className="text-gray-400 font-serif">↳</span> Keep it simple
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

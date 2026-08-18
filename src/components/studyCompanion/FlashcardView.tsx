import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, RefreshCw, Sparkles, PieChart, Activity, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface FlashcardViewProps {
  flashcardData?: { flashcards: Flashcard[] } | null;
  onGenerateNew?: () => void;
}

export function FlashcardView({ flashcardData, onGenerateNew }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, 'hard' | 'good' | 'easy'>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const cards = flashcardData?.flashcards || [];

  if (cards.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-8 items-center justify-center text-center space-y-4">
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">No Flashcards Generated</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Generate front-and-back flashcard pairs for quick review sessions before exams.
          </p>
        </div>
        <Button 
          onClick={onGenerateNew}
          className="mt-2 bg-[#550000] hover:bg-[#3d0000] text-white rounded-xl font-medium text-xs px-6 py-2.5 shadow-sm"
        >
          Generate Flashcards
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(i => i + 1);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleRate = (rating: 'hard' | 'good' | 'easy') => {
    setRatings(prev => ({ ...prev, [currentIndex]: rating }));
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
      } else {
        setIsCompleted(true);
      }
    }, 400);
  };

  const handleReviewWeak = () => {
    // Basic implementation: reset index to first 'hard' card
    const firstHard = cards.findIndex((_, i) => ratings[i] === 'hard');
    if (firstHard !== -1) {
      setCurrentIndex(firstHard);
      setIsCompleted(false);
      setIsFlipped(false);
    }
  };

  const remaining = cards.length - Object.keys(ratings).length;
  const mastered = Object.values(ratings).filter(r => r === 'easy').length;
  const needsReview = Object.values(ratings).filter(r => r === 'hard').length;
  const goodCount = Object.values(ratings).filter(r => r === 'good').length;
  const masteryPercentage = Math.round(((mastered + goodCount) / cards.length) * 100) || 0;

  if (isCompleted) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-6 space-y-6 justify-center items-center">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-lg flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Deck Completed!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{masteryPercentage}% Mastery</p>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 border-y border-gray-100 dark:border-white/[0.06] py-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold text-green-500">{mastered}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Easy</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-gray-100 dark:border-white/[0.06]">
              <span className="text-2xl font-semibold text-amber-500">{goodCount}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Good</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold text-red-500">{needsReview}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Hard</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            {needsReview > 0 && (
              <Button onClick={handleReviewWeak} className="w-full rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium">
                Review Weak Cards
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setRatings({});
              setCurrentIndex(0);
              setIsCompleted(false);
              setIsFlipped(false);
            }} className="w-full rounded-xl border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300">
              Review Again
            </Button>
            <Button variant="ghost" onClick={onGenerateNew} className="w-full text-xs text-gray-500 dark:text-gray-400">
              New Deck
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto pb-20 lg:pb-6">
      
      {/* Session Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
          <span className="text-gray-700 dark:text-gray-300">{remaining} cards remaining</span>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {mastered} mastered
          </span>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
          <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {needsReview} needs review
          </span>
        </div>
        <button onClick={onGenerateNew} className="flex items-center gap-1 text-emerald-700 dark:text-emerald-500 hover:opacity-80 text-xs font-medium">
          <RefreshCw className="w-3 h-3" /> New Cards
        </button>
      </div>

      <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span>Card {currentIndex + 1} of {cards.length}</span>
      </div>

      {/* Flippable Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-md h-64 rounded-3xl border border-gray-200 dark:border-white/[0.1] shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-[#1a1a1a] dark:to-[#111] p-8 flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        >
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
            <span>{isFlipped ? "ANSWER / DEFINITION" : "QUESTION / TERM"}</span>
            <RotateCw className="w-3.5 h-3.5" />
          </div>

          <div className="text-center font-medium text-gray-800 dark:text-gray-100 text-base md:text-lg leading-relaxed my-auto">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>

          <div className="text-center text-xs text-emerald-700 dark:text-emerald-500 font-medium">
            Click to {isFlipped ? "see term" : "reveal answer"}
          </div>
        </div>

        {/* Self-Rating Controls (Shown when flipped) */}
        {isFlipped ? (
          <div className="flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <Button
              variant="outline"
              onClick={() => handleRate('hard')}
              className="px-6 rounded-xl border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Hard
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate('good')}
              className="px-6 rounded-xl border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              Good
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate('easy')}
              className="px-6 rounded-xl border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              Easy
            </Button>
          </div>
        ) : (
          <div className="h-10" /> // Spacer to prevent layout shift
        )}
      </div>

      {/* Card Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        <Button 
          disabled={currentIndex <= 0}
          onClick={handlePrev}
          variant="outline" 
          size="sm"
          className="rounded-xl border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Spacebar to flip</span>
        <Button 
          disabled={currentIndex >= cards.length - 1}
          onClick={handleNext}
          size="sm"
          className="rounded-xl bg-gray-800 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-100"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

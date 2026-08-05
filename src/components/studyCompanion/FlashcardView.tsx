import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
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

  const cards = flashcardData?.flashcards || [];

  if (cards.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white p-8 items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
          <RotateCw className="w-6 h-6" />
        </div>
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-sm">No Flashcards Generated</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Generate front-and-back flashcard pairs for quick review sessions before exams.
          </p>
        </div>
        <Button 
          onClick={onGenerateNew}
          className="mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium text-xs px-6 py-2.5 shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-white" /> Generate Flashcards
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

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <button onClick={onGenerateNew} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs">
          <RefreshCw className="w-3 h-3" /> New Cards
        </button>
      </div>

      {/* Flippable Card Container */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-md h-64 rounded-3xl border border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50 p-8 flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        >
          <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
            <span>{isFlipped ? "ANSWER / DEFINITION" : "QUESTION / TERM"}</span>
            <RotateCw className="w-3.5 h-3.5" />
          </div>

          <div className="text-center font-medium text-gray-800 text-base md:text-lg leading-relaxed my-auto">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>

          <div className="text-center text-xs text-emerald-700 font-medium">
            Click to {isFlipped ? "see term" : "reveal answer"}
          </div>
        </div>
      </div>

      {/* Card Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button 
          disabled={currentIndex <= 0}
          onClick={handlePrev}
          variant="outline" 
          size="sm"
          className="rounded-xl border-gray-200"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-xs font-medium text-gray-400">Spacebar to flip</span>
        <Button 
          disabled={currentIndex >= cards.length - 1}
          onClick={handleNext}
          size="sm"
          className="rounded-xl bg-gray-800 hover:bg-gray-900 text-white"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

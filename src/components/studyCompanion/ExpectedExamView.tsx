import React from 'react';
import { Target, AlertCircle, FileCheck, Printer, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionItem {
  question_num: number;
  type: string;
  question: string;
  pattern_note: string;
  model_answer: string;
}

interface ExpectedExamViewProps {
  examData?: {
    confidence?: string;
    predicted_exam?: QuestionItem[];
  } | null;
  onGenerateExam?: () => void;
  hasPastExamTagged?: boolean;
}

export function ExpectedExamView({ examData, onGenerateExam, hasPastExamTagged = true }: ExpectedExamViewProps) {
  const questions = examData?.predicted_exam || [];

  if (questions.length === 0 && hasPastExamTagged) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-8 items-center justify-center text-center space-y-4">
        <div className="max-w-xs space-y-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">No Predicted Exam Generated</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Extract past exam patterns (jokbo 족보) and predict upcoming test questions grounded in current course slides.
          </p>
        </div>
        <Button 
          onClick={onGenerateExam}
          className="mt-2 bg-[#550000] hover:bg-[#3d0000] text-white rounded-xl font-medium text-xs px-6 py-2.5 shadow-sm"
        >
          Predict Exam Questions
        </Button>
      </div>
    );
  }

  if (!hasPastExamTagged) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111] p-8 items-center justify-center text-center space-y-4">
        <div className="max-w-xs space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Past Exam Tag Required</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Add at least one past exam tagged as <span className="font-semibold text-[#550000] dark:text-rose-400">"past_exam"</span> to unlock predicted questions for this course.
          </p>
        </div>
        <Button size="sm" className="rounded-xl bg-[#550000] hover:bg-[#3d0000] text-white">
          Tag Document as Past Exam
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-700" /> Predicted Midterm Exam Paper
          </h3>
          <p className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> {examData?.confidence || "High Confidence (3 past exams analyzed)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.print()} size="sm" variant="outline" className="rounded-xl border-gray-200 text-xs">
            <Printer className="w-3 h-3 mr-1" /> Print Paper
          </Button>
          <Button onClick={onGenerateExam} size="sm" className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Re-Predict
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {questions.map((q, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">Question {q.question_num} ({q.type})</span>
              <span className="text-2xs bg-amber-100/70 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                {q.pattern_note}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-800 leading-relaxed">
              {q.question}
            </p>

            <details className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 cursor-pointer">
              <summary className="font-semibold text-emerald-700 hover:text-emerald-800">
                View Model Answer & Key Points
              </summary>
              <p className="mt-2 text-gray-700 leading-relaxed border-t border-gray-100 pt-2">
                {q.model_answer}
              </p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}

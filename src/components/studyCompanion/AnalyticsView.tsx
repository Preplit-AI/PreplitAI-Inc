import React from 'react';
import { BarChart2, Activity, Target, CheckCircle2, XCircle } from 'lucide-react';

interface AnalyticsViewProps {
  language?: string;
}

export function AnalyticsView({ language = 'en', hasData = false }: AnalyticsViewProps & { hasData?: boolean }) {
  const weeklyActivity = hasData ? [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 2.8 },
    { day: 'Sat', hours: 0.5 },
    { day: 'Sun', hours: 1.2 },
  ] : [
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ];
  
  const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 1);
  const currentDay = 'Thu';

  const topics: Array<{ name: string; score: number }> = hasData ? [
    { name: 'Cellular Respiration', score: 92 },
    { name: 'Photosynthesis', score: 75 },
  ] : [];

  const weakSpots: Array<{ concept: string; missedCount: number }> = hasData ? [
    { concept: 'Punnett Squares', missedCount: 8 },
  ] : [];

  const recentQuizzes: Array<{ id: number; date: string; topic: string; score: number; questions: number }> = hasData ? [
    { id: 1, date: 'Oct 24', topic: 'Cell Biology', score: 85, questions: 20 },
  ] : [];

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] overflow-y-auto p-6 space-y-8">
      
      {/* Header & Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and identify weak spots</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
          <Activity className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">12 Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Activity Chart */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Study Activity
          </h3>
          <div className="flex items-end justify-between h-32 gap-2 mt-6">
            {weeklyActivity.map((day) => {
              const isCurrent = day.day === currentDay;
              const heightPercent = (day.hours / maxHours) * 100;
              return (
                <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full relative flex items-end justify-center h-full">
                    <div 
                      className={`w-full max-w-[24px] rounded-t-sm transition-all duration-500 ${isCurrent ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Topic Mastery
          </h3>
          <div className="space-y-4">
            {topics.length > 0 ? topics.map(topic => (
              <div key={topic.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">{topic.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{topic.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getProgressColor(topic.score)}`}
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400 italic">No topic mastery logged yet. Complete quizzes to track progress.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Spots */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Needs Review</h3>
          <div className="space-y-3">
            {weakSpots.map(spot => (
              <div key={spot.concept} className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{spot.concept}</div>
                    <div className="text-xs text-red-600 dark:text-red-400">Missed {spot.missedCount} times</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-md bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz History */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Quizzes</h3>
          <div className="border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-[#111]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.06]">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Topic</th>
                  <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {recentQuizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{quiz.date}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white font-medium">{quiz.topic}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${quiz.score >= 80 ? 'text-green-600 dark:text-green-400' : quiz.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {quiz.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
}
